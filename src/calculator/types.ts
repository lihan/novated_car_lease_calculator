export type LeaseYears = 1 | 2 | 3 | 4 | 5;
export type VehicleType = 'BEV' | 'PHEV' | 'petrol' | 'diesel' | 'hybrid';
export interface RuleMetadata {
  financialYear: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string | null;
  status: 'legislated' | 'proposed';
  note?: string;
}
export interface CalculationStep {
  id: string;
  title: string;
  description: string;
  formula: string;
  inputs: { label: string; value: number; formattedValue: string }[];
  calculation: string;
  result: number;
  formattedResult: string;
}
export interface CalculationSection {
  id: string;
  title: string;
  steps: CalculationStep[];
}
export interface CalculationResult<T> {
  value: T;
  steps: CalculationStep[];
}
export interface NormalizedInputs {
  carPrice: number;
  salary: number;
  vehicleType: VehicleType;
  annualKm: number;
  electricityPrice: number;
  evEfficiency: number;
  fuelPrice: number;
  fuelEfficiency: number;
  insurance: number;
  insuranceNonGst: number;
  annualRegistration: number;
  annualCtp: number;
  servicing: number;
  tyres: number;
  otherRunning: number;
  interestRate: number;
  years: LeaseYears;
  adminMonthly: number;
  advancedPrice: boolean;
  purchaseRegistration: number;
  stampDuty: number;
  dealerCharges: number;
  otherNonGst: number;
  energyGstEligible: boolean;
  otherGstEligible: boolean;
  firstHeldAndUsedDate: string;
  leaseStartDate: string;
  lctPayable: 'yes' | 'no' | 'unknown';
  helpDebt: boolean;
  privateHospitalCover: boolean;
  familyStatus: 'single' | 'family';
  dependants: number;
  spouseIncome: number;
  upfrontAfterTax: number;
  endAfterTax: number;
}
export interface TaxRules extends RuleMetadata {
  brackets: readonly { lower: number; upper: number; rate: number }[];
  lito: {
    maximum: number;
    firstThreshold: number;
    secondThreshold: number;
    firstTaper: number;
    secondTaper: number;
  };
}
export interface MedicareRules extends RuleMetadata {
  rate: number;
  phaseInRate: number;
  singleThreshold: number;
  singleUpper: number;
  familyThreshold: number;
  perDependant: number;
}
export interface GstRules extends RuleMetadata {
  rate: number;
  carLimit: number;
  maxVehicleCredit: number;
}
export interface FbtRules extends RuleMetadata {
  earliestUse: string;
  phevCutoff: string;
  statutoryRate: number;
}
export interface Rules {
  tax: TaxRules;
  medicare: MedicareRules;
  gst: GstRules;
  fbt: FbtRules;
}
