import type { SchoolRating, DemographicBreakdown } from '@/lib/data/types';

// ── Rating ─────────────────────────────────────────────────────────────────────

const RATING_PILL_COLOR: Record<SchoolRating, string> = {
  'Excellent':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Good':           'bg-teal-50 text-teal-700 border-teal-200',
  'Average':        'bg-amber-50 text-amber-700 border-amber-200',
  'Below Average':  'bg-orange-50 text-orange-700 border-orange-200',
  'Unsatisfactory': 'bg-red-50 text-red-700 border-red-200',
  'Not Rated':      'bg-stone-50 text-stone-500 border-stone-200',
};

export const RATING_DOT_COLOR: Record<SchoolRating, string> = {
  'Excellent':      'bg-emerald-500',
  'Good':           'bg-teal-500',
  'Average':        'bg-amber-400',
  'Below Average':  'bg-orange-500',
  'Unsatisfactory': 'bg-red-500',
  'Not Rated':      'bg-stone-300',
};

export function RatingPill({ rating }: { rating: SchoolRating }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${RATING_PILL_COLOR[rating]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${RATING_DOT_COLOR[rating]}`} />
      {rating}
    </span>
  );
}

// ── Grade badge ────────────────────────────────────────────────────────────────

export const GRADE_COLOR: Record<string, string> = {
  Elementary: 'bg-blue-100 text-blue-700',
  Middle:     'bg-violet-100 text-violet-700',
  High:       'bg-teal-100 text-teal-700',
  'K-12':     'bg-amber-100 text-amber-700',
  Other:      'bg-stone-100 text-stone-600',
};

export const GRADE_SHORT: Record<string, string> = {
  Elementary: 'ES', Middle: 'MS', High: 'HS', 'K-12': 'K–12', Other: '–',
};

export function GradeBadge({ band, short }: { band: string; short?: boolean }) {
  const label = short ? (GRADE_SHORT[band] ?? '–') : band;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${GRADE_COLOR[band] ?? GRADE_COLOR.Other}`}>
      {label}
    </span>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

export function Section({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className={`rounded-2xl border shadow-sm px-5 py-5 ${accent ? 'bg-sc-navy/5 border-sc-navy/15' : 'bg-white border-stone-200'}`}>
      <h2 className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-4">{label}</h2>
      {children}
    </section>
  );
}

// ── Proficiency bar with state benchmark ───────────────────────────────────────

export function ProfBar({ label, value, stateAvg }: { label: string; value?: number; stateAvg?: number }) {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, value));
  const aboveState = stateAvg != null ? value >= stateAvg : null;
  const barColor = aboveState === true ? 'bg-emerald-500'
                 : aboveState === false ? 'bg-amber-500'
                 : value >= 70 ? 'bg-emerald-500'
                 : value >= 50 ? 'bg-amber-400'
                 : 'bg-red-400';

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-stone-600 text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-900 text-sm tabular-nums">{value.toFixed(0)}%</span>
          {aboveState !== null && (
            <span className={`text-xs font-medium ${aboveState ? 'text-emerald-600' : 'text-amber-600'}`}>
              {aboveState ? '▲' : '▼'} state
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2.5 bg-stone-100 rounded-full overflow-visible">
        <div className={`absolute inset-y-0 left-0 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        {stateAvg != null && (
          <div
            className="absolute -top-0.5 w-0.5 h-3.5 bg-stone-900/70 rounded-full"
            style={{ left: `${Math.min(100, Math.max(0, stateAvg))}%` }}
            title={`State avg: ${stateAvg.toFixed(0)}%`}
          />
        )}
      </div>
      {stateAvg != null && (
        <div className="text-right text-xs text-stone-400 mt-1 tabular-nums">
          State avg: {stateAvg.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

// ── Stat box ───────────────────────────────────────────────────────────────────

export function StatBox({ value, label, warn }: { value: string; label: string; warn?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-display text-2xl font-bold tabular-nums ${warn ? 'text-orange-600' : 'text-stone-900'}`}>
        {value}
      </div>
      <div className="text-stone-400 text-xs mt-0.5">{label}</div>
    </div>
  );
}

// ── Fact row ───────────────────────────────────────────────────────────────────

export function FactRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div>
        <div className="text-stone-600 text-sm">{label}</div>
        {sub && <div className="text-stone-400 text-xs mt-0.5">{sub}</div>}
      </div>
      <span className="text-stone-900 font-semibold text-sm tabular-nums">{value}</span>
    </div>
  );
}

// ── Stub row ───────────────────────────────────────────────────────────────────

export function Stub({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <span className="text-stone-600 text-sm">{label}</span>
      <span className="text-xs text-stone-300 bg-stone-100 px-2 py-0.5 rounded-full">Not in dataset</span>
    </div>
  );
}

// ── Stability meter ────────────────────────────────────────────────────────────

export function StabilityMeter({ pct }: { pct: number }) {
  const label = pct >= 90 ? 'Stable' : pct >= 75 ? 'Moderate' : 'Unstable';
  const color = pct >= 90 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
              : pct >= 75 ? 'text-amber-600 bg-amber-50 border-amber-200'
              : 'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

// ── Demographics bar ───────────────────────────────────────────────────────────

export function DemBar({ enrollment }: { enrollment: DemographicBreakdown }) {
  const segs = [
    { label: 'White',    pct: enrollment.percentWhite ?? 0,    color: 'bg-blue-400' },
    { label: 'Black',    pct: enrollment.percentBlack ?? 0,    color: 'bg-amber-500' },
    { label: 'Hispanic', pct: enrollment.percentHispanic ?? 0, color: 'bg-teal-500' },
  ];
  const other = Math.max(0, 100 - segs.reduce((s, x) => s + x.pct, 0));
  if (other > 0) segs.push({ label: 'Other', pct: other, color: 'bg-stone-300' });
  const total = segs.reduce((s, x) => s + x.pct, 0);
  if (total < 5) return null;

  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
        {segs.map((s, i) =>
          s.pct > 0 ? <div key={i} className={s.color} style={{ width: `${s.pct}%` }} /> : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segs.filter(s => s.pct > 1).map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${s.color}`} />
            <span className="text-stone-500 text-xs">{s.label} {s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
