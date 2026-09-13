import type { CalculationSection, CalculationStep } from '@/calculator/types';
import { translate, translateSectionTitle, translateStep, type Locale } from '@/i18n';

export function Steps({ steps, locale = 'en' }: { steps: CalculationStep[]; locale?: Locale }) {
  return (
    <div className="steps">
      {steps.map((sourceStep) => {
        const s = translateStep(locale, sourceStep);
        return (
          <article className="step" key={s.id} data-step={s.id}>
            <h4>{s.title}</h4>
            <p>{s.description}</p>
            <dl>
              {s.inputs.map((i, index) => (
                <div key={`${i.label}-${index}`}>
                  <dt>{i.label}</dt>
                  <dd>{i.formattedValue}</dd>
                </div>
              ))}
            </dl>
            <div className="formula">
              <span>{s.formula}</span>
              <code>{s.calculation}</code>
              <strong data-result={s.result}>≈ {s.formattedResult}</strong>
            </div>
            <details className="precision">
              <summary>{translate(locale, 'unroundedValues')}</summary>
              <p>{translate(locale, 'precisionNote')}</p>
              <dl>
                {s.inputs.map((i, index) => (
                  <div key={index}>
                    <dt>{i.label}</dt>
                    <dd>{String(i.value)}</dd>
                  </div>
                ))}
                <div>
                  <dt>{translate(locale, 'result')}</dt>
                  <dd>{String(s.result)}</dd>
                </div>
              </dl>
            </details>
          </article>
        );
      })}
    </div>
  );
}

function MathSteps({ steps, locale }: { steps: CalculationStep[]; locale: Locale }) {
  return (
    <div className="math-steps">
      {steps.map((sourceStep) => {
        const s = translateStep(locale, sourceStep);
        return (
          <article className="math-step" key={s.id} data-step={s.id}>
            <h4>{s.title}</h4>
            <div className="math-equation">
              <span>{s.formula}</span>
              <code>{s.calculation}</code>
              <strong data-result={s.result}>= {s.formattedResult}</strong>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function InlineWorking({
  steps,
  locale = 'en',
}: {
  steps: CalculationStep[];
  locale?: Locale;
}) {
  return (
    <details className="inline-working">
      <summary>{translate(locale, 'howCalculated')}</summary>
      <Steps steps={steps} locale={locale} />
    </details>
  );
}

export function WorkingLedger({
  sections,
  locale = 'en',
}: {
  sections: CalculationSection[];
  locale?: Locale;
}) {
  return (
    <div className="math-ledger">
      {sections.map((section, index) => (
        <section key={section.id} id={`working-${section.id}`} className="math-section">
          <div className="math-section-heading">
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{translateSectionTitle(locale, section)}</h3>
          </div>
          <MathSteps steps={section.steps} locale={locale} />
        </section>
      ))}
    </div>
  );
}
