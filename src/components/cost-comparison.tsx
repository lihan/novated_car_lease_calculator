import { translate, type Locale } from '@/i18n';
import { money } from '@/utils/format';

type CostComparisonProps = {
  cashTotal: number;
  novatedTotal: number;
  difference: number;
  termLabel: string;
  locale?: Locale;
};

export default function CostComparison({
  cashTotal,
  novatedTotal,
  difference,
  termLabel,
  locale = 'en',
}: CostComparisonProps) {
  const tr = (key: string) => translate(locale, key);
  const maximum = Math.max(cashTotal, novatedTotal, 1);
  const cashWidth = `${Math.max((cashTotal / maximum) * 100, 8)}%`;
  const novatedWidth = `${Math.max((novatedTotal / maximum) * 100, 8)}%`;
  const differenceLabel =
    difference > 0 ? 'novatedSaves' : difference < 0 ? 'novatedCostsMore' : 'sameModeledCost';

  return (
    <section
      className="results-panel comparison-panel"
      aria-labelledby="outright-comparison-heading"
      data-testid="outright-comparison"
    >
      <div className="section-heading comparison-heading">
        <div>
          <div className="stage-kicker">{tr('costComparison')}</div>
          <h2 id="outright-comparison-heading">{tr('compareOutright')}</h2>
          <p>{tr('compareOutrightDescription')}</p>
        </div>
      </div>
      <div className="comparison-body">
        <figure className="comparison-chart">
          <figcaption>{tr('outOfPocketComparison')}</figcaption>
          <div className="comparison-chart-rows">
            <div className="comparison-chart-row">
              <div className="comparison-chart-label">
                <span className="chart-swatch chart-swatch-cash" aria-hidden="true" />
                <span>{tr('buyOutright')}</span>
              </div>
              <div className="comparison-chart-track" aria-hidden="true">
                <span
                  className="comparison-chart-fill comparison-chart-fill-cash"
                  style={{ width: cashWidth }}
                />
              </div>
              <strong className="comparison-chart-value">{money(cashTotal)}</strong>
            </div>
            <div className="comparison-chart-row">
              <div className="comparison-chart-label">
                <span className="chart-swatch chart-swatch-novated" aria-hidden="true" />
                <span>{tr('novatedLease')}</span>
              </div>
              <div className="comparison-chart-track" aria-hidden="true">
                <span
                  className="comparison-chart-fill comparison-chart-fill-novated"
                  style={{ width: novatedWidth }}
                />
              </div>
              <strong className="comparison-chart-value">{money(novatedTotal)}</strong>
            </div>
          </div>
          <p className="comparison-term">
            {tr('comparisonSelectedTerm')}: <strong>{termLabel}</strong>
          </p>
        </figure>
        <aside className={`comparison-callout ${difference >= 0 ? 'is-positive' : 'is-negative'}`}>
          <div className="eyebrow">{tr('estimatedDifference')}</div>
          <strong data-testid="comparison-difference">{money(Math.abs(difference))}</strong>
          <p>
            {tr(differenceLabel)}
            {difference !== 0 && ` ${tr('comparedWithOutright')}`}
          </p>
          <p className="comparison-note">{tr('comparisonNote')}</p>
        </aside>
      </div>
    </section>
  );
}
