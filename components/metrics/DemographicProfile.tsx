import type { DemographicBreakdown } from '@/lib/data/types';

interface Segment {
  key: keyof DemographicBreakdown;
  label: string;
  color: string;
  textColor: string;
}

const RACE_SEGMENTS: Segment[] = [
  { key: 'percentWhite',    label: 'White',    color: '#1B4D8E', textColor: '#ffffff' },
  { key: 'percentBlack',    label: 'Black',    color: '#C8860A', textColor: '#ffffff' },
  { key: 'percentHispanic', label: 'Hispanic', color: '#147A7A', textColor: '#ffffff' },
];

const SUPPORT_INDICATORS = [
  { key: 'percentEconomicallyDisadvantaged' as keyof DemographicBreakdown, label: 'Economically Disadvantaged', color: '#A63A2C' },
  { key: 'percentSpecialEducation' as keyof DemographicBreakdown,          label: 'Students with Disabilities',  color: '#1B4D8E' },
  { key: 'percentELL' as keyof DemographicBreakdown,                       label: 'English Language Learners',  color: '#147A7A' },
];

interface Props {
  enrollment: DemographicBreakdown;
  stateEnrollment?: DemographicBreakdown;
  /** If true, shows vs-state comparison bars */
  showComparison?: boolean;
}

function oneIn(pct?: number): string {
  if (pct == null || pct === 0) return 'N/A';
  const n = 100 / pct;
  return n < 2 ? `1 in ${n.toFixed(1)}` : `1 in ${Math.round(n)}`;
}

function fmt(n?: number): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

function delta(dist?: number, state?: number): string | null {
  if (dist == null || state == null) return null;
  const d = dist - state;
  const sign = d > 0 ? '+' : '';
  return `${sign}${d.toFixed(1)} pp`;
}

export function DemographicProfile({ enrollment, stateEnrollment, showComparison = false }: Props) {
  // Compute "other" for race chart
  const accountedFor = RACE_SEGMENTS.reduce((s, seg) => s + (enrollment[seg.key] as number ?? 0), 0);
  const other = Math.max(0, 100 - accountedFor);

  const allSegments = [
    ...RACE_SEGMENTS.filter(s => (enrollment[s.key] as number ?? 0) > 0),
    ...(other > 0 ? [{ key: 'other' as keyof DemographicBreakdown, label: 'Other / Multiracial', color: '#94A3B8', textColor: '#ffffff' }] : []),
  ];

  return (
    <div className="space-y-10">

      {/* Race / Ethnicity composition */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-sc-muted mb-4">
          Race &amp; Ethnicity
        </h3>

        {/* Stacked bar */}
        <div
          className="flex h-14 rounded overflow-hidden mb-4"
          role="img"
          aria-label={`Race and ethnicity breakdown: ${allSegments.map(s => `${s.label} ${fmt(s.key in enrollment ? enrollment[s.key as keyof DemographicBreakdown] as number : other)}`).join(', ')}`}
        >
          {RACE_SEGMENTS.map(seg => {
            const val = enrollment[seg.key] as number ?? 0;
            if (val <= 0) return null;
            return (
              <div
                key={seg.key}
                style={{ width: `${val}%`, backgroundColor: seg.color }}
                className="relative flex items-center justify-center transition-all"
                title={`${seg.label}: ${fmt(val)}`}
              >
                {val > 8 && (
                  <span className="text-white text-xs font-semibold tabular-nums">{Math.round(val)}%</span>
                )}
              </div>
            );
          })}
          {other > 0 && (
            <div
              style={{ width: `${other}%`, backgroundColor: '#94A3B8' }}
              className="relative flex items-center justify-center"
              title={`Other / Multiracial: ${fmt(other)}`}
            >
              {other > 8 && <span className="text-white text-xs font-semibold">{Math.round(other)}%</span>}
            </div>
          )}
        </div>

        {/* Legend + comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RACE_SEGMENTS.map(seg => {
            const val = enrollment[seg.key] as number ?? 0;
            const stateVal = stateEnrollment?.[seg.key] as number | undefined;
            const d = showComparison ? delta(val, stateVal) : null;
            return (
              <div key={seg.key} className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ backgroundColor: seg.color }} aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-sc-text">{fmt(val)}</div>
                  <div className="text-xs text-sc-muted">{seg.label}</div>
                  {d && (
                    <div className={`text-xs font-medium mt-0.5 ${parseFloat(d) > 0 ? 'text-sc-rust' : 'text-sc-teal'}`}>
                      {d} vs state
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {other > 0 && (
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0 bg-slate-400" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-sc-text">{fmt(other)}</div>
                <div className="text-xs text-sc-muted">Other / Multiracial</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Support indicators */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-sc-muted mb-5">
          Student Support Needs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SUPPORT_INDICATORS.map(ind => {
            const val = enrollment[ind.key] as number | undefined;
            const stateVal = stateEnrollment?.[ind.key] as number | undefined;
            const d = showComparison ? delta(val, stateVal) : null;
            const positive = d ? parseFloat(d) > 0 : false;
            return (
              <div key={ind.key} className="border-l-4 pl-4" style={{ borderColor: ind.color }}>
                <div className="font-display text-4xl font-bold text-sc-text leading-none mb-1">
                  {fmt(val)}
                </div>
                <div className="text-sm font-medium text-sc-text mb-0.5">{ind.label}</div>
                <div className="text-xs text-sc-muted">{oneIn(val)} students</div>
                {showComparison && stateVal != null && (
                  <div className={`text-xs font-semibold mt-2 ${positive ? 'text-sc-rust' : 'text-sc-teal'}`}>
                    {d} vs. state avg ({fmt(stateVal)})
                  </div>
                )}
                {!showComparison && val != null && (
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(val, 100)}%`, backgroundColor: ind.color }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
