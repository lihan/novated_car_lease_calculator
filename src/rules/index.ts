import { TAX_2026_27, MEDICARE_2026_27, GST_2026_27 } from './tax/2026-27';
import { FBT_2026 } from './fbt/2026';
import type { Rules } from '../calculator/types';
export const CURRENT_RULES: Rules = {
  tax: TAX_2026_27,
  medicare: MEDICARE_2026_27,
  gst: GST_2026_27,
  fbt: FBT_2026,
};
export function assertLegislated(rules: Rules) {
  for (const rule of Object.values(rules)) {
    if (rule.status !== 'legislated')
      throw new Error('Proposed rules cannot be used in the main calculator.');
    if (rule.financialYear !== rules.tax.financialYear)
      throw new Error('Rule financial years must match.');
  }
}
