import { describe, expect, it } from 'vitest';
import { calculateIncomeTax } from '../calculator/tax';
import { calculateMedicareLevy } from '../calculator/medicare';
import {
  calculateLeasePayment,
  calculateResidual,
  calculateResidualForMonths,
} from '../calculator/lease';
import { calculateEvRunningCost, calculateFuelRunningCost } from '../calculator/running-costs';
import { calculateGstBenefit } from '../calculator/gst';
import { determineEvFbtEligibility } from '../calculator/fbt';
import { calculateNovatedLeaseScenario } from '../calculator/scenario';
import {
  calculatePotentialSuperImpact,
  SUPER_GUARANTEE_MAXIMUM_BASE,
  SUPER_GUARANTEE_MAXIMUM_ANNUAL_PAYMENT,
  SUPER_GUARANTEE_RATE,
} from '../calculator/superannuation';
import {
  calculateLeaseTermOutlook,
  calculateScenarioCases,
  compareAfterTax,
  compareCashPurchase,
  compareLeaseDurations,
} from '../calculator/comparison';
import { DEFAULT_INPUTS } from '../calculator/defaults';
import { parseNumericInput, validateInputs } from '../calculator/validation';
import { CURRENT_RULES } from '../rules';
import { ATO_CAR_RESIDUALS } from '../rules/lease/ato-residuals';
import { money } from '../utils/format';
import type { LeaseYears, NormalizedInputs } from '../calculator/types';
const scenario = (changes: Partial<NormalizedInputs> = {}) =>
  calculateNovatedLeaseScenario({ ...DEFAULT_INPUTS, ...changes });
const levy = (
  taxableIncome: number,
  changes: Partial<Parameters<typeof calculateMedicareLevy>[0]> = {},
) =>
  calculateMedicareLevy({
    taxableIncome,
    financialYear: '2026-27',
    familyStatus: 'single',
    dependants: 0,
    spouseIncome: 0,
    ...changes,
  });

describe('demo defaults', () => {
  it('uses the requested running-cost and interest values', () => {
    expect(DEFAULT_INPUTS.salary).toBe(150000);
    expect(DEFAULT_INPUTS.annualRegistration).toBe(84);
    expect(DEFAULT_INPUTS.annualCtp).toBe(632);
    expect(DEFAULT_INPUTS.insurance).toBe(3000);
    expect(DEFAULT_INPUTS.servicing).toBe(200);
    expect(DEFAULT_INPUTS.interestRate).toBe(11);
    expect(DEFAULT_INPUTS.adminMonthly).toBe(31);
  });
});

describe('potential super impact', () => {
  it('estimates reduced employer super separately from the lease totals', () => {
    const s = scenario();
    const impact = calculatePotentialSuperImpact(
      s.inputs.salary,
      s.packaging.preTax,
      s.inputs.years,
    );

    expect(impact.rate).toBe(SUPER_GUARANTEE_RATE);
    expect(impact.maximumContributionBase).toBe(SUPER_GUARANTEE_MAXIMUM_BASE);
    expect(impact.maximumAnnualPayment).toBe(SUPER_GUARANTEE_MAXIMUM_ANNUAL_PAYMENT);
    expect(impact.annualLoss).toBeCloseTo(s.packaging.preTax * SUPER_GUARANTEE_RATE, 8);
    expect(impact.termLoss).toBeCloseTo(impact.annualLoss * s.inputs.years, 8);
    expect(s.totalCost.outOfPocket).toBeCloseTo(
      s.takeHomeImpact.annual * s.inputs.years + s.residual.payout,
      7,
    );
  });

  it('stops showing a loss when both salary bases are above the annual cap', () => {
    const impact = calculatePotentialSuperImpact(300000, 20000, 3);

    expect(impact.superableBaseBefore).toBe(SUPER_GUARANTEE_MAXIMUM_BASE);
    expect(impact.superableBaseAfter).toBe(SUPER_GUARANTEE_MAXIMUM_BASE);
    expect(impact.annualLoss).toBe(0);
    expect(impact.termLoss).toBe(0);
  });

  it('only counts the portion that crosses the annual cap', () => {
    const impact = calculatePotentialSuperImpact(280000, 20000, 1);

    expect(impact.superableBaseBefore).toBe(SUPER_GUARANTEE_MAXIMUM_BASE);
    expect(impact.superableBaseAfter).toBe(260000);
    expect(impact.annualLoss).toBeCloseTo((SUPER_GUARANTEE_MAXIMUM_BASE - 260000) * 0.12, 8);
  });
});

