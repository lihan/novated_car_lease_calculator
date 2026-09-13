import { calculateNovatedLeaseScenario, type NovatedLeaseScenario } from './scenario';
import { calculateLeasePayment } from './lease';
import type { NormalizedInputs, Rules, LeaseYears } from './types';
import { CURRENT_RULES } from '../rules';
import { step } from './explanations';
import { money, number } from '../utils/format';

export type ScenarioMode = 'vehicle-price' | 'interest-rate' | 'lease-term';

export interface ScenarioCase {
  value: number;
  label: string;
  shortLabel: string;
  monthlyCost: number;
  totalOutOfPocket: number;
  taxAndGstSaving: number;
  current: boolean;
}

export function compareCashPurchase(s: NovatedLeaseScenario) {
  const purchase = s.gst.purchaseTotal;
  const runningCosts = s.runningCosts.gross * s.inputs.years;
  const otherAfterTaxCosts = s.inputs.upfrontAfterTax + s.inputs.endAfterTax;
  const total = purchase + runningCosts + otherAfterTaxCosts;
  const monthlyEquivalent = total / s.lease.months;
  const differenceFromNovated = total - s.totalCost.outOfPocket;
  const steps = [
    step(
      'cash-purchase-total',
      'Cash-purchase cost over the selected term',
      'Pay the vehicle price upfront, then pay every running expense from after-tax money. A cash purchase has no lease interest, lease administration fee, salary packaging, GST credits or final residual payment.',
      'Vehicle purchase price + gross running costs × years + other after-tax costs',
      [
        ['Vehicle purchase price', purchase],
        ['Annual gross running costs', s.runningCosts.gross],
        ['Years', s.inputs.years, number(s.inputs.years)],
        ['Other after-tax costs', otherAfterTaxCosts],
      ],
      `${money(purchase)} + ${money(s.runningCosts.gross)} × ${s.inputs.years} + ${money(otherAfterTaxCosts)}`,
      total,
    ),
    step(
      'cash-purchase-monthly-equivalent',
      'Cash-purchase monthly equivalent',
      'This spreads the upfront vehicle purchase and running costs across the selected months for comparison only. The vehicle is paid for upfront in the cash scenario.',
      'Cash-purchase total ÷ months',
      [
        ['Cash-purchase total', total],
        ['Months', s.lease.months, number(s.lease.months)],
      ],
      `${money(total)} ÷ ${s.lease.months}`,
      monthlyEquivalent,
    ),
    step(
      'cash-purchase-difference',
      'Difference from novated lease',
      'Both totals assume you retain the vehicle at the end of the selected term and do not include a resale value.',
      'Cash-purchase total − novated total out-of-pocket',
      [
        ['Cash-purchase total', total],
        ['Novated total out-of-pocket', s.totalCost.outOfPocket],
      ],
      `${money(total)} − ${money(s.totalCost.outOfPocket)}`,
      differenceFromNovated,
    ),
  ];
  return {
    purchase,
    runningCosts,
    otherAfterTaxCosts,
    total,
    monthlyEquivalent,
    differenceFromNovated,
    steps,
  };
}

