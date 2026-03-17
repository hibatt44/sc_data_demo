'use client';

import type { DemographicBreakdown } from '@/lib/data/types';

interface Props {
  enrollment: DemographicBreakdown;
}

const SEGMENTS = [
  { key: 'percentWhite' as const, label: 'White', color: '#60a5fa' },
  { key: 'percentBlack' as const, label: 'Black', color: '#34d399' },
  { key: 'percentHispanic' as const, label: 'Hispanic', color: '#fbbf24' },
];

export function DemographicsBar({ enrollment }: Props) {
  const segments = SEGMENTS.filter(s => enrollment[s.key] != null && enrollment[s.key]! > 0);
  if (segments.length === 0) return null;

  const total = segments.reduce((sum, s) => sum + (enrollment[s.key] ?? 0), 0);
  const other = Math.max(0, 100 - total);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-sc-text mb-3 uppercase tracking-wide">Enrollment Demographics</h3>
      <div className="flex rounded-full overflow-hidden h-6" role="img" aria-label="Demographics breakdown bar chart">
        {segments.map(s => (
          <div
            key={s.key}
            style={{ width: `${enrollment[s.key]}%`, backgroundColor: s.color }}
            title={`${s.label}: ${enrollment[s.key]?.toFixed(1)}%`}
          />
        ))}
        {other > 0 && (
          <div style={{ width: `${other}%`, backgroundColor: '#e5e7eb' }} title={`Other: ${other.toFixed(1)}%`} />
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-sc-muted">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {s.label}: {enrollment[s.key]?.toFixed(1)}%
          </div>
        ))}
        {other > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-sc-muted">
            <span className="w-3 h-3 rounded-sm inline-block bg-gray-200" aria-hidden="true" />
            Other: {other.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
