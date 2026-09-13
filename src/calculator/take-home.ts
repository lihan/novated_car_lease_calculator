import { step } from './explanations';
import { money } from '../utils/format';
export function calculateTakeHomeImpact(
  salary: number,
  preTax: number,
  postTax: number,
  incomeTaxBefore: number,
  incomeTaxAfter: number,
  medicareBefore: number,
  medicareAfter: number,
) {
  const before = salary - incomeTaxBefore - medicareBefore;
  const after = salary - preTax - postTax - incomeTaxAfter - medicareAfter;
  const annual = before - after;
  const monthly = annual / 12;
  const steps = [
    step(
      'take-home-before',
      'Take-home pay without the lease',
      'Income tax and Medicare are deducted from salary. HELP and Medicare levy surcharge are excluded.',
      'Salary − income tax − Medicare',
      [
        ['Salary', salary],
        ['Income tax', incomeTaxBefore],
        ['Medicare', medicareBefore],
      ],
      `${money(salary)} − ${money(incomeTaxBefore)} − ${money(medicareBefore)}`,
      before,
    ),
    step(
      'take-home-after',
      'Take-home pay with the lease',
      'Pre-tax deductions reduce taxable salary. Employee contributions and any unfunded package excess are paid after tax.',
      'Salary − pre-tax package − post-tax contribution − income tax − Medicare',
      [
        ['Salary', salary],
        ['Pre-tax package', preTax],
        ['Post-tax contribution', postTax],
        ['Income tax', incomeTaxAfter],
        ['Medicare', medicareAfter],
      ],
      `${money(salary)} − ${money(preTax)} − ${money(postTax)} − ${money(incomeTaxAfter)} − ${money(medicareAfter)}`,
      after,
    ),
    step(
      'take-home-annual',
      'Annual take-home pay decrease',
      'The difference in spendable pay, including the lease and running budget.',
      'Take-home without lease − take-home with lease',
      [
        ['Without lease', before],
        ['With lease', after],
      ],
      `${money(before)} − ${money(after)}`,
      annual,
    ),
    step(
      'take-home-monthly',
      'Monthly take-home pay decrease',
      'This is the change to your pay, before setting money aside for the residual.',
      'Annual take-home decrease ÷ 12',
      [['Annual decrease', annual]],
      `${money(annual)} ÷ 12`,
      monthly,
    ),
  ];
  return { value: monthly, before, after, annual, monthly, steps };
}
