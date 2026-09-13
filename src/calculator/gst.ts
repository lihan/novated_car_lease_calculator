import type { NormalizedInputs, GstRules } from './types';
import { GST_2026_27 } from '../rules/tax/2026-27';
import { money, number } from '../utils/format';
import { step } from './explanations';
export const gstComponent = (inclusive: number, rate: number) => (inclusive * rate) / (1 + rate);
export function calculateGstBenefit(input: NormalizedInputs, rules: GstRules = GST_2026_27) {
  const eligible = input.carPrice + (input.advancedPrice ? input.dealerCharges : 0);
  const nonGstCharges = input.advancedPrice
    ? input.purchaseRegistration + input.stampDuty + input.otherNonGst
    : 0;
  const purchaseTotal = eligible + nonGstCharges;
  const includedGst = gstComponent(eligible, rules.rate);
  const recoverableVehicleGST = Math.min(includedGst, rules.maxVehicleCredit);
  const nonRecoverableVehicleGST = includedGst - recoverableVehicleGST;
  const amountFinanced = purchaseTotal - recoverableVehicleGST;
  return {
    recoverableVehicleGST,
    nonRecoverableVehicleGST,
    vehicleGSTSaving: recoverableVehicleGST,
    includedGst,
    purchaseTotal,
    amountFinanced,
    eligible,
    nonGstCharges,
    steps: [
      step(
        'vehicle-price',
        'Total vehicle purchase price',
        input.advancedPrice
          ? 'Vehicle and dealer charges include GST. Registration, stamp duty and other non-GST charges are added separately.'
          : 'Simple mode treats the entire car price as GST-inclusive eligible vehicle expenditure. Use the price breakdown for non-GST on-road charges.',
        'Eligible vehicle expenditure + non-GST charges',
        [
          ['GST-inclusive vehicle and dealer charges', eligible],
          ['Non-GST charges', nonGstCharges],
        ],
        `${money(eligible)} + ${money(nonGstCharges)}`,
        purchaseTotal,
      ),
      step(
        'vehicle-gst-included',
        'GST included in the price',
        'Only the GST-bearing part of the purchase contains recoverable GST.',
        'Eligible GST-inclusive amount ÷ GST divisor',
        [
          ['Eligible amount', eligible],
          ['GST divisor', (1 + rules.rate) / rules.rate, number((1 + rules.rate) / rules.rate)],
        ],
        `${money(eligible)} ÷ ${number((1 + rules.rate) / rules.rate)}`,
        includedGst,
      ),
      step(
        'vehicle-gst-credit',
        'Recoverable vehicle GST',
        'The model applies the ordinary passenger-car credit cap supplied in the brief. No GST credit is claimed on duties or registration.',
        'min(included GST, maximum ordinary GST credit)',
        [
          ['Included GST', includedGst],
          ['Maximum credit', rules.maxVehicleCredit],
        ],
        `min(${money(includedGst)}, ${money(rules.maxVehicleCredit)})`,
        recoverableVehicleGST,
      ),
      step(
        'vehicle-gst-unrecovered',
        'Non-recoverable vehicle GST',
        'GST above the ordinary cap remains part of the financed cost.',
        'Included GST − recoverable GST',
        [
          ['Included GST', includedGst],
          ['Recoverable GST', recoverableVehicleGST],
        ],
        `${money(includedGst)} − ${money(recoverableVehicleGST)}`,
        nonRecoverableVehicleGST,
      ),
      step(
        'amount-financed',
        'Amount financed',
        'The acquisition GST credit lowers borrowing once. It is not subtracted again from take-home cost.',
        'Total purchase price − recoverable vehicle GST',
        [
          ['Purchase price', purchaseTotal],
          ['GST credit', recoverableVehicleGST],
        ],
        `${money(purchaseTotal)} − ${money(recoverableVehicleGST)}`,
        amountFinanced,
      ),
    ],
  };
}
