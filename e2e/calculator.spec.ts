import { test, expect } from '@playwright/test';
import { DEFAULT_INPUTS } from '../src/calculator/defaults';
import { calculateNovatedLeaseScenario } from '../src/calculator/scenario';
import { calculatePotentialSuperImpact } from '../src/calculator/superannuation';
import { money } from '../src/utils/format';

test('initial result matches the pure engine and fits the viewport', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const s = calculateNovatedLeaseScenario(DEFAULT_INPUTS);
  const superImpact = calculatePotentialSuperImpact(
    s.inputs.salary,
    s.packaging.preTax,
    s.inputs.years,
  );
  await expect(page.getByTestId('monthly-impact')).toHaveText(money(s.takeHomeImpact.monthly));
  await expect(page.getByTestId('super-impact')).toBeVisible();
  await expect(page.getByTestId('super-annual-loss')).toHaveText(money(superImpact.annualLoss));
  await expect(page.getByTestId('super-term-loss')).toHaveText(money(superImpact.termLoss));
  await expect(page.getByTestId('super-reduced-salary')).toContainText(
    money(superImpact.reducedSalary),
  );
  await expect(page.getByTestId('super-capped-base-after')).toContainText(
    money(superImpact.superableBaseAfter),
  );
  await expect(page.locator('.duration-table tbody tr')).toHaveCount(5);
  await expect(page.locator('.duration-table .current-row td').last()).toHaveText(
    money(s.totalCost.outOfPocket),
  );
  await expect(page.getByLabel('Effective lease interest rate')).toHaveValue('11');
  await page.getByText('More running costs', { exact: false }).click();
  await expect(page.getByLabel('Annual registration')).toHaveValue('84');
  await expect(page.getByLabel('Administration fee')).toHaveValue('31');
  await expect(page.getByLabel('Compulsory third party (CTP)')).toHaveValue('632');
  await expect(page.getByLabel('Insurance', { exact: true })).toHaveValue('3,000');
  await expect(page.getByLabel('Servicing')).toHaveValue('200');
  await expect(page.locator('.total-strip')).toHaveCount(0);
  await expect(page.locator('.scenario-explorer')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true });
  await page.screenshot({ path: `test-results/${testInfo.project.name}-top.png` });
  await page.locator('.impact-card').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-results.png` });
  expect(errors).toEqual([]);
});

test('super impact respects the annual ATO contribution cap', async ({ page }) => {
  await page.goto('/');
  const salary = page.getByLabel('Gross annual salary', { exact: true });
  await salary.click();
  await expect(salary).toHaveValue('150000');
  await salary.fill('300000');

  await expect(page.getByTestId('super-cap')).toHaveText('$270,830.00');
  await expect(page.getByTestId('super-max-payment')).toHaveText('$32,499.60');
  await expect(page.getByTestId('super-annual-loss')).toHaveText('$0.00');
  await expect(page.getByTestId('super-term-loss')).toHaveText('$0.00');
  await expect(page.getByTestId('super-impact')).toContainText('no potential SG loss is shown');
});

test('Chinese locale translates the calculator without changing the result', async ({ page }) => {
  await page.goto('/');
  const initial = await page.getByTestId('monthly-impact').textContent();
  await page.getByRole('button', { name: 'Switch to Chinese', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { name: '估算Novated Lease成本与开支' })).toBeVisible();
  await expect(page.getByLabel('车辆类型', { exact: true })).toBeVisible();
  await expect(page.getByLabel('电价', { exact: true })).toHaveValue('0.3');
  await expect(
    page.getByText('公共充电桩平均价格：$0.55/千瓦时。家庭充电通常为 $0.08–$0.30/千瓦时。'),
  ).toBeVisible();
  await expect(page.getByText('租赁期限模拟', { exact: true })).toBeVisible();
  await expect(page.locator('.duration-table thead th').nth(1)).toHaveText('每月成本');
  await expect(page.getByText('每月付款', { exact: true })).toBeVisible();
  await expect(page.getByText('年度成本（自付）', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '潜在雇主养老金损失' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '全部计算步骤' })).toBeVisible();
  await expect(page.locator('#working-ledger')).toBeHidden();
  await expect(page.locator('[data-testid="outright-comparison"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: '全款购买 vs Novated Lease' })).toBeVisible();
  await expect(page.locator('.comparison-chart-row')).toHaveCount(2);
  await page.locator('.working-disclosure > summary').click();
  await expect(page.locator('#working-ledger .math-section').first().locator('h3')).toHaveText(
    '车辆购车价格',
  );
  await expect(page.getByTestId('monthly-impact')).toHaveText(initial!);
  await expect(page.locator('.duration-table tbody tr')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: '切换到英文', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-AU');
  await expect(page.getByLabel('Car price', { exact: true })).toBeVisible();
});

test('inputs come before results and the lease simulation is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.input-section-heading h3')).toHaveText([
    '01 Your vehicle',
    '02 Your salary',
    '03 Your lease',
    '04 Life on the road',
    '05 Advanced settings',
  ]);
  const inputs = await page.locator('.input-panel').boundingBox();
  const results = await page.locator('.results-column').boundingBox();
  if (!inputs || !results) throw new Error('Input or result stage is not visible.');
  expect(inputs.y + inputs.height).toBeLessThan(results.y);
  await expect(page.locator('.input-panel')).toHaveCSS('position', 'static');
  await expect(page.locator('.duration-table tbody tr')).toHaveCount(5);
  await expect(page.locator('.duration-table thead th').nth(1)).toHaveText('Monthly cost');
  await expect(page.locator('#working')).toBeVisible();
  await expect(page.locator('#working-ledger')).toBeHidden();
  await expect(page.locator('.working-disclosure > summary')).toContainText(
    'Show all calculation steps',
  );
  await expect(page.getByText('MONTHLY PAYMENT', { exact: true })).toBeVisible();
  await expect(page.getByText('Annual Cost (out-of-pocket)', { exact: true })).toBeVisible();
  await expect(page.locator('[data-testid="outright-comparison"]')).toBeVisible();
  await expect(page.locator('.comparison-chart-row')).toHaveCount(2);
  await expect(page.locator('.scenario-explorer')).toHaveCount(0);
  await expect(page.locator('.scenario-controls')).toHaveCount(0);
  await expect(page.locator('.scenario-line-chart')).toHaveCount(0);
  await expect(page.locator('#comparison')).toHaveCount(0);
  await page.locator('.working-disclosure > summary').click();
  await expect(page.locator('#working-ledger')).toBeVisible();
  await expect(page.locator('#working-ledger .math-section')).toHaveCount(21);
  await expect(page.locator('#working-ledger .math-equation').first()).toBeVisible();
  await expect(page.locator('#working-ledger .math-equation code').first()).toBeVisible();
});

test('primary outputs and energy math update while typing', async ({ page }) => {
  await page.goto('/');
  const field = page.getByLabel('Electricity price', { exact: true });
  await field.fill('0.4');
  const expected = calculateNovatedLeaseScenario({ ...DEFAULT_INPUTS, electricityPrice: 0.4 });
  await expect(page.getByTestId('monthly-impact')).toHaveText(
    money(expected.takeHomeImpact.monthly),
  );
  await expect(
    page.locator('#working-energy [data-step="energy-annual"] .math-equation'),
  ).toContainText('$0.40');
  await expect(
    page.locator('#working-energy [data-step="energy-annual"] .math-equation strong'),
  ).toContainText(money(expected.runningCosts.energy.annual));
  await field.fill('0.5');
  await expect(
    page.locator('#working-energy [data-step="energy-annual"] .math-equation'),
  ).toContainText('$0.50');
});

test('incomplete currency preserves previous results and reset restores demo', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(250);
  const initial = await page.getByTestId('monthly-impact').textContent();
  const price = page.getByLabel('Car price', { exact: true });
  await price.fill('$70,');
  await expect(price).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('monthly-impact')).toHaveText(initial!);
  await price.fill('80000');
  await expect(page.getByTestId('monthly-impact')).not.toHaveText(initial!);
  await page.getByRole('button', { name: 'Reset to demo scenario' }).click();
  await expect(page.getByTestId('monthly-impact')).toHaveText(initial!);
  await expect(price).toHaveValue('64,200');
});

test('reset restores the updated running-cost defaults', async ({ page }) => {
  await page.goto('/');
  await page.getByText('More running costs', { exact: false }).click();
  const insurance = page.getByLabel('Insurance', { exact: true });
  const servicing = page.getByLabel('Servicing', { exact: true });
  await insurance.fill('2500');
  await servicing.fill('100');
  await page.getByRole('button', { name: 'Reset to demo scenario' }).click();
  await expect(insurance).toHaveValue('3,000');
  await expect(servicing).toHaveValue('200');
});

test('lease term buttons update the same scenario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '5 years' }).click();
  const s = calculateNovatedLeaseScenario({ ...DEFAULT_INPUTS, years: 5 });
  await expect(page.getByTestId('monthly-impact')).toHaveText(money(s.takeHomeImpact.monthly));
  await expect(page.getByTestId('residual')).toHaveText(money(s.residual.payout));
  await expect(page.locator('.duration-table .current-row th')).toContainText('5 years');
  await expect(page.locator('.duration-table .current-row td').last()).toHaveText(
    money(s.totalCost.outOfPocket),
  );
});

test('advanced conditions show limitations and unknown eligibility uses ECM', async ({ page }) => {
  await page.goto('/');
  await page.locator('.advanced > summary').click();
  await page.getByLabel('I have a HELP / HECS debt').check();
  await page.getByLabel('Appropriate private hospital cover all year').uncheck();
  await page.getByLabel('Has luxury car tax ever been payable?').selectOption('unknown');
  await expect(page.locator('.important-notice')).toContainText(
    'HELP/HECS repayments are NOT included',
  );
  await expect(page.locator('.important-notice')).toContainText('surcharge is NOT included');
  await expect(page.locator('.eligibility')).toContainText('Unable to determine');
});

test('individual result working matches the headline', async ({ page }) => {
  await page.goto('/');
  await page.locator('.impact-main > .inline-working > summary').click();
  const value = await page.getByTestId('monthly-impact').textContent();
  await expect(
    page.locator('.impact-main [data-step="take-home-monthly"] .formula strong'),
  ).toContainText(value!);
  await expect(page.getByRole('tab')).toHaveCount(0);
});

test('ICE inputs calculate fuel immediately and no horizontal body overflow after expansion', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Vehicle type', { exact: true }).selectOption('petrol');
  await page.getByLabel('Fuel price', { exact: true }).fill('2.1');
  const expected = calculateNovatedLeaseScenario({
    ...DEFAULT_INPUTS,
    vehicleType: 'petrol',
    fuelPrice: 2.1,
  });
  await expect(
    page.locator('#working-energy [data-step="energy-annual"] .math-equation'),
  ).toContainText(money(expected.runningCosts.energy.annual));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('responsive layouts and keyboard focus work at narrow and intermediate widths', async ({
  page,
}) => {
  await page.goto('/');
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `body overflow at ${width}px`,
    ).toBe(true);
  }
  const workingToggle = page.locator('.working-disclosure > summary');
  await workingToggle.focus();
  await expect(workingToggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#working-ledger')).toBeVisible();
});
