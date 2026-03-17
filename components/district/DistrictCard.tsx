import Link from 'next/link';
import type { District } from '@/lib/data/types';

const RACE_COLORS = ['#1B4D8E', '#C8860A', '#147A7A', '#94A3B8'];

export function DistrictCard({ district }: { district: District }) {
  const d = district.enrollment;

  // Build mini demographic bar segments
  const segments = [
    { pct: d.percentWhite ?? 0,    color: RACE_COLORS[0] },
    { pct: d.percentBlack ?? 0,    color: RACE_COLORS[1] },
    { pct: d.percentHispanic ?? 0, color: RACE_COLORS[2] },
  ];
  const accounted = segments.reduce((s, x) => s + x.pct, 0);
  if (accounted < 99) segments.push({ pct: Math.max(0, 100 - accounted), color: RACE_COLORS[3] });

  return (
    <Link
      href={`/district/${district.slug}/`}
      className="block bg-white border border-gray-200 p-5 hover:border-sc-navy hover:shadow-md transition-all group"
    >
      <h3 className="font-semibold text-sc-text text-sm leading-snug group-hover:text-sc-blue transition-colors mb-3">
        {district.name}
      </h3>

      {/* Mini demographic bar */}
      {accounted > 0 && (
        <div className="flex h-1.5 rounded-full overflow-hidden mb-3" aria-hidden="true">
          {segments.map((seg, i) =>
            seg.pct > 0
              ? <div key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
              : null
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-sc-muted">
        <span>{district.enrollment.total.toLocaleString()} students</span>
        <span>{district.schoolCount} schools</span>
      </div>

      {d.percentEconomicallyDisadvantaged != null && (
        <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-sc-muted">
          <span className="font-medium text-sc-rust">{d.percentEconomicallyDisadvantaged.toFixed(0)}%</span>
          {' '}econ. disadvantaged
        </div>
      )}
    </Link>
  );
}
