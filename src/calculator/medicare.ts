import type { MedicareRules, NormalizedInputs } from './types';
import { MEDICARE_2026_27 } from '../rules/tax/2026-27';
import { step } from './explanations';
import { money, percent } from '../utils/format';
type MedicareInput = Pick<NormalizedInputs, 'familyStatus' | 'dependants' | 'spouseIncome'> & {
  taxableIncome: number;
  financialYear: string;
};
export function calculateMedicareLevy(
  input: MedicareInput,
  rules: MedicareRules = MEDICARE_2026_27,
) {
  if (rules.status !== 'legislated' || input.financialYear !== rules.financialYear)
    throw new Error('Unsupported Medicare rules.');
  const { taxableIncome, spouseIncome, dependants, familyStatus } = input;
  if ([taxableIncome, spouseIncome, dependants].some((v) => !Number.isFinite(v) || v < 0))
    throw new Error('Invalid Medicare input.');
  const individual = (income: number) =>
    income <= rules.singleUpper
      ? Math.min(
          income * rules.rate,
          Math.max(0, income - rules.singleThreshold) * rules.phaseInRate,
        )
      : income * rules.rate;
  const baseLevy = individual(taxableIncome);
  const steps = [
    step(
      'medicare-individual',
      'Individual Medicare levy',
      'The levy phases in above the low-income threshold, then the full rate applies above the phase-in limit.',
      'Below upper limit: min(income × levy rate, max(0, income − threshold) × phase-in rate); otherwise income × levy rate',
      [
        ['Taxable income', taxableIncome],
        ['Lower threshold', rules.singleThreshold],
        ['Upper limit', rules.singleUpper],
        ['Levy rate', rules.rate, percent(rules.rate)],
        ['Phase-in rate', rules.phaseInRate, percent(rules.phaseInRate)],
      ],
      taxableIncome <= rules.singleUpper
        ? `min(${money(taxableIncome * rules.rate)}, max(0, ${money(taxableIncome)} − ${money(rules.singleThreshold)}) × ${percent(rules.phaseInRate)})`
        : `${money(taxableIncome)} × ${percent(rules.rate)}`,
      baseLevy,
    ),
  ];
  let value = baseLevy;
  if (familyStatus === 'family') {
    const familyIncome = taxableIncome + spouseIncome;
    const threshold = rules.familyThreshold + rules.perDependant * dependants;
    const reduction = Math.max(
      0,
      rules.rate * threshold -
        (rules.phaseInRate - rules.rate) * Math.max(0, familyIncome - threshold),
    );
    const spouseLevy = individual(spouseIncome);
    const share = spouseLevy > 0 && familyIncome > 0 ? taxableIncome / familyIncome : 1;
    const allocated = reduction * share;
    const transfer = spouseLevy > 0 ? Math.max(0, reduction * (1 - share) - spouseLevy) : 0;
    value = familyIncome <= threshold ? 0 : Math.max(0, baseLevy - allocated - transfer);
    steps.push(
      step(
        'medicare-family-threshold',
        'Family low-income threshold',
        'Each eligible dependent child increases the family threshold.',
        'Base family threshold + per-child allowance × eligible children',
        [
          ['Base family threshold', rules.familyThreshold],
          ['Per-child allowance', rules.perDependant],
          ['Eligible children', dependants, String(dependants)],
        ],
        `${money(rules.familyThreshold)} + ${money(rules.perDependant)} × ${dependants}`,
        threshold,
      ),
      step(
        'medicare-family-reduction',
        'Family levy reduction available',
        'The family reduction tapers away above the family threshold. Families at or below the threshold pay no levy.',
        'max(0, levy rate × threshold − (phase-in rate − levy rate) × max(0, family income − threshold))',
        [
          ['Family income', familyIncome],
          ['Family threshold', threshold],
          ['Levy rate', rules.rate, percent(rules.rate)],
          ['Phase-in rate', rules.phaseInRate, percent(rules.phaseInRate)],
        ],
        `max(0, ${percent(rules.rate)} × ${money(threshold)} − ${percent(rules.phaseInRate - rules.rate)} × max(0, ${money(familyIncome)} − ${money(threshold)}))`,
        reduction,
      ),
      step(
        'medicare-family-allocation',
        'Your share of the family reduction',
        'If both spouses owe individual Medicare, allocate by taxable income; otherwise apply the reduction to the liable spouse.',
        'Family reduction × your allocation share',
        [
          ['Family reduction', reduction],
          ['Your taxable income', taxableIncome],
          ['Spouse taxable income', spouseIncome],
          ['Spouse individual levy', spouseLevy],
          ['Allocation share', share, percent(share)],
        ],
        `${money(reduction)} × ${percent(share)}`,
        allocated,
      ),
      step(
        'medicare-family-transfer',
        'Unused spouse reduction transferred',
        'Any allocated reduction above your spouse’s individual levy transfers to you. No spouse allocation means no transfer.',
        'Spouse liable: max(0, family reduction × spouse share − spouse levy); otherwise zero',
        [
          ['Family reduction', reduction],
          ['Spouse share', 1 - share, percent(1 - share)],
          ['Spouse individual levy', spouseLevy],
        ],
        spouseLevy > 0
          ? `max(0, ${money(reduction)} × ${percent(1 - share)} − ${money(spouseLevy)})`
          : 'No spouse levy allocation → $0.00',
        transfer,
      ),
      step(
        'medicare-family',
        'Family Medicare adjustment',
        'Applies the statutory family reduction, allocates it if both spouses pay the levy, and transfers any unused spouse reduction. Dependants must be eligible under the Medicare rules.',
        'Family threshold = base + per-child allowance; levy = max(0, individual levy − allocated reduction − transferred reduction)',
        [
          ['Family income', familyIncome],
          ['Family threshold', threshold],
          ['Individual levy', baseLevy],
          ['Family reduction', reduction],
          ['Your allocation', allocated],
          ['Transferred reduction', transfer],
        ],
        familyIncome <= threshold
          ? `${money(familyIncome)} ≤ ${money(threshold)} → no levy`
          : `max(0, ${money(baseLevy)} − ${money(allocated)} − ${money(transfer)})`,
        value,
      ),
    );
  }
  return { value, steps };
}
