import type { GradeBand } from '@/lib/data/types';

interface Props {
  distribution: Record<GradeBand, number>;
  totalSchools: number;
}

const TYPES: { band: GradeBand; label: string; sublabel: string; color: string; bg: string }[] = [
  { band: 'Elementary', label: 'Elementary', sublabel: 'Grades PK–5',  color: '#1B4D8E', bg: '#EFF4FB' },
  { band: 'Middle',     label: 'Middle',     sublabel: 'Grades 6–8',   color: '#C8860A', bg: '#FDF4E0' },
  { band: 'High',       label: 'High School',sublabel: 'Grades 9–12',  color: '#147A7A', bg: '#E8F5F5' },
  { band: 'K-12',       label: 'K–12',       sublabel: 'All grades',   color: '#6D28D9', bg: '#F3EEFF' },
  { band: 'Other',      label: 'Other',      sublabel: 'Specialized',  color: '#6B7280', bg: '#F3F4F6' },
];

export function SchoolTypeBreakdown({ distribution, totalSchools }: Props) {
  const types = TYPES.filter(t => (distribution[t.band] ?? 0) > 0);

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-sc-muted mb-6">
        School Types
      </h3>

      {/* Stat cards — centered text */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {types.map(t => {
          const count = distribution[t.band] ?? 0;
          const pct = totalSchools > 0 ? (count / totalSchools) * 100 : 0;
          return (
            <div
              key={t.band}
              className="rounded-lg p-4 border text-center"
              style={{ backgroundColor: t.bg, borderColor: `${t.color}30` }}
            >
              <div className="font-display text-3xl font-bold mb-0.5" style={{ color: t.color }}>
                {count.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-sc-text">{t.label}</div>
              <div className="text-xs text-sc-muted">{t.sublabel}</div>
              <div className="text-xs font-medium mt-2" style={{ color: t.color }}>
                {pct.toFixed(0)}% of schools
              </div>
            </div>
          );
        })}
      </div>

      {/* Proportional bar */}
      <div
        className="flex h-8 rounded overflow-hidden"
        role="img"
        aria-label={`School type distribution: ${types.map(t => `${t.label}: ${distribution[t.band]}`).join(', ')}`}
      >
        {types.map(t => {
          const count = distribution[t.band] ?? 0;
          const pct = totalSchools > 0 ? (count / totalSchools) * 100 : 0;
          if (pct < 0.5) return null;
          return (
            <div
              key={t.band}
              style={{ width: `${pct}%`, backgroundColor: t.color }}
              className="flex items-center justify-center"
              title={`${t.label}: ${count} (${pct.toFixed(1)}%)`}
            >
              {pct > 9 && (
                <span className="text-white text-xs font-semibold">{t.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