describe('progressive resident income tax', () => {
  it.each([
    [0, 0],
    [18200, 0],
    [45000, 4020],
    [135000, 31020],
    [190000, 51370],
    [200000, 55870],
  ])('gross tax at %i is %i', (income, expected) =>
    expect(calculateIncomeTax(income).grossTax).toBeCloseTo(expected, 8),
  );
  it.each([
    [18200, 0, 0.15],
    [45000, 0.15, 0.3],
    [135000, 0.3, 0.37],
    [190000, 0.37, 0.45],
  ])('both sides of boundary %i', (boundary, belowRate, aboveRate) => {
    const at = calculateIncomeTax(boundary).grossTax;
    expect(at - calculateIncomeTax(boundary - 1).grossTax).toBeCloseTo(belowRate, 8);
    expect(calculateIncomeTax(boundary + 1).grossTax - at).toBeCloseTo(aboveRate, 8);
  });
  it('crosses the top bracket without a marginal-rate shortcut', () => {
    expect(calculateIncomeTax(200000).value - calculateIncomeTax(180000).value).toBeCloseTo(
      8200,
      8,
    );
  });
  it.each([
    [18200, 0],
    [30000, 700],
    [37500, 700],
    [45000, 325],
    [60000, 100],
    [66667, 0],
  ])('LITO at %i', (income, offset) =>
    expect(calculateIncomeTax(income).offset).toBeCloseTo(offset, 8),
  );
  it('LITO cannot refund income tax', () => expect(calculateIncomeTax(18500).value).toBe(0));
  it('tax step reconciles', () => {
    const t = calculateIncomeTax(200000);
    expect(t.steps.at(-1)?.result).toBe(t.value);
    expect(t.steps.slice(0, 5).reduce((a, b) => a + b.result, 0)).toBe(t.grossTax);
  });
});

describe('Medicare levy independently of tax', () => {
  it.each([
    [0, 0],
    [28011, 0],
    [28012, 0.1],
    [30000, 198.9],
    [35013, 700.2],
    [35014, 700.28],
    [200000, 4000],
  ])('income %i -> %i', (income, expected) => expect(levy(income).value).toBeCloseTo(expected, 8));
  it('exempts a qualifying low-income family', () =>
    expect(levy(40000, { familyStatus: 'family' }).value).toBe(0));
  it('family phase-in with one earning spouse', () =>
    expect(levy(50000, { familyStatus: 'family' }).value).toBeCloseTo(276.2, 8));
  it('dependent threshold', () =>
    expect(levy(50000, { familyStatus: 'family', dependants: 1 }).value).toBe(0));
  it('allocates reduction between spouses', () => {
    const first = levy(30000, { familyStatus: 'family', spouseIncome: 29000 });
    const second = levy(29000, { familyStatus: 'family', spouseIncome: 30000 });
    const reduction = 47238 * 0.02 - (59000 - 47238) * 0.08;
    expect(first.value + second.value).toBeCloseTo(
      levy(30000).value + levy(29000).value - reduction,
      8,
    );
  });
  it('does not confuse hospital cover with Medicare exemption', () =>
    expect(scenario({ privateHospitalCover: false }).medicareBefore.value).toBe(
      scenario().medicareBefore.value,
    ));
});

