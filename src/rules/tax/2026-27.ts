import type { TaxRules, MedicareRules, GstRules } from '../../calculator/types';
export const TAX_2026_27: TaxRules = {
  financialYear: '2026-27',
  sourceName: 'Federal Register of Legislation — Income Tax Rates Act 1986',
  sourceUrl: 'https://www.legislation.gov.au/C2004A03348/2026-07-01/text',
  lastVerified: '2026-09-12',
  status: 'legislated',
  brackets: [
    { lower: 0, upper: 18200, rate: 0 },
    { lower: 18200, upper: 45000, rate: 0.15 },
    { lower: 45000, upper: 135000, rate: 0.3 },
    { lower: 135000, upper: 190000, rate: 0.37 },
    { lower: 190000, upper: Infinity, rate: 0.45 },
  ],
  lito: {
    maximum: 700,
    firstThreshold: 37500,
    secondThreshold: 45000,
    firstTaper: 0.05,
    secondTaper: 0.015,
  },
  note: 'Resident rates, with low income tax offset. Other deductions and offsets excluded. This tax year is held constant for the entire lease projection.',
};
export const MEDICARE_2026_27: MedicareRules = {
  financialYear: '2026-27',
  sourceName: 'Federal Register of Legislation — Medicare Levy Act 1986, sections 3, 6–8',
  sourceUrl: 'https://www.legislation.gov.au/C2004A03351/2026-07-01/text',
  lastVerified: '2026-09-12',
  status: 'legislated',
  rate: 0.02,
  phaseInRate: 0.1,
  singleThreshold: 28011,
  singleUpper: 35013,
  familyThreshold: 47238,
  perDependant: 4338,
  note: 'Current legislated thresholds; later annual indexation is not forecast. Ordinary non-SAPTO taxpayers with full-year residency and no Medicare exemptions.',
};
export const GST_2026_27: GstRules = {
  financialYear: '2026-27',
  sourceName: 'Australian Taxation Office — car thresholds (brief-supplied values)',
  sourceUrl:
    'https://www.ato.gov.au/businesses-and-organisations/small-business-newsroom/changes-to-car-thresholds-from-1-july',
  lastVerified: null,
  status: 'legislated',
  rate: 0.1,
  carLimit: 69883,
  maxVehicleCredit: 6353,
  note: 'The $69,883 car limit and $6,353 credit cap are supplied by the project brief. The primary ATO page could not be retrieved on 12 September 2026; confirm these values with your provider. The status describes the ordinary GST framework, not independent verification of these thresholds.',
};
