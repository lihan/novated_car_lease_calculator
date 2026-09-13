import type { NormalizedInputs } from './types';
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned.replaceAll(',', ''));
  return Number.isFinite(value) ? value : null;
}
export function validateInputs(input: NormalizedInputs): string[] {
  const issues: string[] = [];
  for (const [key, value] of Object.entries(input))
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0))
      issues.push(`${key} must be a finite, non-negative number.`);
  if (![1, 2, 3, 4, 5].includes(input.years))
    issues.push('Lease duration must be 1–5 whole years.');
  if (input.evEfficiency <= 0 || input.fuelEfficiency <= 0)
    issues.push('Vehicle efficiency must be greater than zero.');
  if (input.insuranceNonGst > input.insurance)
    issues.push('Non-GST insurance charges cannot exceed the insurance premium.');
  if (!Number.isInteger(input.dependants)) issues.push('Dependants must be a whole number.');
  if (input.interestRate > 1000)
    issues.push('Interest must be no greater than 1,000% for a meaningful estimate.');
  for (const key of ['firstHeldAndUsedDate', 'leaseStartDate'] as const) {
    const date = input[key];
    if (
      date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date)
    )
      issues.push(`${key} must be a valid date.`);
  }
  return issues;
}
