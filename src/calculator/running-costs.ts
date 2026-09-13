import type { NormalizedInputs, GstRules } from './types';
import { step } from './explanations';
import { gstComponent } from './gst';
import { money, number } from '../utils/format';
function energyCost(km: number, efficiency: number, price: number, ev: boolean) {
  if (![km, efficiency, price].every(Number.isFinite) || km < 0 || efficiency <= 0 || price < 0)
    throw new Error('Invalid energy inputs.');
  const usage = (km * efficiency) / 100;
  const annual = usage * price;
  const unit = ev ? 'kWh' : 'L';
  return {
    value: annual,
    usage,
    annual,
    monthly: annual / 12,
    unit,
    steps: [
      step(
        'energy-usage',
        `Annual ${ev ? 'electricity' : 'fuel'} usage`,
        'Distance and vehicle efficiency determine how much energy you need.',
        'Annual distance × consumption ÷ 100',
        [
          ['Annual distance', km, `${number(km)} km`],
          ['Consumption', efficiency, `${number(efficiency)} ${unit}/100 km`],
        ],
        `${number(km)} × ${number(efficiency)} ÷ 100`,
        usage,
        `${number(usage)} ${unit}`,
      ),
      step(
        'energy-annual',
        `Annual ${ev ? 'charging' : 'fuel'} expense`,
        'Usage multiplied by your unit price; GST treatment is applied in the running-cost budget.',
        'Annual usage × price per unit',
        [
          ['Annual usage', usage, `${number(usage)} ${unit}`],
          ['Price per unit', price, `${money(price)}/${unit}`],
        ],
        `${number(usage)} × ${money(price)}`,
        annual,
      ),
      step(
        'energy-monthly',
        `Monthly ${ev ? 'charging' : 'fuel'} expense`,
        'The annual budget spread across twelve months.',
        'Annual energy expense ÷ 12',
        [['Annual expense', annual]],
        `${money(annual)} ÷ 12`,
        annual / 12,
      ),
    ],
  };
}
export const calculateEvRunningCost = (
  annualKm: number,
  consumptionKwhPer100Km: number,
  electricityPrice: number,
) => energyCost(annualKm, consumptionKwhPer100Km, electricityPrice, true);
export const calculateFuelRunningCost = (
  annualKm: number,
  litresPer100Km: number,
  fuelPrice: number,
) => energyCost(annualKm, litresPer100Km, fuelPrice, false);
export function calculateRunningCosts(input: NormalizedInputs, rules: GstRules) {
  const energy =
    input.vehicleType === 'BEV'
      ? calculateEvRunningCost(input.annualKm, input.evEfficiency, input.electricityPrice)
      : calculateFuelRunningCost(input.annualKm, input.fuelEfficiency, input.fuelPrice);
  const components = [
    {
      id: 'energy',
      label: input.vehicleType === 'BEV' ? 'Charging' : 'Fuel',
      gross: energy.annual,
      eligible: input.energyGstEligible ? energy.annual : 0,
    },
    {
      id: 'insurance',
      label: 'Insurance',
      gross: input.insurance,
      eligible: input.insurance - input.insuranceNonGst,
    },
    { id: 'registration', label: 'Registration', gross: input.annualRegistration, eligible: 0 },
    {
      id: 'ctp',
      label: 'Compulsory third party (CTP)',
      gross: input.annualCtp,
      eligible: 0,
    },
    { id: 'servicing', label: 'Servicing', gross: input.servicing, eligible: input.servicing },
    { id: 'tyres', label: 'Tyres', gross: input.tyres, eligible: input.tyres },
    {
      id: 'other',
      label: 'Other running costs',
      gross: input.otherRunning,
      eligible: input.otherGstEligible ? input.otherRunning : 0,
    },
  ].map((c) => ({
    ...c,
    gst: gstComponent(c.eligible, rules.rate),
    net: c.gross - gstComponent(c.eligible, rules.rate),
  }));
  const gross = components.reduce((s, c) => s + c.gross, 0);
  const gst = components.reduce((s, c) => s + c.gst, 0);
  const net = gross - gst;
  const steps = components.map((c) =>
    step(
      `running-${c.id}`,
      `${c.label} package budget`,
      'Eligible expenses are reduced only by the GST credit available to the employer. No credit is assumed for registration, CTP or unsubstantiated home charging.',
      'Gross expense − eligible GST component',
      [
        ['Gross expense', c.gross],
        ['GST-bearing portion', c.eligible],
        ['Recoverable GST', c.gst],
      ],
      `${money(c.gross)} − ${money(c.gst)}`,
      c.net,
    ),
  );
  steps.push(
    step(
      'running-gross',
      'Annual running expenses before GST credits',
      'Every running-cost component is included once.',
      'Energy + insurance + registration + CTP + servicing + tyres + other',
      components.map((c) => [c.label, c.gross]),
      components.map((c) => money(c.gross)).join(' + '),
      gross,
    ),
  );
  steps.push(
    step(
      'running-net',
      'Annual running expenses in the package',
      'The net budget is what salary packaging funds.',
      'Gross running expenses − running-cost GST credits',
      [
        ['Gross running expenses', gross],
        ['GST credits', gst],
      ],
      `${money(gross)} − ${money(gst)}`,
      net,
    ),
  );
  steps.push(
    step(
      'running-monthly',
      'Monthly running budget',
      'Annual package running costs spread over twelve months.',
      'Annual net running expenses ÷ 12',
      [['Net running expenses', net]],
      `${money(net)} ÷ 12`,
      net / 12,
    ),
  );
  return { value: net, energy, components, gross, gst, net, monthly: net / 12, steps };
}
