const currency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const money = (value: number) => currency.format(value);
export const number = (value: number) =>
  new Intl.NumberFormat('en-AU', { maximumFractionDigits: 4 }).format(value);
export const percent = (value: number) => `${(value * 100).toFixed(2)}%`;
