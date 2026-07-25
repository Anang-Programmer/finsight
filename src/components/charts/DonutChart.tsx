'use client';

import { useState } from 'react';
import type { CategoryBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DonutChartProps {
  data: CategoryBreakdown[];
  size?: number;
  thickness?: number;
}

export default function DonutChart({
  data,
  size = 200,
  thickness = 32,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            fill="none"
            stroke="var(--surface-elevated)"
            strokeWidth={thickness}
          />
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--stone)"
            fontSize="14"
          >
            Belum ada data
          </text>
        </svg>
      </div>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercentage = 0;

  const segments = data.map((item, index) => {
    const percentage = item.total / total;
    const offset = cumulativePercentage * circumference;
    const length = percentage * circumference;
    cumulativePercentage += percentage;

    return {
      ...item,
      offset,
      length,
      index,
    };
  });

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-elevated)"
            strokeWidth={thickness}
          />

          {/* Data segments */}
          {segments.map((seg) => (
            <circle
              key={seg.index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.category_color}
              strokeWidth={activeIndex === seg.index ? thickness + 6 : thickness}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              style={{
                transition: 'stroke-width 200ms ease',
                cursor: 'pointer',
                opacity: activeIndex !== null && activeIndex !== seg.index ? 0.4 : 1,
              }}
              onMouseEnter={() => setActiveIndex(seg.index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ))}
        </svg>

        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {activeItem ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--stone)' }}>
                {activeItem.category_icon} {activeItem.category_name}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '600', marginTop: '2px' }}>
                {activeItem.percentage}%
              </span>
              <span style={{ fontSize: '12px', color: 'var(--on-dark-mute)' }}>
                {formatCurrency(activeItem.total)}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '13px', color: 'var(--stone)' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: '600', marginTop: '2px' }}>
                {formatCurrency(total)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 16px',
          justifyContent: 'center',
          maxWidth: '300px',
        }}
      >
        {data.slice(0, 6).map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--on-dark-mute)',
              cursor: 'pointer',
              opacity: activeIndex !== null && activeIndex !== index ? 0.5 : 1,
              transition: 'opacity 200ms',
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.category_color,
                flexShrink: 0,
              }}
            />
            {item.category_name}
          </div>
        ))}
      </div>
    </div>
  );
}
