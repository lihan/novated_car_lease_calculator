'use client';

import { useMemo, useState, type PointerEvent } from 'react';
import { money } from '@/utils/format';

interface MonthlyPoint {
  month: number;
  novated: number;
  afterTax: number;
}

const WIDTH = 700;
const HEIGHT = 240;
const LEFT = 58;
const RIGHT = 674;
const TOP = 30;
const BOTTOM = 196;

export default function MonthlyOutlayChart({
  points,
  months,
}: {
  points: MonthlyPoint[];
  months: number;
}) {
  const [inspectedMonth, setInspectedMonth] = useState(months);
  const [renderedMonths, setRenderedMonths] = useState(months);
  if (months !== renderedMonths) {
    setRenderedMonths(months);
    setInspectedMonth(months);
  }

  const geometry = useMemo(() => {
    const values = points.flatMap((point) => [point.novated, point.afterTax]);
    const maximum = Math.max(1, ...values);
    const paddedMaximum = maximum * 1.1;
    const x = (month: number) => LEFT + (month / months) * (RIGHT - LEFT);
    const y = (value: number) => BOTTOM - (value / paddedMaximum) * (BOTTOM - TOP);
    const barWidth = ((RIGHT - LEFT) / months) * 0.42;
    const yearTicks = Array.from({ length: Math.floor(months / 12) + 1 }, (_, index) => index * 12);
    if (yearTicks[yearTicks.length - 1] !== months) yearTicks.push(months);
    return { maximum: paddedMaximum, x, y, barWidth, yearTicks };
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
    <div className="outlook-chart" data-testid="monthly-outlay-chart">
      <div
        className={`chart-tooltip ${inspectedMonth === months ? 'selected' : ''}`}
        style={{
          left: `clamp(84px, ${(geometry.x(inspectedMonth) / WIDTH) * 100}%, calc(100% - 84px))`,
        }}
        aria-live="polite"
        data-testid="monthly-tooltip"
      >
        <div>
          <strong>Month {inspectedMonth}</strong>
          {inspectedMonth === months && <span>Residual due</span>}
        </div>
        <dl>
          <div>
            <dt>Novated that month</dt>
            <dd>{money(point.novated)}</dd>
          </div>
          <div>
            <dt>After-tax that month</dt>
            <dd>{money(point.afterTax)}</dd>
          </div>
        </dl>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Per-month cash outlay from month 0 to month ${months}. Paired bars show the novated take-home hit and the after-tax alternative for each month. The final-month spike is the residual payment.`}
      >
        <title>Per-month cash outlay. Hover or use arrow keys to inspect any month.</title>
        {[0, 0.5, 1].map((ratio) => {
          const value = geometry.maximum * ratio;
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
            <text x={geometry.x(month)} y={BOTTOM + 22} textAnchor="middle">
              {month === 0 ? 'Start' : `${month} mo`}
            </text>
          </g>
        ))}
        {points.map((p) => {
          const cx = geometry.x(p.month);
          const w = geometry.barWidth;
          const novatedH = BOTTOM - geometry.y(p.novated);
          const afterH = BOTTOM - geometry.y(p.afterTax);
          const isInspected = p.month === inspectedMonth;
          return (
            <g key={p.month} className={isInspected ? 'monthly-bar-active' : ''}>
              <rect
                x={cx - w - 0.5}
                y={BOTTOM - afterH}
                width={w}
                height={Math.max(0, afterH)}
                rx={1}
                className="chart-alt-bar"
              />
              <rect
                x={cx + 0.5}
                y={BOTTOM - novatedH}
                width={w}
                height={Math.max(0, novatedH)}
                rx={1}
                className="chart-net-bar"
              />
            </g>
          );
        })}
        {inspectedMonth !== months && (
          <line
            x1={geometry.x(inspectedMonth)}
            y1={TOP}
            x2={geometry.x(inspectedMonth)}
            y2={BOTTOM}
            className="chart-hover-line"
          />
        )}
        <rect
          x={LEFT}
          y={TOP}
          width={RIGHT - LEFT}
          height={BOTTOM - TOP}
          fill="transparent"
          className="chart-hit-area"
          tabIndex={0}
          aria-label={`Inspect month ${inspectedMonth}: novated ${money(point.novated)}, after-tax ${money(point.afterTax)}. Use left and right arrow keys for one month or Page Up and Page Down for one year.`}
          onPointerMove={inspectFromPointer}
          onPointerLeave={() => setInspectedMonth(months)}
          onFocus={() => setInspectedMonth(months)}
          onKeyDown={handleKeyDown}
        />
      </svg>
      <p className="chart-note">
        Cash outlay for each month, not a running total. The flat monthly take-home hit becomes a
        spike in the final month when the residual is due. Hover the plot, or focus it and use the
        arrow keys.
      </p>
    </div>
  );
}