export function compareAfterTax(s: NovatedLeaseScenario) {
  // An identical end payout isolates the cash flows, including the private residual GST.
  const finance = calculateLeasePayment(
    s.gst.purchaseTotal,
    s.residual.payout,
    s.inputs.interestRate,
    s.lease.months,
  );
  const annualExpenses = finance.annual + s.runningCosts.gross + s.admin.gross;
  const outOfPocket =
    annualExpenses * s.inputs.years +
    s.residual.payout +
    s.inputs.upfrontAfterTax +
    s.inputs.endAfterTax;
  const advantage = outOfPocket - s.totalCost.outOfPocket;
  const interestDifference = finance.interest - s.lease.interest;
  const rows = [
    {
      label: 'Purchase expenditure before financing',
      novated: s.gst.amountFinanced,
      afterTax: s.gst.purchaseTotal,
    },
    {
      label: 'Lifetime finance interest over selected term',
      novated: s.lease.interest,
      afterTax: finance.interest,
    },
    {
      label: 'Running expenses over term',
      novated: s.runningCosts.net * s.inputs.years,
      afterTax: s.runningCosts.gross * s.inputs.years,
    },
    {
      label: 'Administration over term',
      novated: s.admin.lifetime,
      afterTax: s.admin.gross * s.inputs.years,
    },
    {
      label: 'Income tax + Medicare over term',
      novated: (s.taxAfter.value + s.medicareAfter.value) * s.inputs.years,
      afterTax: (s.taxBefore.value + s.medicareBefore.value) * s.inputs.years,
    },
    { label: 'Net GST benefit over term', novated: s.savings.gstNetLifetime, afterTax: 0 },
    { label: 'Final residual payable', novated: s.residual.payout, afterTax: s.residual.payout },
    { label: 'Total out-of-pocket', novated: s.totalCost.outOfPocket, afterTax: outOfPocket },
  ];
  const steps = [
    step(
      'comparison-aftertax',
      'Equivalent after-tax vehicle cost',
      'Same vehicle, interest rate, term, final balloon, running expenses and administration fees. The private borrower receives no GST credits or salary deductions. This is a controlled packaging comparison, not a cash purchase or a market car-loan quote.',
      '(Annual finance + gross running expenses + gross administration) × years + residual + other costs',
      [
        ['Annual private finance', finance.annual],
        ['Annual running expenses', s.runningCosts.gross],
        ['Annual administration', s.admin.gross],
        ['Years', s.inputs.years, number(s.inputs.years)],
        ['Residual', s.residual.payout],
        ['Other costs', s.inputs.upfrontAfterTax + s.inputs.endAfterTax],
      ],
      `(${money(finance.annual)} + ${money(s.runningCosts.gross)} + ${money(s.admin.gross)}) × ${s.inputs.years} + ${money(s.residual.payout)} + ${money(s.inputs.upfrontAfterTax + s.inputs.endAfterTax)}`,
      outOfPocket,
    ),
    step(
      'comparison-advantage',
      'Net estimated novated-lease advantage',
      'A negative value means the novated arrangement costs more. Tax and GST are already reflected in both scenarios; do not subtract the displayed benefit again.',
      'Equivalent after-tax cost − novated out-of-pocket cost',
      [
        ['Equivalent after-tax cost', outOfPocket],
        ['Novated cost', s.totalCost.outOfPocket],
      ],
      `${money(outOfPocket)} − ${money(s.totalCost.outOfPocket)}`,
      advantage,
    ),
    step(
      'comparison-reconcile',
      'Reconcile the estimated advantage',
      'GST acquisition and residual effects are counted once. Finance-interest differences are separate from tax/GST benefits. Excess employee contribution, if any, is a real extra cost.',
      'Tax + GST benefit + finance interest difference − excess contributions over term',
      [
        ['Tax and GST benefit', s.savings.totalBenefit],
        ['Interest difference', interestDifference],
        ['Excess contributions over term', s.packaging.excessContribution * s.inputs.years],
      ],
      `${money(s.savings.totalBenefit)} + ${money(interestDifference)} − ${money(s.packaging.excessContribution * s.inputs.years)}`,
      s.savings.totalBenefit + interestDifference - s.packaging.excessContribution * s.inputs.years,
    ),
  ];
  // Cumulative out-of-pocket: real cash outlay only. The take-home decrease already nets
  // income-tax and Medicare savings, so the novated line is what leaves your pocket. The
  // after-tax line is the equivalent private-financing alternative. taxSaving is the cumulative
  // income-tax + Medicare benefit, shown as a separate benefit (not a cost).
  const cumulative = Array.from({ length: s.lease.months + 1 }, (_, month) => ({
    month,
    novated:
      s.inputs.upfrontAfterTax +
      s.takeHomeImpact.monthly * month +
      (month === s.lease.months ? s.residual.payout + s.inputs.endAfterTax : 0),
    afterTax:
      s.inputs.upfrontAfterTax +
      (annualExpenses / 12) * month +
      (month === s.lease.months ? s.residual.payout + s.inputs.endAfterTax : 0),
    taxSaving: s.savings.monthlyTaxAndMedicare * month,
  }));
  // Per-month cash outlay for budgeting. Month 0 carries any upfront after-tax cost; the final
  // month carries the residual and any end-of-lease after-tax cost as a spike.
  const monthly = [
    { month: 0, novated: s.inputs.upfrontAfterTax, afterTax: s.inputs.upfrontAfterTax },
    ...Array.from({ length: s.lease.months }, (_, index) => {
      const month = index + 1;
      const isEnd = month === s.lease.months;
      const endSpike = isEnd ? s.residual.payout + s.inputs.endAfterTax : 0;
      return {
        month,
        novated: s.takeHomeImpact.monthly + endSpike,
        afterTax: annualExpenses / 12 + endSpike,
      };
    }),
  ];
  return { finance, outOfPocket, advantage, interestDifference, rows, steps, cumulative, monthly };
}
export function compareLeaseDurations(inputs: NormalizedInputs, rules: Rules = CURRENT_RULES) {
  const scenarios = ([1, 2, 3, 4, 5] as LeaseYears[]).map((years) =>
    calculateNovatedLeaseScenario({ ...inputs, years }, rules),
  );
  const lowest = Math.min(...scenarios.map((s) => s.totalCost.outOfPocket));
  return scenarios.map((s) => ({
    years: s.inputs.years,
    monthly: s.takeHomeImpact.monthly,
    residual: s.residual.payout,
    interest: s.lease.interest,
    administration: s.admin.lifetime,
    runningCosts: s.runningCosts.net * s.inputs.years,
    taxAndMedicareSaved: (s.savings.incomeTax + s.savings.medicare) * s.inputs.years,
    gstSaved: s.savings.gstNetLifetime,
    totalBeforeIncomeTaxSupport:
      s.packaging.grossAnnual * s.inputs.years +
      s.residual.payout +
      s.inputs.upfrontAfterTax +
      s.inputs.endAfterTax,
    total: s.totalCost.outOfPocket,
    lowest: s.totalCost.outOfPocket === lowest,
  }));
}

