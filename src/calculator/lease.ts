import { GST_2026_27 } from '../rules/tax/2026-27';
import { ATO_CAR_RESIDUALS } from '../rules/lease/ato-residuals';
import type { LeaseYears } from './types';
import { step } from './explanations';
import { money, number, percent } from '../utils/format';
export function calculateResidual(
  leaseValue: number,
  years: LeaseYears,
  gstRate = GST_2026_27.rate,
) {
  if (!(years in ATO_CAR_RESIDUALS)) throw new Error('Invalid residual inputs.');
  return calculateResidualForMonths(leaseValue, years * 12, gstRate);
}

export function calculateResidualForMonths(
  leaseValue: number,
  months: number,
  gstRate = GST_2026_27.rate,
) {
  if (
    !Number.isFinite(leaseValue) ||
    !Number.isInteger(months) ||
    !Number.isFinite(gstRate) ||
    leaseValue < 0 ||
    months < 1 ||
    months > 60 ||
    gstRate < 0
  )
    throw new Error('Invalid residual inputs.');
  // TD 93/142: 75% − ((75% ÷ 8-year effective life) × lease years).
  // The ATO table presents percentages to two decimal places, so keep that convention monthly.
  const rate = Math.round((0.75 - (0.75 / 8) * (months / 12)) * 10000) / 10000;
  const excludingGst = leaseValue * rate;
  const gst = excludingGst * gstRate;
  const payout = excludingGst + gst;
  const steps = [
    step(
      'residual-net',
      'Residual excluding GST',
      'The model uses the financed cost after acquisition GST credit as the residual basis, including financed on-road charges. The percentage follows the ATO eight-year effective-life formula. Confirm the cost basis in the actual lease quote.',
      'Lease value × residual percentage',
      [
        ['Lease value', leaseValue],
        ['Residual percentage', rate, percent(rate)],
      ],
      `${money(leaseValue)} × ${percent(rate)}`,
      excludingGst,
    ),
    step(
      'residual-gst',
      'GST on final purchase',
      'Buying the car at lease end is a taxable sale. The private purchase GST is not recovered.',
      'Residual excluding GST × GST rate',
      [
        ['Residual excluding GST', excludingGst],
        ['GST rate', gstRate, percent(gstRate)],
      ],
      `${money(excludingGst)} × ${percent(gstRate)}`,
      gst,
    ),
    step(
      'residual-payout',
      'Final residual payable',
      'This is paid from after-tax money and is included once in the total cost.',
      'Residual excluding GST + GST',
      [
        ['Residual excluding GST', excludingGst],
        ['GST', gst],
      ],
      `${money(excludingGst)} + ${money(gst)}`,
      payout,
    ),
  ];
  return { value: payout, rate, excludingGst, gst, payout, steps };
}
export function calculateLeasePayment(
  principal: number,
  residual: number,
  annualRate: number,
  months: number,
) {
  if (
    ![principal, residual, annualRate, months].every(Number.isFinite) ||
    principal < 0 ||
    residual < 0 ||
    annualRate < 0 ||
    months <= 0 ||
    !Number.isInteger(months)
  )
    throw new Error('Invalid finance inputs.');
  const r = annualRate / 100 / 12;
  const discount = Math.exp(-months * Math.log1p(r));
  const presentValueResidual = residual * discount;
  const monthly =
    r === 0
      ? (principal - residual) / months
      : ((principal - presentValueResidual) * r) / -Math.expm1(-months * Math.log1p(r));
  const totalPayments = monthly * months;
  const interest = totalPayments + residual - principal;
  const steps = [
    step(
      'monthly-rate',
      'Monthly interest rate',
      'The entered annual rate is divided by 12, as specified by the monthly balloon model. It is not an APR comparison rate or an effective annual yield.',
      'Annual rate ÷ 12',
      [['Annual rate', annualRate / 100, percent(annualRate / 100)]],
      `${percent(annualRate / 100)} ÷ 12`,
      r,
      percent(r),
    ),
    step(
      'pv-residual',
      'Present value of residual',
      'Discount the balloon payment back to the start of the lease.',
      'Residual ÷ (1 + monthly rate)ⁿ',
      [
        ['Residual', residual],
        ['Monthly rate', r, percent(r)],
        ['Months', months, number(months)],
      ],
      `${money(residual)} ÷ (1 + ${number(r)})^${months}`,
      presentValueResidual,
    ),
    step(
      'finance-monthly',
      'Monthly finance payment',
      'Monthly payments in arrears with no deposit. Lease rentals shown net of recoverable rental GST.',
      r === 0
        ? '(Principal − residual) ÷ months'
        : '(Principal − present value of residual) × monthly rate ÷ (1 − (1 + monthly rate)⁻ⁿ)',
      [
        ['Principal', principal],
        ['Present value of residual', presentValueResidual],
        ['Monthly rate', r, percent(r)],
        ['Months', months, number(months)],
      ],
      r === 0
        ? `(${money(principal)} − ${money(residual)}) ÷ ${months}`
        : `(${money(principal)} − ${money(presentValueResidual)}) × ${number(r)} ÷ (1 − (1 + ${number(r)})^−${months})`,
      monthly,
    ),
    step(
      'finance-total',
      'Total finance payments',
      'Regular payments only; the residual is shown separately.',
      'Monthly payment × months',
      [
        ['Monthly payment', monthly],
        ['Months', months, number(months)],
      ],
      `${money(monthly)} × ${months}`,
      totalPayments,
    ),
    step(
      'finance-interest',
      'Total estimated interest',
      'All finance payments plus the finance balloon, less the amount borrowed. Residual purchase GST is excluded from interest.',
      'Total payments + residual excluding GST − principal',
      [
        ['Total payments', totalPayments],
        ['Residual', residual],
        ['Principal', principal],
      ],
      `${money(totalPayments)} + ${money(residual)} − ${money(principal)}`,
      interest,
    ),
  ];
  return {
    value: monthly,
    monthly,
    annual: monthly * 12,
    months,
    principal,
    presentValueResidual,
    totalPayments,
    interest,
    steps,
  };
}