describe('residual and finance model', () => {
  it.each([1, 2, 3, 4, 5] as LeaseYears[])('year %i residual and GST', (years) => {
    const r = calculateResidual(70000, years);
    expect(r.excludingGst).toBe(70000 * ATO_CAR_RESIDUALS[years]);
    expect(r.gst).toBeCloseTo(r.excludingGst * 0.1, 8);
    expect(r.payout).toBe(r.excludingGst + r.gst);
    expect(r.steps.at(-1)?.result).toBe(r.payout);
  });
  it('known three-year residual', () =>
    expect(calculateResidual(70000, 3).excludingGst).toBeCloseTo(32816, 8));
  it('supports monthly terms and preserves annual ATO percentages', () => {
    expect(calculateResidualForMonths(70000, 18).rate).toBe(0.6094);
    expect(calculateResidualForMonths(70000, 36).rate).toBe(ATO_CAR_RESIDUALS[3]);
    expect(() => calculateResidualForMonths(70000, 61)).toThrow();
  });
  it('zero interest handles principal less residual', () => {
    const l = calculateLeasePayment(60000, 30000, 0, 36);
    expect(l.monthly).toBeCloseTo(833.3333333333334, 8);
    expect(l.interest).toBeCloseTo(0, 8);
  });
  it.each([0, 0.000001, 7, 9, 12, 25, 100])(
    'amortises exactly to balloon at %i percent',
    (rate) => {
      const l = calculateLeasePayment(63647, 29837.7136, rate, 36);
      let balance = 63647;
      for (let m = 0; m < 36; m++) balance = balance * (1 + rate / 1200) - l.monthly;
      expect(balance).toBeCloseTo(29837.7136, 5);
      expect(l.interest).toBeCloseTo(l.totalPayments + 29837.7136 - 63647, 8);
      expect(l.steps.find((x) => x.id === 'finance-monthly')?.result).toBe(l.monthly);
    },
  );
  it('monthly payments fall as duration lengthens at demo rate', () =>
    expect(scenario({ years: 5 }).lease.monthly).toBeLessThan(
      scenario({ years: 1 }).lease.monthly,
    ));
});

describe('energy and GST', () => {
  it('EV usage and price', () => {
    const e = calculateEvRunningCost(15000, 17, 0.3);
    expect(e.usage).toBe(2550);
    expect(e.annual).toBe(765);
    expect(e.monthly).toBe(63.75);
  });
  it('fuel usage and price', () => {
    const e = calculateFuelRunningCost(15000, 8, 1.9);
    expect(e.usage).toBe(1200);
    expect(e.annual).toBe(2280);
  });
  it('vehicle GST below cap', () =>
    expect(
      calculateGstBenefit({ ...DEFAULT_INPUTS, carPrice: 55000 }).recoverableVehicleGST,
    ).toBeCloseTo(5000, 8));
  it('cap binds above threshold', () => {
    const g = calculateGstBenefit({ ...DEFAULT_INPUTS, carPrice: 70000 });
    expect(g.recoverableVehicleGST).toBe(6353);
    expect(g.nonRecoverableVehicleGST).toBeCloseTo(70000 / 11 - 6353, 8);
    expect(g.amountFinanced).toBe(63647);
  });
  it('cap boundary', () =>
    expect(
      calculateGstBenefit({ ...DEFAULT_INPUTS, carPrice: 69883 }).recoverableVehicleGST,
    ).toBeCloseTo(6353, 8));
  it('non-GST charges do not create credits', () => {
    const g = calculateGstBenefit({
      ...DEFAULT_INPUTS,
      carPrice: 50000,
      advancedPrice: true,
      purchaseRegistration: 800,
      stampDuty: 3000,
      dealerCharges: 1100,
      otherNonGst: 100,
    });
    expect(g.purchaseTotal).toBe(55000);
    expect(g.includedGst).toBeCloseTo(51100 / 11, 8);
    expect(g.amountFinanced).toBeCloseTo(55000 - 51100 / 11, 8);
  });
  it('simple mode ignores inactive advanced amounts', () =>
    expect(calculateGstBenefit({ ...DEFAULT_INPUTS, stampDuty: 3000 }).purchaseTotal).toBe(
      DEFAULT_INPUTS.carPrice,
    ));
  it('no home electricity GST claim by default', () =>
    expect(scenario().runningCosts.components[0].gst).toBe(0));
  it('substantiated electricity GST credit', () =>
    expect(scenario({ energyGstEligible: true }).runningCosts.components[0].gst).toBeCloseTo(
      (DEFAULT_INPUTS.annualKm * DEFAULT_INPUTS.evEfficiency * DEFAULT_INPUTS.electricityPrice) /
        1100,
      8,
    ));
  it('insurance duties excluded', () =>
    expect(scenario({ insuranceNonGst: 300 }).runningCosts.components[1].gst).toBeCloseTo(
      2700 / 11,
      8,
    ));
  it('registration is not treated as taxable supply', () =>
    expect(scenario({ annualRegistration: 800 }).runningCosts.components[2].gst).toBe(0));
  it('keeps CTP separate and conservatively excludes its GST credit', () => {
    const ctp = scenario().runningCosts.components.find((component) => component.id === 'ctp');
    expect(ctp?.gross).toBe(632);
    expect(ctp?.gst).toBe(0);
  });
});

