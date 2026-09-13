import type { CalculationStep, CalculationSection } from './types';
import { money } from '../utils/format';
export function step(
  id: string,
  title: string,
  description: string,
  formula: string,
  inputs: [string, number, string?][],
  calculation: string,
  result: number,
  formattedResult = money(result),
): CalculationStep {
  return {
    id,
    title,
    description,
    formula,
    inputs: inputs.map(([label, value, formattedValue]) => ({
      label,
      value,
      formattedValue: formattedValue ?? money(value),
    })),
    calculation,
    result,
    formattedResult,
  };
}
export function generateCalculationExplanation(
  sections: CalculationSection[],
): CalculationSection[] {
  return sections;
}
