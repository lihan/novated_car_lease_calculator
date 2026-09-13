'use client';
import { useId, useState } from 'react';
import { parseNumericInput } from '@/calculator/validation';
import { translate, type Locale } from '@/i18n';
export default function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min = 0,
  max = 1e9,
  integer = false,
  locale = 'en',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  locale?: Locale;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = draft === null ? value : parseNumericInput(draft);
  const invalid =
    parsed === null || parsed < min || parsed > max || (integer && !Number.isInteger(parsed));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap ${invalid ? 'invalid' : ''}`}>
        {prefix && <span>{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={
            draft ??
            new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-AU', {
              maximumFractionDigits: 8,
            }).format(value)
          }
          aria-invalid={invalid}
          aria-describedby={hint || invalid ? `${id}-hint` : undefined}
          onFocus={() => setDraft(String(value))}
          onChange={(e) => {
            setDraft(e.target.value);
            const next = parseNumericInput(e.target.value);
            if (next !== null && next >= min && next <= max && (!integer || Number.isInteger(next)))
              onChange(next);
          }}
          onBlur={() => {
            if (!invalid) setDraft(null);
          }}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {(invalid || hint) && (
        <small id={`${id}-hint`} className={invalid ? 'field-error' : ''}>
          {invalid ? translate(locale, 'fieldNumberError') : hint}
        </small>
      )}
    </div>
  );
}
