import type { LeaseYears, RuleMetadata } from '../../calculator/types';
export const ATO_CAR_RESIDUALS: Record<LeaseYears, number> = {
  1: 0.6563,
  2: 0.5625,
  3: 0.4688,
  4: 0.375,
  5: 0.2813,
};
export const RESIDUAL_METADATA: RuleMetadata = {
  financialYear: '2026-27',
  sourceName: 'Australian Taxation Office — TD 93/142, eight-year effective life',
  sourceUrl: 'https://www.ato.gov.au/law/view/document?DocID=TXD/TD93142/NAT/ATO/00001',
  lastVerified: '2026-09-12',
  status: 'legislated',
  note: 'ATO minimum residual guidance; actual contract and asset cost basis must be confirmed.',
};
