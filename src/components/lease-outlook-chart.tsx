'use client';

import { useMemo, useState, type PointerEvent } from 'react';
import { money } from '@/utils/format';

interface OutlookPoint {
  month: number;
  outOfPocket: number;
  taxAndGstSaving: number;
}

const WIDTH = 700;
const HEIGHT = 280;
const LEFT = 58;
const RIGHT = 674;
const TOP = 42;
const BOTTOM = 226;
const MONTHS = 60;

export default function LeaseOutlookChart({
  points,
  selectedMonth,
}: {
  points: OutlookPoint[];
  selectedMonth: number;
}) {
  const [inspectedMonth, setInspectedMonth] = useState(selectedMonth);
  const [renderedSelectedMonth, setRenderedSelectedMonth] = useState(selectedMonth);
  if (selectedMonth !== renderedSelectedMonth) {
    setRenderedSelectedMonth(selectedMonth);
    setInspectedMonth(selectedMonth);
  }
  const geometry = useMemo(() => {
    const values = points.flatMap((point) => [point.outOfPocket, point.taxAndGstSaving]);
    const minimum = Math.min(0, ...values);
    const maximum = Math.max(1, ...values);
    const paddedMaximum = maximum * 1.08;
    const range = paddedMaximum - minimum;
    const x = (month: number) => LEFT + (month / MONTHS) * (RIGHT - LEFT);
    const y = (value: number) => BOTTOM - ((value - minimum) / range) * (BOTTOM - TOP);
    const path = (key: 'outOfPocket' | 'taxAndGstSaving') =>
      points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.month)} ${y(point[key])}`)
        .join(' ');
    return { minimum, maximum: paddedMaximum, x, y, path };
  }, [points]);

  const point = points[inspectedMonth] ?? points[selectedMonth];
  const selectedPoint = points[selectedMonth];

  function inspectFromPointer(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relative = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setInspectedMonth(Math.round(relative * MONTHS));
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGRectElement>) {
    let next = inspectedMonth;
    if (event.key === 'ArrowLeft') next -= 1;
    else if (event.key === 'ArrowRight') next += 1;
    else if (event.key === 'PageDown') next -= 12;
    else if (event.key === 'PageUp') next += 12;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = MONTHS;
    else return;
    event.preventDefault();
    setInspectedMonth(Math.min(MONTHS, Math.max(0, next)));
  }

  return (
    <div className="outlook-chart" data-testid="lease-outlook-chart">
      <div
        className={`chart-tooltip ${inspectedMonth === selectedMonth ? 'selected' : ''}`}
        style={{
          left: `clamp(84px, ${(geometry.x(inspectedMonth) / WIDTH) * 100}%, calc(100% - 84px))`,
        }}
        aria-live="polite"
        data-testid="chart-tooltip"
      >
        <div>
          <strong>Month {inspectedMonth}</strong>
          {inspectedMonth === selectedMonth && <span>Selected term</span>}
        </div>
        <dl>
          <div>
            <dt>Out-of-pocket cost</dt>
            <dd>{money(point.outOfPocket)}</dd>
          </div>
          <div>
            <dt>Tax + GST saved</dt>
            <dd>{money(point.taxAndGstSaving)}</dd>
          </div>
        </dl>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Monthly lease-term outlook from month 0 to month 60. Selected term is month ${selectedMonth}.`}
      >
        <title>
          Monthly lease-term outlook. Hover or use arrow keys to inspect out-of-pocket cost and tax
          plus GST savings.
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
        {[0, 12, 24, 36, 48, 60].map((month) => (
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
        <rect
          x={geometry.x(selectedMonth) - 7}
          y={TOP}
          width="14"
          height={BOTTOM - TOP}
          className="chart-selected-band"
        />
        <line
          x1={geometry.x(selectedMonth)}
          y1={TOP}
          x2={geometry.x(selectedMonth)}
          y2={BOTTOM}
          className="chart-selected-line"
        />
        <path d={geometry.path('outOfPocket')} className="chart-cost-line" />
        <path d={geometry.path('taxAndGstSaving')} className="chart-saving-line" />
        <circle
          cx={geometry.x(selectedMonth)}
          cy={geometry.y(selectedPoint.outOfPocket)}
          r="5"
          className="chart-cost-dot"
        />
        <circle
          cx={geometry.x(selectedMonth)}
          cy={geometry.y(selectedPoint.taxAndGstSaving)}
          r="5"
          className="chart-saving-dot"
        />
        {inspectedMonth !== selectedMonth && (
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
          aria-label={`Inspect month ${inspectedMonth}: out-of-pocket cost ${money(point.outOfPocket)}, tax and GST saved ${money(point.taxAndGstSaving)}. Use left and right arrow keys for one month or Page Up and Page Down for one year.`}
          onPointerMove={inspectFromPointer}
          onPointerLeave={() => setInspectedMonth(selectedMonth)}
          onFocus={() => setInspectedMonth(selectedMonth)}
          onKeyDown={handleKeyDown}
        />
        <text
          x={geometry.x(selectedMonth)}
          y={TOP - 12}
          textAnchor="middle"
          className="chart-selected-label"
        >
          Selected · {selectedMonth} months
        </text>
      </svg>
      <p className="chart-note">
        Each month is a hypothetical lease ending then. Residuals follow the ATO eight-year
        effective-life formula. Hover the plot, or focus it and use the arrow keys.
      </p>
    </div>
  );
}
