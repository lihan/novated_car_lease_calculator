import { calculateNovatedLeaseScenario } from '../src/calculator/scenario';
import {
  calculateLeaseTermOutlook,
  compareAfterTax,
  compareLeaseDurations,
} from '../src/calculator/comparison';
import { DEFAULT_INPUTS } from '../src/calculator/defaults';

const s = calculateNovatedLeaseScenario(DEFAULT_INPUTS);
const c = compareAfterTax(s);
const outlook = calculateLeaseTermOutlook(DEFAULT_INPUTS);
const durations = compareLeaseDurations(DEFAULT_INPUTS);

console.log('=== Key scenario figures (default inputs) ===');
console.log('grossAnnual package deduction:', s.packaging.grossAnnual.toFixed(2));
console.log('takeHomeImpact monthly (net):', s.takeHomeImpact.monthly.toFixed(2));
console.log('takeHomeImpact annual (net):', s.takeHomeImpact.annual.toFixed(2));
console.log('residual payout:', s.residual.payout.toFixed(2));
console.log('totalCost.outOfPocket (net):', s.totalCost.outOfPocket.toFixed(2));
console.log('totalBenefit:', s.savings.totalBenefit.toFixed(2));
console.log('comparison afterTax outOfPocket:', c.outOfPocket.toFixed(2));
console.log('advantage:', c.advantage.toFixed(2));

console.log(
  '\n=== Outlook chart points (what is currently plotted in NOVATED VS AFTER-TAX section) ===',
);
for (const m of [0, 1, 2, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60]) {
  const p = outlook.points[m];
  console.log(
    `month ${String(m).padStart(2)}: hypothetical-lease-total outOfPocket=${p.outOfPocket.toFixed(0).padStart(7)}  taxAndGstSaving=${p.taxAndGstSaving.toFixed(0).padStart(7)}`,
  );
}

console.log('\n=== comparison.cumulative (computed but NOT rendered anywhere) ===');
for (const m of [0, 6, 12, 18, 24, 30, 36]) {
  const p = c.cumulative[m];
  console.log(
    `month ${String(m).padStart(2)}: novated(net)=${p.novated.toFixed(0).padStart(7)}  afterTax=${p.afterTax.toFixed(0).padStart(7)}`,
  );
}

console.log(
  '\n=== Month-over-month gross outlay (excluding tax savings), NOT computed anywhere ===',
);
const grossMonthly = s.packaging.grossMonthly;
for (const m of [0, 6, 12, 18, 24, 30, 36]) {
  const end = m === s.lease.months ? s.residual.payout + DEFAULT_INPUTS.endAfterTax : 0;
  console.log(
    `month ${String(m).padStart(2)}: gross cumulative=${(DEFAULT_INPUTS.upfrontAfterTax + grossMonthly * m + end).toFixed(0).padStart(7)}`,
  );
}

console.log('\n=== Duration comparison rows ===');
durations.forEach((d) =>
  console.log(
    `${d.years}y monthly=${d.monthly.toFixed(0)} residual=${d.residual.toFixed(0)} interest=${d.interest.toFixed(0)} incomeTaxAndMedicare=${d.taxAndMedicareSaved.toFixed(0)} gst=${d.gstSaved.toFixed(0)} beforeIncomeTaxSupport=${d.totalBeforeIncomeTaxSupport.toFixed(0)} total=${d.total.toFixed(0)}`,
  ),
);
