'use client';

import { useMemo, useState, type PointerEvent } from 'react';
import { money } from '@/utils/format';

interface CumulativePoint {
  month: number;
  novated: number;
  afterTax: number;
  taxSaving: number;
}

const WIDTH = 700;
const HEIGHT = 280;
const LEFT = 58;
const RIGHT = 674;
const TOP = 42;
const BOTTOM = 226;

export default function CumulativeOutlayChart({
  points,
  months,
}: {
  points: CumulativePoint[];
  months: number;
}) {
  const [inspectedMonth, setInspectedMonth] = useState(months);
  const [renderedMonths, setRenderedMonths] = useState(months);
  if (months !== renderedMonths) {
    setRenderedMonths(months);
    setInspectedMonth(months);
  }

  const geometry = useMemo(() => {
    const values = points.flatMap((point) => [point.novated, point.afterTax, point.taxSaving]);
    const minimum = Math.min(0, ...values);
    const maximum = Math.max(1, ...values);
    const paddedMaximum = maximum * 1.08;
    const range = paddedMaximum - minimum;
    const x = (month: number) => LEFT + (month / months) * (RIGHT - LEFT);
    const y = (value: number) => BOTTOM - ((value - minimum) / range) * (BOTTOM - TOP);
    const line = (key: 'novated' | 'afterTax') =>
      points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.month)} ${y(point[key])}`)
        .join(' ');
    // Filled area for the cumulative tax saving (a benefit, not a cost).
    const savingArea = [
      `M ${x(0)} ${y(0)}`,
      ...points.map((point) => `L ${x(point.month)} ${y(point.taxSaving)}`),
      `L ${x(months)} ${y(0)}`,
      'Z',
    ].join(' ');
    const yearTicks = Array.from({ length: Math.floor(months / 12) + 1 }, (_, index) => index * 12);
    if (yearTicks[yearTicks.length - 1] !== months) yearTicks.push(months);
    return { minimum, maximum: paddedMaximum, x, y, line, savingArea, yearTicks };
  }, [points, months]);

  const point = points[Math.min(inspectedMonth, months)] ?? points[months];

  function inspectFromPointer(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relative = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setInspectedMonth(Math.round(relative * months));
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGRectElement>) {
    let next = inspectedMonth;
    if (event.key === 'ArrowLeft') next -= 1;
    else if (event.key === 'ArrowRight') next += 1;
    else if (event.key === 'PageDown') next -= 12;
    else if (event.key === 'PageUp') next += 12;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = months;
    else return;
    event.preventDefault();
    setInspectedMonth(Math.min(months, Math.max(0, next)));
  }

  return (
    <div className="outlook-chart" data-testid="cumulative-outlay-chart">
      <div
        className={`chart-tooltip wide ${inspectedMonth === months ? 'selected' : ''}`}
        style={{
          left: `clamp(84px, ${(geometry.x(inspectedMonth) / WIDTH) * 100}%, calc(100% - 84px))`,
        }}
        aria-live="polite"
        data-testid="cumulative-tooltip"
      >
        <div>
          <strong>Month {inspectedMonth}</strong>
          {inspectedMonth === months && <span>Lease end</span>}
        </div>
        <dl>
          <div>
            <dt>Novated out-of-pocket</dt>
            <dd>{money(point.novated)}</dd>
          </div>
          <div>
            <dt>After-tax alternative</dt>
            <dd>{money(point.afterTax)}</dd>
          </div>
          <div>
            <dt>Tax saved so far</dt>
            <dd>{money(point.taxSaving)}</dd>
          </div>
        </dl>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Cumulative out-of-pocket cost from month 0 to month ${months}. Two cost lines: novated out-of-pocket after tax savings, and the after-tax alternative. A shaded area shows the cumulative income-tax and Medicare saving.`}
      >
        <title>
          Cumulative out-of-pocket over the lease. Hover or use arrow keys to inspect any month.
        </title>
        {[0, 0.5, 1].map((ratio) => {
          const value = geometry.minimum + (geometry.maximum - geometry.minimum) * ratio;
          const y = geometry.y(value);
          return (
            <g key={ratio}>
              <line x1={LEFT} y1={y} x2={RIGHT} y2={y} className="chart-gridline" />
              <text x={LEFT - 8} y={y + 4} textAnchor="end">
                {money(value)}
              </text>
            </g>
          );
        })}
        {geometry.yearTicks.map((month) => (
          <g key={month}>
            <line
              x1={geometry.x(month)}
              y1={TOP}
              x2={geometry.x(month)}
              y2={BOTTOM}
              className="chart-year-line"
            />
            <text x={geometry.x(month)} y={BOTTOM + 24} textAnchor="middle">
              {month === 0 ? 'Start' : `${month} mo`}
            </text>
          </g>
        ))}
        <path d={geometry.savingArea} className="chart-saving-area" />
        <path d={geometry.line('afterTax')} className="chart-alt-line" />
        <path d={geometry.line('novated')} className="chart-net-line" />
        {inspectedMonth !== months && (
          <line
            x1={geometry.x(inspectedMonth)}
            y1={TOP}
            x2={geometry.x(inspectedMonth)}
            y2={BOTTOM}
            className="chart-hover-line"
          />
        )}
        <circle
          cx={geometry.x(point.month)}
          cy={geometry.y(point.afterTax)}
          r="4"
          className="chart-alt-dot"
        />
        <circle
          cx={geometry.x(point.month)}
          cy={geometry.y(point.novated)}
          r="4"
          className="chart-net-dot"
        />
        <rect
          x={LEFT}
          y={TOP}
          width={RIGHT - LEFT}
          height={BOTTOM - TOP}
          fill="transparent"
          className="chart-hit-area"
          tabIndex={0}
          aria-label={`Inspect month ${inspectedMonth}: novated out-of-pocket ${money(point.novated)}, after-tax alternative ${money(point.afterTax)}, tax saved ${money(point.taxSaving)}. Use left and right arrow keys for one month or Page Up and Page Down for one year.`}
          onPointerMove={inspectFromPointer}
          onPointerLeave={() => setInspectedMonth(months)}
          onFocus={() => setInspectedMonth(months)}
          onKeyDown={handleKeyDown}
        />
      </svg>
      <p className="chart-note">
        Cumulative cash out of your pocket, month by month, for this lease. Both lines are real cash
        outlay; the shaded area is your accumulated income-tax and Medicare saving (a benefit, not a
        cost). The step in the final month is the residual payment. Hover the plot, or focus it and
        use the arrow keys.
      </p>
    </div>
  );
}
