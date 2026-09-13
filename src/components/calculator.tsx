'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import type { NormalizedInputs, LeaseYears, CalculationStep } from '@/calculator/types';
import { DEFAULT_INPUTS } from '@/calculator/defaults';
import { calculateNovatedLeaseScenario } from '@/calculator/scenario';
import { compareCashPurchase, compareLeaseDurations } from '@/calculator/comparison';
import { validateInputs } from '@/calculator/validation';
import { money, percent } from '@/utils/format';
import {
  translate,
  translateEligibilityStatus,
  translateValidationIssue,
  translateWarning,
  type Locale,
} from '@/i18n';
import NumberField from './number-field';
import CostComparison from './cost-comparison';
import SuperImpact from './super-impact';
import { InlineWorking, WorkingLedger } from './working';

type NumericKey = {
  [K in keyof NormalizedInputs]: NormalizedInputs[K] extends number ? K : never;
}[keyof NormalizedInputs];
function Metric({
  label,
  value,
  caption,
  steps,
  testId,
  locale,
}: {
  label: string;
  value: string;
  caption: string;
  steps: CalculationStep[];
  testId?: string;
  locale: Locale;
}) {
  return (
    <article className="metric">
      <div className="eyebrow">{label}</div>
      <strong data-testid={testId}>{value}</strong>
      <p>{caption}</p>
      <InlineWorking steps={steps} locale={locale} />
    </article>
  );
}
export default function Calculator() {
  const [inputs, setInputs] = useState<NormalizedInputs>(DEFAULT_INPUTS);
  const [fieldError, setFieldError] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [locale, setLocale] = useState<Locale>('en');
  const scenario = useMemo(() => calculateNovatedLeaseScenario(inputs), [inputs]);
  const durationRows = useMemo(() => compareLeaseDurations(inputs), [inputs]);
  const s = scenario;
  const outrightComparison = useMemo(() => compareCashPurchase(s), [s]);
  const tr = (key: string) => translate(locale, key);
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en-AU';
  }, [locale]);
  function update<K extends keyof NormalizedInputs>(key: K, value: NormalizedInputs[K]) {
    const next = { ...inputs, [key]: value };
    const issues = validateInputs(next);
    if (issues.length) {
      setFieldError(issues);
      return;
    }
    setFieldError([]);
    setInputs(next);
  }
  function numeric(
    key: NumericKey,
    label: string,
    options: {
      prefix?: string;
      suffix?: string;
      hint?: string;
      min?: number;
      max?: number;
      integer?: boolean;
    } = {},
  ) {
    return (
      <NumberField
        key={`${resetKey}-${key}`}
        label={label}
        value={inputs[key]}
        onChange={(value) => update(key, value)}
        locale={locale}
        {...options}
      />
    );
  }
  return (
    <>
      <header className="site-header">
        <a href="#" className="brand" aria-label={tr('novateHome')}>
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          novate<span className="brand-dot">.</span>
        </a>
        <nav aria-label={tr('mainNavigation')}>
          <a className="nav-active" href="#calculator">
            {tr('calculator')}
          </a>
          <a href="#results">{tr('results')}</a>
        </nav>
        <div className="header-tools">
          <div className="language-switcher" role="group" aria-label={tr('language')}>
            <button
              type="button"
              aria-pressed={locale === 'en'}
              aria-label={locale === 'en' ? tr('selectedEnglish') : tr('switchToEnglish')}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={locale === 'zh'}
              aria-label={locale === 'zh' ? tr('selectedChinese') : tr('switchToChinese')}
              onClick={() => setLocale('zh')}
            >
              中文
            </button>
          </div>
          <span className="year-tag">
            AU <span /> {tr('financialYear')}
          </span>
        </div>
      </header>
      <main>
        <noscript>
          <p className="important-notice">{tr('enableJavaScript')}</p>
        </noscript>
        <div className="page-intro">
          <div>
            <div className="eyebrow intro-eyebrow">{tr('introEyebrow')}</div>
            <h1>{tr('introTitle')}</h1>
            <p>{tr('introDescription')}</p>
          </div>
          <div className="trust-note">
            <ShieldCheck size={20} />
            <span>
              {tr('estimatesOnly')}
              <br />
              <strong>{tr('everyNumberShowsWorking')}</strong>
            </span>
          </div>
        </div>
        <div className="calculator-layout" id="calculator">
          <section className="input-panel" aria-labelledby="inputs-heading">
            <div className="panel-title">
              <div className="panel-title-copy">
                <div className="stage-kicker">{tr('step2Inputs')}</div>
                <h2 id="inputs-heading">{tr('buildEstimate')}</h2>
                <p>{tr('startWithEssentials')}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                title={tr('resetDemoScenario')}
                aria-label={tr('resetDemoScenario')}
                onClick={() => {
                  setInputs({ ...DEFAULT_INPUTS });
                  setResetKey((k) => k + 1);
                  setFieldError([]);
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <section className="input-section">
              <div className="input-section-heading">
                <h3>
                  <span>01</span> {tr('vehicleHeading')}
                </h3>
                <p>{tr('vehicleDescription')}</p>
              </div>
              <div className="input-section-content field-grid field-grid-vehicle">
                {numeric(
                  'carPrice',
                  inputs.advancedPrice ? tr('vehiclePriceIncludingGst') : tr('carPrice'),
                  {
                    prefix: '$',
                    hint: inputs.advancedPrice
                      ? tr('onRoadChargesAdded')
                      : tr('includesGstAdvanced'),
                  },
                )}
                <div className="field">
                  <label htmlFor="vehicle">{tr('vehicleType')}</label>
                  <div className="select-wrap">
                    <select
                      id="vehicle"
                      value={inputs.vehicleType}
                      onChange={(e) => {
                        const vehicleType = e.target.value as NormalizedInputs['vehicleType'];
                        setInputs((p) => ({
                          ...p,
                          vehicleType,
                          energyGstEligible: vehicleType !== 'BEV',
                        }));
                      }}
                    >
                      <option value="BEV">{tr('batteryElectric')}</option>
                      <option value="petrol">{tr('petrol')}</option>
                      <option value="diesel">{tr('diesel')}</option>
                      <option value="hybrid">{tr('hybrid')}</option>
                      <option value="PHEV">{tr('plugInHybrid')}</option>
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className={`eligibility ${s.eligibility.exempt ? '' : 'uncertain'}`}>
                  <ShieldCheck size={17} />
                  <span>
                    {translateEligibilityStatus(locale, s.eligibility.status)}
                    <small>
                      {s.eligibility.exempt
                        ? tr('eligibilityDetailsBelow')
                        : tr('employeeContributionApplied')}
                    </small>
                  </span>
                </div>
              </div>
            </section>
            <section className="input-section">
              <div className="input-section-heading">
                <h3>
                  <span>02</span> {tr('salaryHeading')}
                </h3>
                <p>{tr('salaryDescription')}</p>
              </div>
              <div className="input-section-content narrow-section-content">
                {numeric('salary', tr('grossAnnualSalary'), {
                  prefix: '$',
                  suffix: `/ ${tr('year')}`,
                  hint: tr('beforeTaxExcludingSuper'),
                })}
              </div>
            </section>
            <section className="input-section">
              <div className="input-section-heading">
                <h3>
                  <span>03</span> {tr('leaseHeading')}
                </h3>
                <p>{tr('leaseDescription')}</p>
              </div>
              <div className="input-section-content">
                <fieldset className="term-field">
                  <legend>{tr('leaseDuration')}</legend>
                  <div className="term-buttons">
                    {([1, 2, 3, 4, 5] as LeaseYears[]).map((y) => (
                      <button
                        type="button"
                        key={y}
                        aria-pressed={inputs.years === y}
                        onClick={() => update('years', y)}
                      >
                        {y}
                        <span>{y === 1 ? tr('year') : tr('years')}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="field-grid field-grid-2 lease-fees">
                  {numeric('interestRate', tr('effectiveInterest'), {
                    suffix: '% p.a.',
                    max: 1000,
                    hint: tr('monthlyBalloonModel'),
                  })}
                  {numeric('adminMonthly', tr('administrationFee'), {
                    prefix: '$',
                    suffix: `/ ${tr('month')}`,
                    hint: tr('includingGst'),
                  })}
                </div>
              </div>
            </section>
            <section className="input-section">
              <div className="input-section-heading">
                <h3>
                  <span>04</span> {tr('lifeOnRoadHeading')}
                </h3>
                <p>{tr('lifeOnRoadDescription')}</p>
              </div>
              <div className="input-section-content road-content">
                {numeric('annualKm', tr('annualKilometres'), {
                  suffix: locale === 'zh' ? '公里' : 'km',
                })}
                <div className="field-pair">
                  {inputs.vehicleType === 'BEV' ? (
                    <>
                      {numeric('evEfficiency', tr('evEfficiency'), {
                        suffix: locale === 'zh' ? '千瓦时/100 公里' : 'kWh/100 km',
                        min: 0.01,
                      })}
                      {numeric('electricityPrice', tr('electricityPrice'), {
                        prefix: '$',
                        suffix: locale === 'zh' ? '/ 千瓦时' : '/ kWh',
                        hint: tr('electricityPriceHint'),
                      })}
                    </>
                  ) : (
                    <>
                      {numeric('fuelEfficiency', tr('fuelEfficiency'), {
                        suffix: locale === 'zh' ? '升/100 公里' : 'L/100 km',
                        min: 0.01,
                      })}
                      {numeric('fuelPrice', tr('fuelPrice'), {
                        prefix: '$',
                        suffix: locale === 'zh' ? '/ 升' : '/ L',
                      })}
                    </>
                  )}
                </div>
                {numeric('insurance', tr('insurance'), {
                  prefix: '$',
                  suffix: `/ ${tr('year')}`,
                })}
                <details className="input-details">
                  <summary>
                    {tr('moreRunningCosts')} <ChevronDown size={16} />
                  </summary>
                  <div className="details-fields">
                    {numeric('annualRegistration', tr('annualRegistration'), {
                      prefix: '$',
                      suffix: `/ ${tr('year')}`,
                    })}
                    {numeric('annualCtp', tr('compulsoryThirdParty'), {
                      prefix: '$',
                      suffix: `/ ${tr('year')}`,
                      hint: tr('ctpHint'),
                    })}
                    {numeric('servicing', tr('servicing'), {
                      prefix: '$',
                      suffix: `/ ${tr('year')}`,
                    })}
                    {numeric('tyres', tr('tyres'), { prefix: '$', suffix: `/ ${tr('year')}` })}
                    {numeric('otherRunning', tr('otherRunningCosts'), {
                      prefix: '$',
                      suffix: `/ ${tr('year')}`,
                    })}
                  </div>
                </details>
              </div>
            </section>
            <section className="input-section advanced-section">
              <div className="input-section-heading">
                <h3>
                  <span>05</span> {tr('advancedSettings')}
                </h3>
                <p>{tr('advancedDescription')}</p>
              </div>
              <div className="input-section-content">
                <details className="advanced input-details">
                  <summary>
                    <span>
                      <SlidersHorizontal size={17} /> {tr('adjustOptionalSettings')}
                    </span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="details-fields">
                    <h4>{tr('priceGstTreatment')}</h4>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={inputs.advancedPrice}
                        onChange={(e) => update('advancedPrice', e.target.checked)}
                      />
                      {tr('breakDownOnRoadCharges')}
                    </label>
                    {inputs.advancedPrice && (
                      <>
                        {numeric('purchaseRegistration', tr('purchaseRegistration'), {
                          prefix: '$',
                        })}
                        {numeric('stampDuty', tr('stampDuty'), { prefix: '$' })}
                        {numeric('dealerCharges', tr('dealerCharges'), {
                          prefix: '$',
                        })}
                        {numeric('otherNonGst', tr('otherPurchaseCharges'), {
                          prefix: '$',
                        })}
                        <p className="field-note">{tr('onRoadChargesNote')}</p>
                      </>
                    )}
                    {numeric('insuranceNonGst', tr('insuranceDuties'), {
                      prefix: '$',
                      max: inputs.insurance,
                      suffix: `/ ${tr('year')}`,
                    })}
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={inputs.energyGstEligible}
                        onChange={(e) => update('energyGstEligible', e.target.checked)}
                      />
                      {tr('energyGstInvoices')}
                    </label>
                    <p className="field-note">{tr('energyGstNote')}</p>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={inputs.otherGstEligible}
                        onChange={(e) => update('otherGstEligible', e.target.checked)}
                      />
                      {tr('otherRunningGst')}
                    </label>
                    <h4>{tr('evExemptionEligibility')}</h4>
                    <div className="field">
                      <label htmlFor="held">{tr('firstHeldAndUsed')}</label>
                      <input
                        id="held"
                        type="date"
                        value={inputs.firstHeldAndUsedDate}
                        onChange={(e) => update('firstHeldAndUsedDate', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="start">{tr('leaseStartDate')}</label>
                      <input
                        id="start"
                        type="date"
                        value={inputs.leaseStartDate}
                        onChange={(e) => update('leaseStartDate', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="lct">{tr('lctPayableQuestion')}</label>
                      <select
                        id="lct"
                        value={inputs.lctPayable}
                        onChange={(e) =>
                          update('lctPayable', e.target.value as NormalizedInputs['lctPayable'])
                        }
                      >
                        <option value="no">{tr('lctNo')}</option>
                        <option value="yes">{tr('lctYes')}</option>
                        <option value="unknown">{tr('lctUnknown')}</option>
                      </select>
                    </div>
                    <p className="field-note">{tr('lctNote')}</p>
                    <h4>{tr('taxCircumstances')}</h4>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={inputs.helpDebt}
                        onChange={(e) => update('helpDebt', e.target.checked)}
                      />
                      {tr('helpDebt')}
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={inputs.privateHospitalCover}
                        onChange={(e) => update('privateHospitalCover', e.target.checked)}
                      />
                      {tr('privateHospitalCover')}
                    </label>
                    <div className="field">
                      <label htmlFor="family">{tr('familyStatus')}</label>
                      <select
                        id="family"
                        value={inputs.familyStatus}
                        onChange={(e) =>
                          update('familyStatus', e.target.value as NormalizedInputs['familyStatus'])
                        }
                      >
                        <option value="single">{tr('single')}</option>
                        <option value="family">{tr('family')}</option>
                      </select>
                    </div>
                    {numeric('dependants', tr('dependants'), {
                      integer: true,
                      max: 30,
                    })}
                    {inputs.familyStatus === 'family' &&
                      numeric('spouseIncome', tr('spouseIncome'), {
                        prefix: '$',
                        hint: tr('soleParentHint'),
                      })}
                    <p className="field-note">{tr('taxCircumstancesNote')}</p>
                    <h4>{tr('otherAfterTaxCosts')}</h4>
                    {numeric('upfrontAfterTax', tr('upfrontCosts'), { prefix: '$' })}
                    {numeric('endAfterTax', tr('endLeaseCosts'), { prefix: '$' })}
                  </div>
                </details>
              </div>
            </section>
            {fieldError.length > 0 && (
              <p className="form-error" role="alert">
                {fieldError.map((issue) => translateValidationIssue(locale, issue)).join(' ')}{' '}
                {tr('keepingLastValid')}
              </p>
            )}
            <div className="local-note">
              <Check size={14} /> {tr('numbersStayInBrowser')}
            </div>
          </section>
          <div className="results-column" id="results">
            <div className="results-heading">
              <div className="results-heading-copy">
                <div className="stage-kicker">{tr('step3Results')}</div>
                <h2>{tr('resultsTitle')}</h2>
                <p>{tr('resultsHelper')}</p>
              </div>
              <span className="live-pill">
                <i /> {tr('updatesAsEdit')}
              </span>
            </div>
            <section className="impact-card" aria-label={tr('takeHomeSummary')}>
              <div className="impact-main">
                <div className="eyebrow">{tr('monthlyTakeHomeDecrease')}</div>
                <div className="impact-amount">
                  <strong data-testid="monthly-impact" aria-live="polite" aria-atomic="true">
                    {money(s.takeHomeImpact.monthly)}
                  </strong>
                  <span>/ {tr('month')}</span>
                </div>
                <p>
                  {tr('impactDescription')}
                  <br />
                  {tr('residualPaidSeparately')}
                </p>
                <p className="monthly-math">
                  <strong>{tr('monthlyMaths')}</strong> {money(s.packaging.grossMonthly)}{' '}
                  {tr('packageDeduction')} − {money(s.savings.monthlyTaxAndMedicare)}{' '}
                  {tr('incomeTaxMedicareSaved')} = {money(s.takeHomeImpact.monthly)}{' '}
                  {tr('afterTaxTakeHomeImpact')}
                </p>
                <InlineWorking steps={s.takeHomeImpact.steps} locale={locale} />
              </div>
              <div className="payslip">
                <div className="payslip-title">
                  {tr('onYourPayslip')} <FileText size={16} />
                </div>
                <div>
                  <span>{tr('grossPackageDeduction')}</span>
                  <strong>{money(s.packaging.grossMonthly)}</strong>
                </div>
                <div className="pay-saving">
                  <span>{tr('incomeTaxMedicareSavedShort')}</span>
                  <strong>−{money(s.savings.monthlyTaxAndMedicare)}</strong>
                </div>
                <div className="pay-total">
                  <span>{tr('actualAfterTaxImpact')}</span>
                  <strong>{money(s.takeHomeImpact.monthly)}</strong>
                </div>
                <small>{tr('afterTaxMonthlyResidual')}</small>
              </div>
            </section>
            <div className="summary-grid">
              <Metric
                label={tr('annualTakeHomeDecrease')}
                value={money(s.takeHomeImpact.annual)}
                caption={tr('perYearDuringLease')}
                steps={s.takeHomeImpact.steps.slice(-2)}
                locale={locale}
              />
              <Metric
                label={tr('taxGstBenefit')}
                value={money(s.savings.totalBenefit)}
                caption={
                  locale === 'zh'
                    ? `${s.inputs.years} 年净收益`
                    : `Net benefit over ${s.inputs.years} years`
                }
                steps={s.savings.steps}
                testId="total-benefit"
                locale={locale}
              />
              <Metric
                label={tr('residualPayable')}
                value={money(s.residual.payout)}
                caption={
                  locale === 'zh'
                    ? `${percent(s.residual.rate)} ${tr('residualBasisIncludesGst')}`
                    : `${percent(s.residual.rate)} residual basis · includes GST`
                }
                steps={s.residual.steps}
                testId="residual"
                locale={locale}
              />
            </div>
            <div className="context-notice">
              <CircleHelp size={17} />
              <p>
                <strong>{tr('estimateNotQuote')}</strong> {tr('constantTaxScenario')}{' '}
                {tr('confirmGstThresholds')}
              </p>
            </div>
            <SuperImpact
              annualSalary={s.inputs.salary}
              salaryBaseReduction={s.packaging.preTax}
              years={s.inputs.years}
              termLabel={`${s.inputs.years} ${s.inputs.years === 1 ? tr('year') : tr('years')}`}
              locale={locale}
            />
            {(inputs.helpDebt ||
              !inputs.privateHospitalCover ||
              !s.eligibility.exempt ||
              s.takeHomeImpact.after < 0 ||
              inputs.interestRate < 7 ||
              inputs.interestRate > 12) && (
              <div className="important-notice" role="status">
                {s.warnings
                  .filter(
                    (w) =>
                      !w.startsWith('Projection') &&
                      !w.startsWith('GST car') &&
                      !w.startsWith('Insurance') &&
                      !w.startsWith('This is'),
                  )
                  .map((w) => (
                    <p key={w}>{translateWarning(locale, w)}</p>
                  ))}
              </div>
            )}
            <section className="results-panel duration-panel" aria-labelledby="duration-heading">
              <div className="section-heading duration-heading">
                <div>
                  <div className="stage-kicker">{tr('leaseTermSimulation')}</div>
                  <h2 id="duration-heading">{tr('compareTerms')}</h2>
                  <p>{tr('compareTermsDescription')}</p>
                </div>
              </div>
              <div className="table-scroll duration-table">
                <table>
                  <caption>{tr('termSimulationCaption')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{tr('leaseTerm')}</th>
                      <th scope="col">{tr('monthlyTakeHome')}</th>
                      <th scope="col">{tr('residual')}</th>
                      <th scope="col">{tr('interest')}</th>
                      <th scope="col">{tr('administration')}</th>
                      <th scope="col">{tr('runningCosts')}</th>
                      <th scope="col">{tr('taxMedicareSaved')}</th>
                      <th scope="col">{tr('gstSaved')}</th>
                      <th scope="col">{tr('totalBeforeTaxSupport')}</th>
                      <th scope="col">{tr('totalOutOfPocket')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {durationRows.map((row) => {
                      const selected = row.years === inputs.years;
                      return (
                        <tr
                          key={row.years}
                          className={`${selected ? 'current-row' : ''} ${row.lowest ? 'lowest-row' : ''}`.trim()}
                        >
                          <th scope="row">
                            <span className="duration-label">
                              {row.years} {row.years === 1 ? tr('year') : tr('years')}
                            </span>
                            <span className="duration-tags">
                              {selected && <small>{tr('selected')}</small>}
                              {row.lowest && <small>{tr('lowestTotal')}</small>}
                            </span>
                          </th>
                          <td>{money(row.monthly)}</td>
                          <td>{money(row.residual)}</td>
                          <td>{money(row.interest)}</td>
                          <td>{money(row.administration)}</td>
                          <td>{money(row.runningCosts)}</td>
                          <td>{money(row.taxAndMedicareSaved)}</td>
                          <td>{money(row.gstSaved)}</td>
                          <td>{money(row.totalBeforeIncomeTaxSupport)}</td>
                          <td>{money(row.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="duration-footnote">{tr('selectedTermNote')}</p>
            </section>
            <CostComparison
              cashTotal={outrightComparison.total}
              novatedTotal={s.totalCost.outOfPocket}
              difference={outrightComparison.differenceFromNovated}
              termLabel={`${s.inputs.years} ${s.inputs.years === 1 ? tr('year') : tr('years')}`}
              locale={locale}
            />
            <section id="working" className="results-panel working-panel">
              <div className="section-heading">
                <div>
                  <div className="stage-kicker">{tr('step4Working')}</div>
                  <h2>{tr('allCalculationSteps')}</h2>
                  <p>{tr('workingHelper')}</p>
                </div>
              </div>
              <details className="working-disclosure">
                <summary>
                  <span className="working-toggle-closed">{tr('showWorking')}</span>
                  <span className="working-toggle-open">{tr('hideWorking')}</span>
                </summary>
                <div id="working-ledger">
                  <WorkingLedger sections={s.explanations} locale={locale} />
                </div>
              </details>
            </section>
          </div>
        </div>
      </main>
      <footer>
        <a className="brand" href="#">
          novate<span className="brand-dot">.</span>
        </a>
        <p>{tr('independentEstimator')}</p>
        <span>{tr('footerLabel')}</span>
      </footer>
    </>
  );
}
