// ATO FY2026–27 general SG rate and annual maximum contribution base.
export const SUPER_GUARANTEE_RATE = 0.12;
export const SUPER_GUARANTEE_MAXIMUM_BASE = 270_830;
export const SUPER_GUARANTEE_MAXIMUM_ANNUAL_PAYMENT =
  SUPER_GUARANTEE_MAXIMUM_BASE * SUPER_GUARANTEE_RATE;

export function calculatePotentialSuperImpact(
  annualSalary: number,
  salaryBaseReduction: number,
  years: number,
  rate = SUPER_GUARANTEE_RATE,
  maximumContributionBase = SUPER_GUARANTEE_MAXIMUM_BASE,
) {
  const salary = Math.max(0, annualSalary);
  const reduction = Math.min(salary, Math.max(0, salaryBaseReduction));
  const sgRate = Math.max(0, rate);
  const maximumBase = Math.max(0, maximumContributionBase);
  const reducedSalary = Math.max(0, salary - reduction);
  const superableBaseBefore = Math.min(salary, maximumBase);
  const superableBaseAfter = Math.min(reducedSalary, maximumBase);
  const annualLoss = Math.max(0, superableBaseBefore - superableBaseAfter) * sgRate;

  return {
    annualSalary: salary,
    salaryBaseReduction: reduction,
    reducedSalary,
    maximumContributionBase: maximumBase,
    maximumAnnualPayment: maximumBase * sgRate,
    superableBaseBefore,
    superableBaseAfter,
    rate: sgRate,
    annualLoss,
    termLoss: annualLoss * Math.max(0, years),
  };
}
