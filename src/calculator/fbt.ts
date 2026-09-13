import type { FbtRules, VehicleType } from './types';
import { FBT_2026 } from '../rules/fbt/2026';
type EligibilityInput = {
  vehicleType: VehicleType;
  vehicleValue: number;
  financialYear: string;
  firstHeldAndUsedDate: string;
  lctPayable: 'yes' | 'no' | 'unknown';
  leaseStartDate: string;
};
export function determineEvFbtEligibility(input: EligibilityInput, rules: FbtRules = FBT_2026) {
  const answer = (
    status: 'Likely FBT exempt' | 'Not FBT exempt' | 'Unable to determine',
    explanation: string,
  ) => ({ status, explanation, exempt: status === 'Likely FBT exempt' });
  if (rules.status !== 'legislated' || input.financialYear !== rules.financialYear)
    return answer(
      'Unable to determine',
      'No current-law rule set is configured for the selected tax year.',
    );
  if (['petrol', 'diesel', 'hybrid'].includes(input.vehicleType))
    return answer(
      'Not FBT exempt',
      'Conventional petrol, diesel and non-plug-in hybrid cars do not qualify for the electric car exemption.',
    );
  if (input.lctPayable === 'yes')
    return answer(
      'Not FBT exempt',
      'Luxury car tax has been payable on this car; the electric car exemption does not apply.',
    );
  if (input.firstHeldAndUsedDate && input.firstHeldAndUsedDate < rules.earliestUse)
    return answer('Not FBT exempt', 'The car was first held and used before 1 July 2022.');
  if (
    !input.firstHeldAndUsedDate ||
    !input.leaseStartDate ||
    input.lctPayable === 'unknown' ||
    input.vehicleValue <= 0
  )
    return answer(
      'Unable to determine',
      'Confirm the first held-and-used date, lease start, vehicle value and whether luxury car tax has ever been payable. Purchase price alone cannot establish historical LCT liability.',
    );
  if (input.firstHeldAndUsedDate > input.leaseStartDate)
    return answer(
      'Unable to determine',
      'First held-and-used date is after lease commencement. Confirm the expected delivery and commencement dates.',
    );
  if (input.vehicleType === 'PHEV')
    return input.leaseStartDate >= rules.phevCutoff
      ? answer(
          'Not FBT exempt',
          'A new PHEV commitment from 1 April 2025 does not qualify. Transitional existing agreements require separate advice and are not modelled.',
        )
      : answer(
          'Unable to determine',
          'An older PHEV agreement may qualify only under the transitional rules. Its binding commitment and prior exemption must be checked.',
        );
  return answer(
    'Likely FBT exempt',
    'BEV first held and used on or after 1 July 2022, with no LCT ever payable as declared. Assumes an eligible passenger car provided to a current employee. Confirm with your employer; future law changes are not forecast.',
  );
}