describe('FBT eligibility, dates and law status', () => {
  const eligible = {
    vehicleType: 'BEV' as const,
    vehicleValue: 70000,
    financialYear: '2026-27',
    firstHeldAndUsedDate: '2026-09-12',
    leaseStartDate: '2026-09-12',
    lctPayable: 'no' as const,
  };
  it('eligible demo', () =>
    expect(determineEvFbtEligibility(eligible).status).toBe('Likely FBT exempt'));
  it('historical LCT disqualifies', () =>
    expect(determineEvFbtEligibility({ ...eligible, lctPayable: 'yes' }).exempt).toBe(false));
  it('unknown LCT cannot imply exemption', () =>
    expect(determineEvFbtEligibility({ ...eligible, lctPayable: 'unknown' }).status).toBe(
      'Unable to determine',
    ));
  it('pre-July 2022 use disqualifies', () =>
    expect(
      determineEvFbtEligibility({ ...eligible, firstHeldAndUsedDate: '2022-06-30' }).status,
    ).toBe('Not FBT exempt'));
  it('missing date cannot imply exemption', () =>
    expect(determineEvFbtEligibility({ ...eligible, firstHeldAndUsedDate: '' }).status).toBe(
      'Unable to determine',
    ));
  it('first use after lease start needs confirmation', () =>
    expect(
      determineEvFbtEligibility({ ...eligible, firstHeldAndUsedDate: '2026-10-01' }).status,
    ).toBe('Unable to determine'));
  it('new PHEV lease is not exempt', () =>
    expect(determineEvFbtEligibility({ ...eligible, vehicleType: 'PHEV' }).status).toBe(
      'Not FBT exempt',
    ));
  it('historical PHEV transitional case needs assessment', () =>
    expect(
      determineEvFbtEligibility({
        ...eligible,
        vehicleType: 'PHEV',
        firstHeldAndUsedDate: '2024-01-01',
        leaseStartDate: '2024-01-01',
      }).status,
    ).toBe('Unable to determine'));
  it.each(['tax', 'medicare', 'gst', 'fbt'] as const)('rejects proposed %s rules', (key) => {
    expect(() =>
      calculateNovatedLeaseScenario(DEFAULT_INPUTS, {
        ...CURRENT_RULES,
        [key]: { ...CURRENT_RULES[key], status: 'proposed' },
      }),
    ).toThrow(/Proposed/);
  });
  it('rejects mixed tax years', () =>
    expect(() =>
      calculateNovatedLeaseScenario(DEFAULT_INPUTS, {
        ...CURRENT_RULES,
        gst: { ...CURRENT_RULES.gst, financialYear: '2027-28' },
      }),
    ).toThrow(/years/));
});

