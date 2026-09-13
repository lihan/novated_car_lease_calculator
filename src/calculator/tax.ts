import type { TaxRules } from './types';
import { TAX_2026_27 } from '../rules/tax/2026-27';
import { step } from './explanations';
import { money, percent } from '../utils/format';
export function calculateIncomeTax(taxableIncome: number, rules: TaxRules = TAX_2026_27) {
  if (rules.status !== 'legislated')
    throw new Error('Proposed income tax rules cannot be applied.');
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0)
    throw new Error('Invalid taxable income.');
  const steps = rules.brackets.map(({ lower, upper, rate }, index) => {
    const amount = Math.max(0, Math.min(taxableIncome, upper) - lower);
    return step(
      `bracket-${index}`,
      `${money(lower)} ${Number.isFinite(upper) ? `to ${money(upper)}` : 'and above'}`,
      'Only the income within this band is taxed at this rate.',
      'Income in band × bracket rate',
      [
        ['Income in band', amount],
        ['Rate', rate, percent(rate)],
      ],
      `${money(amount)} × ${percent(rate)}`,
      amount * rate,
    );
  });
  const grossTax = steps.reduce((sum, s) => sum + s.result, 0);
  const l = rules.lito;
  const firstReduction =
    Math.max(0, Math.min(taxableIncome, l.secondThreshold) - l.firstThreshold) * l.firstTaper;
  const secondReduction = Math.max(0, taxableIncome - l.secondThreshold) * l.secondTaper;
  const offset = Math.min(grossTax, Math.max(0, l.maximum - firstReduction - secondReduction));
  steps.push(
    step(
      'lito-first-taper',
      'First LITO taper',
      'The first taper applies only between the two income thresholds.',
      'max(0, min(income, second threshold) − first threshold) × first taper rate',
      [
        ['Taxable income', taxableIncome],
        ['First threshold', l.firstThreshold],
        ['Second threshold', l.secondThreshold],
        ['First taper rate', l.firstTaper, percent(l.firstTaper)],
      ],
      `max(0, min(${money(taxableIncome)}, ${money(l.secondThreshold)}) − ${money(l.firstThreshold)}) × ${percent(l.firstTaper)}`,
      firstReduction,
    ),
    step(
      'lito-second-taper',
      'Second LITO taper',
      'Income above the second threshold reduces the remaining offset. The final offset cannot fall below zero.',
      'max(0, income − second threshold) × second taper rate',
      [
        ['Taxable income', taxableIncome],
        ['Second threshold', l.secondThreshold],
        ['Second taper rate', l.secondTaper, percent(l.secondTaper)],
      ],
      `max(0, ${money(taxableIncome)} − ${money(l.secondThreshold)}) × ${percent(l.secondTaper)}`,
      secondReduction,
    ),
    step(
      'lito',
      'Low income tax offset',
      'Non-refundable LITO is capped at income tax. It tapers across the configured thresholds.',
      'min(tax, max(0, maximum offset − first taper − second taper))',
      [
        ['Maximum offset', l.maximum],
        ['First taper reduction', firstReduction],
        ['Second taper reduction', secondReduction],
        ['Tax before offset', grossTax],
      ],
      `min(${money(grossTax)}, max(0, ${money(l.maximum)} − ${money(firstReduction)} − ${money(secondReduction)}))`,
      offset,
    ),
  );
  const value = grossTax - offset;
  steps.push(
    step(
      'income-tax',
      'Income tax payable',
      'Progressive income tax less the low income tax offset. Medicare is calculated separately.',
      'Sum of bracket tax − LITO',
      [
        ['Bracket tax', grossTax],
        ['LITO', offset],
      ],
      `${money(grossTax)} − ${money(offset)}`,
      value,
    ),
  );
  return { value, taxableIncome, grossTax, offset, steps };
}
