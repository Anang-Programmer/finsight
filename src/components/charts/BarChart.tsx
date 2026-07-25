'use client';

import { useState } from 'react';
import { formatCurrencyShort } from '@/lib/utils';

interface BarChartProps {
  data: {
    label: string;
    income: number;
    expense: number;
  }[];
}

export default function BarChart({ data }: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div
        style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--stone)',
          fontSize: '14px',
        }}
      >
        Belum ada data
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]));
  const chartHeight = 200;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: `${chartHeight}px`,
          padding: '0 4px',
          borderBottom: '1px solid var(--divider-soft)',
        }}
      >
        {data.map((item, index) => {
          const incomeHeight = maxValue > 0 ? (item.income / maxValue) * (chartHeight - 24) : 0;
          const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * (chartHeight - 24) : 0;
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                gap: '3px',
                alignItems: 'flex-end',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Income bar */}
              <div
                style={{
                  width: '40%',
                  maxWidth: '24px',
                  height: `${Math.max(incomeHeight, 2)}px`,
                  background: isActive ? 'var(--accent-teal)' : 'rgba(0, 168, 126, 0.6)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 300ms ease',
                }}
              />
              {/* Expense bar */}
              <div
                style={{
                  width: '40%',
                  maxWidth: '24px',
                  height: `${Math.max(expenseHeight, 2)}px`,
                  background: isActive ? 'var(--accent-pink)' : 'rgba(230, 30, 73, 0.5)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 300ms ease',
                }}
              />

              {/* Tooltip */}
              {isActive && (
                <div className="chart-tooltip" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}>
                  <div style={{ color: 'var(--accent-teal)' }}>+{formatCurrencyShort(item.income)}</div>
                  <div style={{ color: 'var(--accent-pink)' }}>-{formatCurrencyShort(item.expense)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', gap: '8px', padding: '8px 4px 0' }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '11px',
              color: activeIndex === index ? 'var(--on-dark)' : 'var(--stone)',
              transition: 'color 200ms',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-dark-mute)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-teal)' }} />
          Pemasukan
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-dark-mute)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-pink)' }} />
          Pengeluaran
        </div>
      </div>
    </div>
  );
}
