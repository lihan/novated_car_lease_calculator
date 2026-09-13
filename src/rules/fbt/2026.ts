import type { FbtRules, RuleMetadata } from '../../calculator/types';
export const FBT_2026: FbtRules = {
  financialYear: '2026-27',
  sourceName: 'Australian Taxation Office — electric cars exemption',
  sourceUrl:
    'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/fringe-benefits-tax/types-of-fringe-benefits/cars-and-fbt/electric-cars-exemption',
  lastVerified: '2026-09-12',
  status: 'legislated',
  earliestUse: '2022-07-01',
  phevCutoff: '2025-04-01',
  statutoryRate: 0.2,
  note: 'Passenger car provided to a current employee; private use available all year. PHEV transitional binding-agreement exceptions require individual assessment.',
};
export const PROPOSED_EV_CHANGES: RuleMetadata = {
  financialYear: '2026-27',
  sourceName: 'Australian Treasury — Electric Car Discount review',
  sourceUrl:
    'https://treasury.gov.au/sites/default/files/2026-05/p2026-766052-final-report-EDC-review.pdf',
  lastVerified: '2026-09-12',
  status: 'proposed',
  note: 'Future EV discount changes are not applied by this calculator. Verify the law and any transition protection at the actual lease start.',
};