export function calculateLeaseTermOutlook(inputs: NormalizedInputs, rules: Rules = CURRENT_RULES) {
  const points = [
    { month: 0, outOfPocket: inputs.upfrontAfterTax, taxAndGstSaving: 0 },
    ...Array.from({ length: 60 }, (_, index) => {
      const month = index + 1;
      const scenario = calculateNovatedLeaseScenario(inputs, rules, month);
      return {
        month,
        outOfPocket: scenario.totalCost.outOfPocket,
        taxAndGstSaving: scenario.savings.totalBenefit,
      };
    }),
  ];
  return { points, selectedMonth: inputs.years * 12 };
}

function uniqueSorted(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function calculateScenarioCases(
  inputs: NormalizedInputs,
  mode: ScenarioMode,
  rules: Rules = CURRENT_RULES,
): ScenarioCase[] {
  const values =
    mode === 'vehicle-price'
      ? uniqueSorted(
          [0.7, 0.85, 1.15, 1.3]
            .map((multiplier) =>
              Math.max(10000, Math.round((inputs.carPrice * multiplier) / 1000) * 1000),
            )
            .concat(inputs.carPrice),
        )
      : mode === 'interest-rate'
        ? uniqueSorted(
            [
              inputs.interestRate - 4,
              inputs.interestRate - 2,
              inputs.interestRate,
              inputs.interestRate + 2,
              inputs.interestRate + 4,
            ].map((rate) => Math.max(0, rate)),
          )
        : [1, 2, 3, 4, 5];

  return values.map((value) => {
    const scenarioInputs =
      mode === 'vehicle-price'
        ? { ...inputs, carPrice: value }
        : mode === 'interest-rate'
          ? { ...inputs, interestRate: value }
          : { ...inputs, years: value as LeaseYears };
    const scenario = calculateNovatedLeaseScenario(scenarioInputs, rules);
    const current =
      mode === 'vehicle-price'
        ? value === inputs.carPrice
        : mode === 'interest-rate'
          ? value === inputs.interestRate
          : value === inputs.years;
    const label =
      mode === 'vehicle-price'
        ? money(value)
        : mode === 'interest-rate'
          ? `${number(value)}% p.a.`
          : `${value} ${value === 1 ? 'year' : 'years'}`;
    const shortLabel =
      mode === 'vehicle-price'
        ? `$${Math.round(value / 1000)}k`
        : mode === 'interest-rate'
          ? `${number(value)}%`
          : `${value}y`;
    return {
      value,
      label,
      shortLabel,
      monthlyCost: scenario.takeHomeImpact.monthly,
      totalOutOfPocket: scenario.totalCost.outOfPocket,
      taxAndGstSaving: scenario.savings.totalBenefit,
      current,
    };
  });
}