describe('whole-scenario accounting', () => {
  it.each([
    {},
    { years: 1 },
    { years: 5 },
    { salary: 10000 },
    { salary: 0 },
    { interestRate: 0 },
    { salary: 45000 },
    { salary: 135000 },
    { salary: 190000 },
    { carPrice: 0 },
    { vehicleType: 'petrol', energyGstEligible: true },
    { vehicleType: 'PHEV' },
    { lctPayable: 'unknown' },
    {
      vehicleType: 'petrol',
      carPrice: 250000,
      years: 5,
      interestRate: 0,
      insurance: 0,
      annualKm: 0,
      adminMonthly: 0,
    },
    {
      advancedPrice: true,
      stampDuty: 3000,
      dealerCharges: 1200,
      purchaseRegistration: 800,
      annualRegistration: 800,
      upfrontAfterTax: 500,
      endAfterTax: 600,
    },
    { familyStatus: 'family', salary: 55000, spouseIncome: 25000, dependants: 2 },
  ] as Partial<NormalizedInputs>[])('reconciles costs, savings and baseline for %j', (changes) => {
    const s = scenario(changes);
    const c = compareAfterTax(s);
    expect(s.takeHomeImpact.annual).toBeCloseTo(
      s.packaging.grossAnnual - s.savings.incomeTax - s.savings.medicare,
      7,
    );
    expect(s.totalCost.outOfPocket).toBeCloseTo(
      s.takeHomeImpact.annual * s.inputs.years +
        s.residual.payout +
        s.inputs.upfrontAfterTax +
        s.inputs.endAfterTax,
      7,
    );
    expect(
      s.totalCost.outOfPocket -
        s.totalCost.takeHomeDuringLease -
        s.inputs.upfrontAfterTax -
        s.inputs.endAfterTax,
    ).toBeCloseTo(s.residual.payout, 7);
    expect(
      s.savings.vehicleIncomeTax + s.savings.energyIncomeTax + s.savings.otherIncomeTax,
    ).toBeCloseTo(s.savings.incomeTax, 7);
    expect(c.advantage).toBeCloseTo(
      s.savings.totalBenefit +
        c.interestDifference -
        s.packaging.excessContribution * s.inputs.years,
      7,
    );
    expect(c.cumulative.at(-1)?.novated).toBeCloseTo(s.totalCost.outOfPocket, 7);
    expect(c.cumulative.at(-1)?.afterTax).toBeCloseTo(c.outOfPocket, 7);
    expect(c.cumulative.at(-1)?.taxSaving).toBeCloseTo(
      s.savings.monthlyTaxAndMedicare * s.lease.months,
      7,
    );
    expect(c.rows.at(-1)?.label).toBe('Total out-of-pocket');
    expect(c.rows.find((row) => row.label === 'Total paid, before tax savings')).toBeUndefined();
    expect(c.steps.find((step) => step.id === 'comparison-gross')).toBeUndefined();
    expect(s.explanations).toHaveLength(21);
    s.explanations.forEach((section) =>
      section.steps.forEach((step) => {
        expect(Number.isFinite(step.result)).toBe(true);
        expect(step.formula.length).toBeGreaterThan(0);
        expect(step.inputs.length).toBeGreaterThan(0);
      }),
    );
  });
  it('ECM includes GST remittance', () => {
    const s = scenario({ vehicleType: 'petrol' });
    const contribution = DEFAULT_INPUTS.carPrice * 0.2;
    expect(s.packaging.employeeContribution).toBe(contribution);
    expect(s.packaging.contributionGst).toBeCloseTo(contribution / 11, 8);
    expect(s.packaging.preTax + s.packaging.postTax).toBeCloseTo(
      s.packaging.annualBudget + contribution / 11,
      8,
    );
  });
  it('comparison never subtracts savings twice', () => {
    const s = scenario();
    const c = compareAfterTax(s);
    expect(c.advantage).toBe(c.outOfPocket - s.totalCost.outOfPocket);
  });
  it('cash purchase includes the vehicle, every gross running cost and other after-tax costs', () => {
    const s = scenario({ upfrontAfterTax: 500, endAfterTax: 600 });
    const cash = compareCashPurchase(s);
    expect(cash.purchase).toBeCloseTo(s.gst.purchaseTotal, 8);
    expect(cash.runningCosts).toBeCloseTo(s.runningCosts.gross * s.inputs.years, 8);
    expect(cash.total).toBeCloseTo(
      s.gst.purchaseTotal + s.runningCosts.gross * s.inputs.years + 500 + 600,
      8,
    );
    expect(cash.monthlyEquivalent).toBeCloseTo(cash.total / s.lease.months, 8);
    expect(cash.differenceFromNovated).toBeCloseTo(cash.total - s.totalCost.outOfPocket, 8);
  });
  it('builds a month-over-month cumulative outlay series', () => {
    const s = scenario();
    const c = compareAfterTax(s);
    expect(c.cumulative).toHaveLength(s.lease.months + 1);
    expect(c.cumulative[0]).toEqual({
      month: 0,
      novated: s.inputs.upfrontAfterTax,
      afterTax: s.inputs.upfrontAfterTax,
      taxSaving: 0,
    });
    c.cumulative.forEach((point) => {
      // The novated line is real out-of-pocket (take-home hit accrued); the after-tax line is
      // the private-financing alternative. The tax saving is a separate benefit, not a cost.
      expect(point.taxSaving).toBeCloseTo(s.savings.monthlyTaxAndMedicare * point.month, 7);
      expect(point.afterTax).toBeGreaterThanOrEqual(point.novated);
    });
    const novated = c.cumulative.map((point) => point.novated);
    const afterTax = c.cumulative.map((point) => point.afterTax);
    expect(novated.every((value, index) => index === 0 || value >= novated[index - 1])).toBe(true);
    expect(afterTax.every((value, index) => index === 0 || value >= afterTax[index - 1])).toBe(
      true,
    );
  });
  it('builds a per-month outlay series with the residual spike at lease end', () => {
    const s = scenario();
    const c = compareAfterTax(s);
    expect(c.monthly).toHaveLength(s.lease.months + 1);
    expect(c.monthly[0]).toEqual({
      month: 0,
      novated: s.inputs.upfrontAfterTax,
      afterTax: s.inputs.upfrontAfterTax,
    });
    const flat = c.monthly.slice(1, -1);
    flat.forEach((point) => {
      expect(point.novated).toBeCloseTo(s.takeHomeImpact.monthly, 7);
      expect(point.afterTax).toBeCloseTo(
        (c.finance.annual + s.runningCosts.gross + s.admin.gross) / 12,
        7,
      );
    });
    const end = c.monthly.at(-1)!;
    expect(end.novated).toBeCloseTo(
      s.takeHomeImpact.monthly + s.residual.payout + s.inputs.endAfterTax,
      7,
    );
    expect(end.afterTax).toBeCloseTo(
      (c.finance.annual + s.runningCosts.gross + s.admin.gross) / 12 +
        s.residual.payout +
        s.inputs.endAfterTax,
      7,
    );
    // The per-month series sums (plus the month-0 upfront) back to the cumulative endpoints.
    const novatedSum = c.monthly.reduce((total, point) => total + point.novated, 0);
    const afterTaxSum = c.monthly.reduce((total, point) => total + point.afterTax, 0);
    expect(novatedSum).toBeCloseTo(c.cumulative.at(-1)!.novated, 7);
    expect(afterTaxSum).toBeCloseTo(c.cumulative.at(-1)!.afterTax, 7);
  });
  it('HELP and MLS limitations are explicit', () => {
    const s = scenario({ helpDebt: true, privateHospitalCover: false });
    expect(s.warnings.join(' ')).toContain('HELP/HECS repayments are NOT included');
    expect(s.warnings.join(' ')).toContain('surcharge is NOT included');
  });
  it('does not mutate input or global defaults', () => {
    const input = Object.freeze({ ...DEFAULT_INPUTS });
    calculateNovatedLeaseScenario(input);
    expect(input).toEqual(DEFAULT_INPUTS);
  });
});

