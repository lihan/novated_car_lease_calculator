import type { NormalizedInputs, Rules, CalculationSection } from './types';
import { CURRENT_RULES, assertLegislated } from '../rules';
import { calculateGstBenefit, gstComponent } from './gst';
import { calculateResidualForMonths, calculateLeasePayment } from './lease';
import { calculateRunningCosts } from './running-costs';
import { calculateIncomeTax } from './tax';
import { calculateMedicareLevy } from './medicare';
import { determineEvFbtEligibility } from './fbt';
import { calculateTakeHomeImpact } from './take-home';
import { generateCalculationExplanation, step } from './explanations';
import { validateInputs } from './validation';
import { money, number, percent } from '../utils/format';
export function calculateNovatedLeaseScenario(
  input: NormalizedInputs,
  rules: Rules = CURRENT_RULES,
  termMonths = input.years * 12,
) {
  assertLegislated(rules);
  const errors = validateInputs(input);
  if (errors.length) throw new Error(errors.join(' '));
  const inputs = { ...input };
  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 60)
    throw new Error('Lease duration must be between 1 and 60 whole months.');
  const years = termMonths / 12;
  const gst = calculateGstBenefit(inputs, rules.gst);
  const residual = calculateResidualForMonths(gst.amountFinanced, termMonths, rules.gst.rate);
  const lease = calculateLeasePayment(
    gst.amountFinanced,
    residual.excludingGst,
    inputs.interestRate,
    termMonths,
  );
  const runningCosts = calculateRunningCosts(inputs, rules.gst);
  const eligibility = determineEvFbtEligibility(
    { ...inputs, vehicleValue: gst.purchaseTotal, financialYear: rules.tax.financialYear },
    rules.fbt,
  );
  const adminGross = inputs.adminMonthly * 12;
  const adminGst = gstComponent(adminGross, rules.gst.rate);
  const adminNet = adminGross - adminGst;
  const annualBudget = lease.annual + runningCosts.net + adminNet;
  const fbtBase = gst.eligible; // GST-inclusive car/dealer price, excluding registration and stamp duty.
  const statutoryValue = eligibility.exempt ? 0 : fbtBase * rules.fbt.statutoryRate;
  // Employee contributions are GST-inclusive. They fund the package net of output GST.
  const employeeContribution = eligibility.exempt ? 0 : statutoryValue;
  const contributionGst = gstComponent(employeeContribution, rules.gst.rate);
  const requestedPreTax = Math.max(0, annualBudget - employeeContribution + contributionGst);
  const preTax = Math.min(inputs.salary, requestedPreTax);
  const shortfall = requestedPreTax - preTax;
  const postTax = employeeContribution + shortfall;
  // A contribution exceeding actual budget is not a useful package: warn, never claim a refund.
  const excessContribution = Math.max(0, employeeContribution - contributionGst - annualBudget);
  const grossAnnual = preTax + postTax;
  const taxBefore = calculateIncomeTax(inputs.salary, rules.tax);
  const taxableAfter = inputs.salary - preTax;
  const taxAfter = calculateIncomeTax(taxableAfter, rules.tax);
  const medicareInput = {
    familyStatus: inputs.familyStatus,
    dependants: inputs.dependants,
    spouseIncome: inputs.spouseIncome,
    financialYear: rules.tax.financialYear,
  };
  const medicareBefore = calculateMedicareLevy(
    { ...medicareInput, taxableIncome: inputs.salary },
    rules.medicare,
  );
  const medicareAfter = calculateMedicareLevy(
    { ...medicareInput, taxableIncome: taxableAfter },
    rules.medicare,
  );
  const takeHomeImpact = calculateTakeHomeImpact(
    inputs.salary,
    preTax,
    postTax,
    taxBefore.value,
    taxAfter.value,
    medicareBefore.value,
    medicareAfter.value,
  );
  // Sequential attribution, proportional allocation of ECM/unfunded deductions across cost categories.
  const fraction = annualBudget === 0 ? 0 : preTax / annualBudget;
  const vehicleDeduction = (lease.annual + adminNet) * fraction;
  const energyDeduction = runningCosts.components[0].net * fraction;
  const otherDeduction = Math.max(0, preTax - vehicleDeduction - energyDeduction);
  const taxAfterVehicle = calculateIncomeTax(
    Math.max(0, inputs.salary - vehicleDeduction),
    rules.tax,
  );
  const taxAfterEnergy = calculateIncomeTax(
    Math.max(0, inputs.salary - vehicleDeduction - energyDeduction),
    rules.tax,
  );
  const vehicleIncomeTax = taxBefore.value - taxAfterVehicle.value;
  const energyIncomeTax = taxAfterVehicle.value - taxAfterEnergy.value;
  const otherIncomeTax = taxAfterEnergy.value - taxAfter.value;
  const incomeTax = taxBefore.value - taxAfter.value;
  const medicare = medicareBefore.value - medicareAfter.value;
  const runningCostGSTSaving = runningCosts.gst;
  const gstNetLifetime =
    gst.recoverableVehicleGST +
    (runningCostGSTSaving + adminGst - contributionGst) * years -
    residual.gst;
  const taxLifetime = (incomeTax + medicare) * years;
  const totalBenefit = taxLifetime + gstNetLifetime;
  const taxSavingSteps = [
    step(
      'tax-vehicle-saving',
      'Vehicle / lease income-tax saving',
      'Sequential attribution starts with finance and administration. For ECM, pre-tax deductions are allocated in proportion to net costs.',
      'Tax on original salary − tax after vehicle deduction',
      [
        ['Vehicle and admin deduction', vehicleDeduction],
        ['Original tax', taxBefore.value],
        ['Tax after vehicle deduction', taxAfterVehicle.value],
      ],
      `${money(taxBefore.value)} − ${money(taxAfterVehicle.value)}`,
      vehicleIncomeTax,
    ),
    step(
      'tax-energy-saving',
      'Charging / fuel income-tax saving',
      'Next, apply the energy deduction through the full progressive tax engine.',
      'Tax after vehicle deduction − tax after energy deduction',
      [
        ['Energy deduction', energyDeduction],
        ['Tax after vehicle', taxAfterVehicle.value],
        ['Tax after energy', taxAfterEnergy.value],
      ],
      `${money(taxAfterVehicle.value)} − ${money(taxAfterEnergy.value)}`,
      energyIncomeTax,
    ),
    step(
      'tax-other-saving',
      'Other running-cost income-tax saving',
      'The remaining deduction completes the reconciliation. Allocation order affects the labels but never total tax saved.',
      'Tax after energy deduction − final income tax',
      [
        ['Other running-cost deduction', otherDeduction],
        ['Tax after energy', taxAfterEnergy.value],
        ['Final income tax', taxAfter.value],
      ],
      `${money(taxAfterEnergy.value)} − ${money(taxAfter.value)}`,
      otherIncomeTax,
    ),
    step(
      'tax-saving',
      'Total annual income-tax saving',
      'Tax is calculated twice across all bands; no single marginal-rate shortcut is used.',
      'Income tax before − income tax after',
      [
        ['Before', taxBefore.value],
        ['After', taxAfter.value],
      ],
      `${money(taxBefore.value)} − ${money(taxAfter.value)}`,
      incomeTax,
    ),
    step(
      'medicare-saving',
      'Annual Medicare levy saving',
      'Levy differences are separate from income tax.',
      'Medicare before − Medicare after',
      [
        ['Before', medicareBefore.value],
        ['After', medicareAfter.value],
      ],
      `${money(medicareBefore.value)} − ${money(medicareAfter.value)}`,
      medicare,
    ),
  ];
  const savingSteps = [
    ...taxSavingSteps,
    step(
      'gst-net',
      'Net GST benefit across the lease',
      'Acquisition, running and administration credits are offset by GST on employee contributions and the final private residual purchase. Rental GST credits neutralise rental invoice GST; they are not added again as a separate saving.',
      'Vehicle credit + (running credits + admin credits − contribution GST) × years − residual GST',
      [
        ['Vehicle credit', gst.recoverableVehicleGST],
        ['Annual running credits', runningCostGSTSaving],
        ['Annual admin credits', adminGst],
        ['Annual contribution GST', contributionGst],
        ['Years', years, number(years)],
        ['Residual GST', residual.gst],
      ],
      `${money(gst.recoverableVehicleGST)} + (${money(runningCostGSTSaving)} + ${money(adminGst)} − ${money(contributionGst)}) × ${years} − ${money(residual.gst)}`,
      gstNetLifetime,
    ),
    step(
      'benefit-total',
      'Total estimated tax + GST benefit',
      'An entire-lease figure. It can be negative. Finance-rate effects are compared separately.',
      'Annual income-tax and Medicare savings × years + net GST benefit',
      [
        ['Annual income-tax saving', incomeTax],
        ['Annual Medicare saving', medicare],
        ['Years', years, number(years)],
        ['Net GST benefit', gstNetLifetime],
      ],
      `(${money(incomeTax)} + ${money(medicare)}) × ${years} + ${money(gstNetLifetime)}`,
      totalBenefit,
    ),
  ];
  const outOfPocket =
    takeHomeImpact.annual * years + residual.payout + inputs.upfrontAfterTax + inputs.endAfterTax;
  const effectiveMonthly = outOfPocket / lease.months;
  const totalSteps = [
    step(
      'total-out-of-pocket',
      'Total out-of-pocket cost',
      'Take-home reduction already includes finance, running costs and administration. Do not add those expenses again. The final residual is added once; the car is retained, with no resale proceeds assumed.',
      'Annual take-home decrease × years + final residual + after-tax upfront and end costs',
      [
        ['Annual take-home decrease', takeHomeImpact.annual],
        ['Years', years, number(years)],
        ['Residual including GST', residual.payout],
        ['Upfront after tax', inputs.upfrontAfterTax],
        ['End costs after tax', inputs.endAfterTax],
      ],
      `${money(takeHomeImpact.annual)} × ${years} + ${money(residual.payout)} + ${money(inputs.upfrontAfterTax)} + ${money(inputs.endAfterTax)}`,
      outOfPocket,
    ),
    step(
      'effective-monthly',
      'Effective monthly vehicle cost',
      'A budgeting equivalent that includes the final balloon. The residual is still payable as a lump sum.',
      'Total out-of-pocket cost ÷ months',
      [
        ['Total out-of-pocket', outOfPocket],
        ['Months', lease.months, number(lease.months)],
      ],
      `${money(outOfPocket)} ÷ ${lease.months}`,
      effectiveMonthly,
    ),
  ];
  const adminSteps = [
    step(
      'admin-annual',
      'Annual administration budget',
      'The entered monthly fee includes GST; its eligible GST is recovered by the employer.',
      'Monthly administration × 12 − administration GST credit',
      [
        ['Monthly administration', inputs.adminMonthly],
        ['Annual GST credit', adminGst],
      ],
      `${money(inputs.adminMonthly)} × 12 − ${money(adminGst)}`,
      adminNet,
    ),
  ];
  const packagingSteps = [
    step(
      'package-budget',
      'Annual net salary-package budget',
      'Finance rentals, administration and running expenses net of recoverable GST.',
      'Finance + administration + running costs',
      [
        ['Annual finance', lease.annual],
        ['Administration net', adminNet],
        ['Running costs net', runningCosts.net],
      ],
      `${money(lease.annual)} + ${money(adminNet)} + ${money(runningCosts.net)}`,
      annualBudget,
    ),
    step(
      'ecm',
      'After-tax employee contribution',
      eligibility.exempt
        ? 'No employee contribution is required in this exempt-EV model.'
        : 'Statutory method estimate for a full FBT year. A GST-inclusive employee contribution offsets the car fringe benefit. Assumes no base-value reduction, no business-use adjustment and no part-year availability.',
      'Exempt EV: zero; otherwise GST-inclusive FBT base × statutory rate',
      [
        ['FBT base value', fbtBase],
        ['Statutory rate', rules.fbt.statutoryRate, percent(rules.fbt.statutoryRate)],
      ],
      eligibility.exempt
        ? 'Exempt vehicle → $0.00'
        : `${money(fbtBase)} × ${percent(rules.fbt.statutoryRate)}`,
      employeeContribution,
    ),
    step(
      'package-pretax',
      'Eligible annual pre-tax deduction',
      'The employee contribution funds expenses net of its output GST. Pre-tax deductions cannot exceed salary; any shortfall is an after-tax expense.',
      'min(salary, max(0, net budget − contribution + contribution GST))',
      [
        ['Salary', inputs.salary],
        ['Net budget', annualBudget],
        ['Employee contribution', employeeContribution],
        ['Contribution GST', contributionGst],
      ],
      `min(${money(inputs.salary)}, max(0, ${money(annualBudget)} − ${money(employeeContribution)} + ${money(contributionGst)}))`,
      preTax,
    ),
    step(
      'package-posttax',
      'Annual post-tax deduction',
      'Includes the FBT employee contribution and any package cost that cannot be funded from gross salary.',
      'Employee contribution + unfunded pre-tax shortfall',
      [
        ['Contribution', employeeContribution],
        ['Unfunded shortfall', shortfall],
      ],
      `${money(employeeContribution)} + ${money(shortfall)}`,
      postTax,
    ),
    step(
      'package-gross',
      'Gross annual package deduction',
      'Total payroll deductions before the benefit of income-tax and Medicare savings.',
      'Pre-tax deduction + post-tax deduction',
      [
        ['Pre-tax', preTax],
        ['Post-tax', postTax],
      ],
      `${money(preTax)} + ${money(postTax)}`,
      grossAnnual,
    ),
    step(
      'package-monthly',
      'Gross monthly package deduction',
      'The payroll deduction is larger than the net take-home change when tax is saved.',
      'Annual package deduction ÷ 12',
      [['Annual deduction', grossAnnual]],
      `${money(grossAnnual)} ÷ 12`,
      grossAnnual / 12,
    ),
  ];
  const taxableBeforeStep = step(
    'taxable-before',
    'Taxable salary before lease',
    'Gross salary excluding employer superannuation. Other taxable income, deductions and offsets apart from LITO are not included.',
    'Taxable salary = entered annual salary',
    [['Salary', inputs.salary]],
    money(inputs.salary),
    inputs.salary,
  );
  const taxableAfterStep = step(
    'taxable-after',
    'Taxable salary after lease',
    'Only the pre-tax part reduces taxable salary.',
    'Original salary − pre-tax deduction',
    [
      ['Original salary', inputs.salary],
      ['Pre-tax deduction', preTax],
    ],
    `${money(inputs.salary)} − ${money(preTax)}`,
    taxableAfter,
  );
  const explanations: CalculationSection[] = generateCalculationExplanation([
    { id: 'purchase', title: 'Vehicle purchase price', steps: gst.steps.slice(0, 1) },
    { id: 'gst', title: 'Vehicle GST treatment', steps: gst.steps.slice(1, 4) },
    { id: 'financed', title: 'Amount financed', steps: gst.steps.slice(4) },
    { id: 'residual', title: 'Residual calculation', steps: residual.steps },
    { id: 'finance', title: 'Finance lease payments', steps: lease.steps },
    { id: 'energy', title: 'Electricity / fuel usage', steps: runningCosts.energy.steps },
    { id: 'running', title: 'Running expenses', steps: runningCosts.steps },
    { id: 'admin', title: 'Administration fees', steps: adminSteps },
    { id: 'package', title: 'Salary packaging and FBT treatment', steps: packagingSteps },
    { id: 'taxable-before', title: 'Taxable salary before lease', steps: [taxableBeforeStep] },
    { id: 'tax-before', title: 'Income tax before lease', steps: taxBefore.steps },
    { id: 'medicare-before', title: 'Medicare before lease', steps: medicareBefore.steps },
    { id: 'taxable-after', title: 'Taxable salary after lease', steps: [taxableAfterStep] },
    { id: 'tax-after', title: 'Income tax after lease', steps: taxAfter.steps },
    { id: 'medicare-after', title: 'Medicare after lease', steps: medicareAfter.steps },
    { id: 'tax-savings', title: 'Income-tax and Medicare savings', steps: taxSavingSteps },
    {
      id: 'gst-savings',
      title: 'GST and total benefit',
      steps: savingSteps.slice(taxSavingSteps.length),
    },
    { id: 'gross', title: 'Gross package deduction', steps: packagingSteps.slice(-2) },
    { id: 'take-home', title: 'Take-home pay impact', steps: takeHomeImpact.steps },
    { id: 'payout', title: 'Final after-tax residual payment', steps: residual.steps.slice(-1) },
    { id: 'total', title: 'Total out-of-pocket cost', steps: totalSteps },
  ]);
  const warnings = [
    'Projection holds FY2026–27 tax rules, salary, costs and FBT treatment constant across the whole lease. Future tax cuts, indexation and law changes are not applied.',
    'GST car limit and credit cap use brief-supplied values; confirm the current ATO thresholds with your provider.',
    'Insurance is treated as GST-bearing except the non-GST amount you enter. Check duties and levies on your insurance invoice.',
    'This is an estimate, not a provider quote. Employer GST entitlement, rental-credit restrictions, residual cost basis and eligible expenses must be confirmed.',
  ];
  if (!eligibility.exempt)
    warnings.unshift(
      `${eligibility.status}: ${eligibility.explanation} Results use a full-year statutory employee contribution estimate, not the exempt-EV treatment.`,
    );
  if (inputs.helpDebt)
    warnings.unshift(
      'HELP/HECS repayments are NOT included. Reportable fringe benefits may increase repayment income even for an FBT-exempt EV; your actual pay impact may differ.',
    );
  if (!inputs.privateHospitalCover)
    warnings.unshift(
      'Medicare levy surcharge is NOT included. Reportable fringe benefits may affect surcharge income; the standard Medicare levy shown is separate.',
    );
  if (inputs.vehicleType === 'PHEV')
    warnings.push(
      'PHEV running costs use a fuel-only approximation. Mixed electricity and petrol use requires a tailored budget.',
    );
  if (inputs.interestRate < 7 || inputs.interestRate > 12)
    warnings.push(
      'The entered interest rate is outside the typical 7–12% range. It is used as entered.',
    );
  if (shortfall > 0 || takeHomeImpact.after < 0)
    warnings.unshift(
      'The package exceeds available salary or take-home pay. This arrangement is not affordable from the entered salary; a provider may not approve it.',
    );
  if (excessContribution > 0)
    warnings.unshift(
      'The statutory employee contribution exceeds the net package cost. The estimate includes the full contribution with no refund; seek a tailored provider quote.',
    );
  if (inputs.familyStatus === 'single' && inputs.dependants > 0)
    warnings.push(
      'For a qualifying sole-parent Medicare reduction, choose family status. Single status uses individual levy thresholds.',
    );
  return {
    inputs,
    rules,
    lease,
    residual,
    runningCosts,
    gst: { ...gst, runningCostGSTSaving },
    eligibility,
    taxBefore,
    taxAfter,
    medicareBefore,
    medicareAfter,
    packaging: {
      annualBudget,
      preTax,
      postTax,
      grossAnnual,
      grossMonthly: grossAnnual / 12,
      employeeContribution,
      contributionGst,
      excessContribution,
      steps: packagingSteps,
    },
    admin: {
      gross: adminGross,
      gst: adminGst,
      net: adminNet,
      lifetime: adminNet * years,
      steps: adminSteps,
    },
    savings: {
      monthlyTaxAndMedicare: (incomeTax + medicare) / 12,
      incomeTax,
      medicare,
      vehicleIncomeTax,
      energyIncomeTax,
      otherIncomeTax,
      taxLifetime,
      gstNetLifetime,
      totalBenefit,
      steps: savingSteps,
    },
    takeHomeImpact,
    totalCost: {
      value: outOfPocket,
      outOfPocket,
      effectiveMonthly,
      takeHomeDuringLease: takeHomeImpact.annual * years,
      steps: totalSteps,
    },
    explanations,
    warnings,
  };
}
export type NovatedLeaseScenario = ReturnType<typeof calculateNovatedLeaseScenario>;
