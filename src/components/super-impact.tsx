import { calculatePotentialSuperImpact } from '@/calculator/superannuation';
import { translate, type Locale } from '@/i18n';
import { money, percent } from '@/utils/format';

type SuperImpactProps = {
  annualSalary: number;
  salaryBaseReduction: number;
  years: number;
  termLabel: string;
  locale?: Locale;
};

export default function SuperImpact({
  annualSalary,
  salaryBaseReduction,
  years,
  termLabel,
  locale = 'en',
}: SuperImpactProps) {
  const tr = (key: string) => translate(locale, key);
  const impact = calculatePotentialSuperImpact(annualSalary, salaryBaseReduction, years);
  const capAbsorbsReduction =
    impact.salaryBaseReduction > 0 && impact.superableBaseBefore === impact.superableBaseAfter;

  return (
    <section
      className="results-panel super-impact-panel"
      aria-labelledby="super-impact-heading"
      data-testid="super-impact"
    >
      <div className="section-heading super-impact-heading">
        <div>
          <div className="stage-kicker">{tr('superImpact')}</div>
          <h2 id="super-impact-heading">{tr('superImpactTitle')}</h2>
          <p>{tr('superImpactDescription')}</p>
        </div>
        <span className="super-impact-badge">{tr('superExcluded')}</span>
      </div>
      <div className="super-impact-body">
        <div className="super-impact-copy">
          <div className="super-impact-formula">
            <span>{tr('superFormula')}</span>
            <strong>
              ({money(impact.superableBaseBefore)} − {money(impact.superableBaseAfter)}) ×{' '}
              {percent(impact.rate)} = {money(impact.annualLoss)}
            </strong>
          </div>
          <div
            className="super-impact-working"
            aria-label={tr('superWorking')}
            data-testid="super-working"
          >
            <div className="super-impact-working-title">{tr('superWorking')}</div>
            <div className="super-impact-working-row">
              <span>{tr('superReducedSalary')}</span>
              <code data-testid="super-reduced-salary">
                {money(impact.annualSalary)} − {money(impact.salaryBaseReduction)} ={' '}
                {money(impact.reducedSalary)}
              </code>
            </div>
            <div className="super-impact-working-row">
              <span>{tr('superCappedBaseAfter')}</span>
              <code data-testid="super-capped-base-after">
                min({money(impact.reducedSalary)}, {money(impact.maximumContributionBase)}) ={' '}
                {money(impact.superableBaseAfter)}
              </code>
            </div>
          </div>
          <div className="super-impact-cap-details">
            <div className="super-impact-cap-item">
              <span>{tr('superCapBase')}</span>
              <strong data-testid="super-cap">{money(impact.maximumContributionBase)}</strong>
              <small>{tr('perFinancialYear')}</small>
            </div>
            <div className="super-impact-cap-item">
              <span>{tr('superMaxPayment')}</span>
              <strong data-testid="super-max-payment">{money(impact.maximumAnnualPayment)}</strong>
              <small>{tr('perFinancialYear')}</small>
            </div>
          </div>
          <p className="super-impact-note">{tr('superCapNote')}</p>
          {capAbsorbsReduction && <p className="super-impact-note">{tr('superNoLoss')}</p>}
          <p className="super-impact-note">{tr('superAssumption')}</p>
        </div>
        <div className="super-impact-metrics">
          <div className="super-impact-metric">
            <div className="eyebrow">{tr('superAnnualLoss')}</div>
            <strong data-testid="super-annual-loss" aria-live="polite">
              {money(impact.annualLoss)}
            </strong>
            <span>/ {tr('year')}</span>
          </div>
          <div className="super-impact-metric super-impact-metric-term">
            <div className="eyebrow">{tr('superTermLoss')}</div>
            <strong data-testid="super-term-loss" aria-live="polite">
              {money(impact.termLoss)}
            </strong>
            <span>{termLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