describe('live recalculation and explanations', () => {
  it('changing electricity updates usage costs, working, summary and all durations', () => {
    const before = scenario();
    const after = scenario({ electricityPrice: 0.4 });
    const annualEnergy = (DEFAULT_INPUTS.annualKm * DEFAULT_INPUTS.evEfficiency * 0.4) / 100;
    expect(after.runningCosts.energy.annual).toBe(annualEnergy);
    expect(after.takeHomeImpact.monthly).toBeGreaterThan(before.takeHomeImpact.monthly);
    const step = after.explanations
      .find((s) => s.id === 'energy')
      ?.steps.find((s) => s.id === 'energy-annual');
    expect(step?.calculation).toContain('$0.40');
    expect(step?.result).toBe(annualEnergy);
    expect(step?.formattedResult).toBe(money(annualEnergy));
    const durationsBefore = compareLeaseDurations(DEFAULT_INPUTS);
    const durationsAfter = compareLeaseDurations({ ...DEFAULT_INPUTS, electricityPrice: 0.4 });
    durationsAfter.forEach((row, i) => expect(row.total).toBeGreaterThan(durationsBefore[i].total));
  });
  it.each(['carPrice', 'salary', 'annualKm', 'interestRate', 'insurance', 'adminMonthly'] as const)(
    'changing %s changes affected output',
    (key) => {
      const a = scenario();
      const b = scenario({ [key]: DEFAULT_INPUTS[key] * 1.1 });
      if (key === 'salary') expect(b.takeHomeImpact.before).not.toBe(a.takeHomeImpact.before);
      else expect(b.takeHomeImpact.monthly).not.toBe(a.takeHomeImpact.monthly);
    },
  );
  it('headline and explanation values share the engine result', () => {
    const s = scenario();
    const pairs: [CalculationStepLike[], string, number][] = [
      [s.takeHomeImpact.steps, 'take-home-monthly', s.takeHomeImpact.monthly],
      [s.residual.steps, 'residual-payout', s.residual.payout],
      [s.totalCost.steps, 'total-out-of-pocket', s.totalCost.outOfPocket],
      [s.savings.steps, 'benefit-total', s.savings.totalBenefit],
      [s.lease.steps, 'finance-monthly', s.lease.monthly],
    ];
    pairs.forEach(([steps, id, value]) => {
      const item = steps.find((x) => x.id === id);
      expect(item?.result).toBe(value);
      expect(item?.formattedResult).toBe(money(value));
    });
  });
  it('builds a 60-month outlook with an exact selected-term point', () => {
    const outlook = calculateLeaseTermOutlook(DEFAULT_INPUTS);
    const selected = scenario();
    expect(outlook.points).toHaveLength(61);
    expect(outlook.points.map((point) => point.month)).toEqual(
      Array.from({ length: 61 }, (_, month) => month),
    );
    expect(outlook.selectedMonth).toBe(36);
    expect(outlook.points[36].outOfPocket).toBeCloseTo(selected.totalCost.outOfPocket, 8);
    expect(outlook.points[36].taxAndGstSaving).toBeCloseTo(selected.savings.totalBenefit, 8);
  });
  it('models vehicle-price, interest-rate and lease-term scenario cases from the current inputs', () => {
    const selected = scenario();
    const vehiclePrice = calculateScenarioCases(DEFAULT_INPUTS, 'vehicle-price');
    const interestRate = calculateScenarioCases(DEFAULT_INPUTS, 'interest-rate');
    const leaseTerm = calculateScenarioCases(DEFAULT_INPUTS, 'lease-term');
    expect(vehiclePrice).toHaveLength(5);
    expect(vehiclePrice.find((point) => point.current)?.value).toBe(DEFAULT_INPUTS.carPrice);
    expect(vehiclePrice.find((point) => point.current)?.monthlyCost).toBeCloseTo(
      selected.takeHomeImpact.monthly,
      8,
    );
    expect(interestRate.map((point) => point.value)).toEqual([7, 9, 11, 13, 15]);
    expect(interestRate.find((point) => point.current)?.totalOutOfPocket).toBeCloseTo(
      selected.totalCost.outOfPocket,
      8,
    );
    expect(leaseTerm.map((point) => point.value)).toEqual([1, 2, 3, 4, 5]);
    expect(leaseTerm.find((point) => point.current)?.taxAndGstSaving).toBeCloseTo(
      selected.savings.totalBenefit,
      8,
    );
  });
  it('includes lifetime fee detail for every term in the 1–5 year comparison', () => {
    const rows = compareLeaseDurations(DEFAULT_INPUTS);
    rows.forEach((row) => {
      const expected = scenario({ years: row.years });
      expect(row.administration).toBeCloseTo(expected.admin.lifetime, 8);
      expect(row.runningCosts).toBeCloseTo(expected.runningCosts.net * expected.inputs.years, 8);
      expect(row.interest).toBeCloseTo(expected.lease.interest, 8);
      expect(row.taxAndMedicareSaved).toBeCloseTo(
        (expected.savings.incomeTax + expected.savings.medicare) * expected.inputs.years,
        8,
      );
      expect(row.gstSaved).toBeCloseTo(expected.savings.gstNetLifetime, 8);
      expect(row.totalBeforeIncomeTaxSupport).toBeCloseTo(
        expected.totalCost.outOfPocket + row.taxAndMedicareSaved,
        8,
      );
    });
  });
});
type CalculationStepLike = { id: string; result: number; formattedResult: string };

describe('validation and incomplete typing', () => {
  it.each(['', '$70,', '70,00', '-', '-10', 'foo', 'Infinity', '1e9', '0.'])(
    'retains previous value for %s',
    (raw) => expect(parseNumericInput(raw)).toBeNull(),
  );
  it.each([
    ['$70,000', 70000],
    ['70,000.25', 70000.25],
    ['0.3', 0.3],
    ['200000', 200000],
  ])('parses %s', (raw, value) => expect(parseNumericInput(String(raw))).toBe(value));
  it.each([
    { salary: -1 },
    { carPrice: -1 },
    { annualKm: -1 },
    { electricityPrice: -1 },
    { evEfficiency: 0 },
    { fuelEfficiency: 0 },
    { years: 6 },
    { dependants: 1.5 },
    { insuranceNonGst: 3001 },
    { leaseStartDate: '2026-02-30' },
  ])('rejects invalid input %j', (changes) =>
    expect(
      validateInputs({ ...DEFAULT_INPUTS, ...changes } as NormalizedInputs).length,
    ).toBeGreaterThan(0),
  );
  it('allows outside typical interest with warning', () => {
    expect(validateInputs({ ...DEFAULT_INPUTS, interestRate: 15 })).toEqual([]);
    expect(scenario({ interestRate: 15 }).warnings.join(' ')).toContain('7–12%');
  });
});

describe('low-income explanation audit', () => {
  it('LITO reductions can be recomputed from the displayed raw inputs', () => {
    const tax = calculateIncomeTax(42000);
    expect(tax.steps.find((s) => s.id === 'lito-first-taper')?.result).toBe((42000 - 37500) * 0.05);
    expect(tax.steps.find((s) => s.id === 'lito-second-taper')?.result).toBe(0);
    expect(tax.steps.find((s) => s.id === 'lito')?.result).toBe(700 - (42000 - 37500) * 0.05);
  });
  it('family working reconciles each reduction and final result', () => {
    const m = levy(50000, { familyStatus: 'family', dependants: 0 });
    const byId = (id: string) => m.steps.find((s) => s.id === id)!.result;
    expect(byId('medicare-family-threshold')).toBe(47238);
    expect(byId('medicare-family-reduction')).toBeCloseTo(0.02 * 47238 - 0.08 * (50000 - 47238), 8);
    expect(byId('medicare-family-allocation')).toBe(byId('medicare-family-reduction'));
    expect(byId('medicare-family-transfer')).toBe(0);
    expect(byId('medicare-family')).toBe(m.value);
  });
});
