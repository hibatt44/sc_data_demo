import Link from 'next/link';
import type { District, StateOverview, School, SchoolRating } from '@/lib/data/types';

interface Props {
  district: District;
  stateOverview: StateOverview;
}

// ── Shared primitives ──────────────────────────────────────────────────────────

const RATING_PILL: Record<SchoolRating, string> = {
  'Excellent':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Good':           'bg-teal-50 text-teal-700 border-teal-200',
  'Average':        'bg-amber-50 text-amber-700 border-amber-200',
  'Below Average':  'bg-orange-50 text-orange-700 border-orange-200',
  'Unsatisfactory': 'bg-red-50 text-red-700 border-red-200',
  'Not Rated':      'bg-stone-50 text-stone-500 border-stone-200',
};
const RATING_DOT: Record<SchoolRating, string> = {
  'Excellent':      'bg-emerald-500',
  'Good':           'bg-teal-500',
  'Average':        'bg-amber-400',
  'Below Average':  'bg-orange-500',
  'Unsatisfactory': 'bg-red-500',
  'Not Rated':      'bg-stone-300',
};

function RatingPill({ rating }: { rating: SchoolRating }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${RATING_PILL[rating]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${RATING_DOT[rating]}`} />
      {rating}
    </span>
  );
}

function Section({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className={`rounded-2xl border shadow-sm px-5 py-5 ${accent ? 'bg-sc-navy/5 border-sc-navy/20' : 'bg-white border-stone-200'}`}>
      <h2 className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-4">{label}</h2>
      {children}
    </section>
  );
}

function ProfBar({ label, value }: { label: string; value?: number }) {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, value));
  const color = value >= 70 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-stone-600 text-sm">{label}</span>
        <span className="font-bold text-stone-900 text-sm tabular-nums">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stub({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-stone-600 text-sm">{label}</span>
      <span className="text-xs text-stone-300 bg-stone-100 px-2 py-0.5 rounded-full">Not in dataset</span>
    </div>
  );
}

function FactRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-sc-navy' : 'text-stone-800'}`}>{value}</span>
    </div>
  );
}

// ── School touch list ──────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  Elementary: 'bg-blue-50 text-blue-700',
  Middle:     'bg-violet-50 text-violet-700',
  High:       'bg-teal-50 text-teal-700',
  'K-12':     'bg-amber-50 text-amber-700',
  Other:      'bg-stone-50 text-stone-500',
};
const GRADE_SHORT: Record<string, string> = {
  Elementary: 'ES', Middle: 'MS', High: 'HS', 'K-12': 'K–12', Other: '?',
};

function SchoolTouchList({ schools }: { schools: School[] }) {
  const sorted = [...schools].sort((a, b) => b.enrollment.total - a.enrollment.total);
  return (
    <div className="divide-y divide-stone-100 -mx-5">
      {sorted.map(s => (
        <Link
          key={s.id}
          href={`/storyboard/school/${s.slug}/`}
          className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 active:bg-stone-100 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RATING_DOT[s.rating] ?? RATING_DOT['Not Rated']}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-stone-800 text-sm truncate">{s.name}</div>
            <div className="text-stone-400 text-xs mt-0.5">{s.enrollment.total.toLocaleString()} students</div>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${GRADE_COLOR[s.gradeBand] ?? GRADE_COLOR.Other}`}>
            {GRADE_SHORT[s.gradeBand] ?? '?'}
          </span>
          <span className="text-stone-300 ml-1">›</span>
        </Link>
      ))}
    </div>
  );
}

// ── Infer county from district name ───────────────────────────────────────────

function inferCounty(name: string): string | null {
  const m = name.match(/^([A-Za-z\s]+?)\s+(?:County|School)/);
  if (m) return `${m[1].trim()} County`;
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BriefingCard({ district }: Props) {
  const county = inferCounty(district.name);

  const hasAcademics =
    district.academics.elaProficiencyPercent != null ||
    district.academics.mathProficiencyPercent != null;

  return (
    <div className="space-y-4">

      {/* ── Identity ────────────────────────────────────────────── */}
      <div className="bg-sc-navy rounded-2xl px-6 py-6 text-white">
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
          {district.reportYear} · District Briefing
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold leading-tight">{district.name}</h1>
          <RatingPill rating={district.rating} />
        </div>
        {county && (
          <p className="text-blue-300 text-sm mt-2">{county}, South Carolina</p>
        )}
      </div>

      {/* ── Political & civic context ────────────────────────────── */}
      <Section label="Political &amp; civic context" accent>
        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-1">
            <div className="flex flex-col py-2 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">US Congress</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-2 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">State Senate</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-2">
              <span className="text-stone-400 text-xs uppercase tracking-wide">State House</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col py-2 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">County seat</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-2 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">Property tax base</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-2">
              <span className="text-stone-400 text-xs uppercase tracking-wide">Per-pupil local funding</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Student population ───────────────────────────────────── */}
      <Section label="Student population">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-stone-900 tabular-nums">
              {district.enrollment.total.toLocaleString()}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">enrolled</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-stone-900 tabular-nums">
              {district.schoolCount}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">schools</div>
          </div>
          <div className="text-center">
            <div className={`font-display text-2xl font-bold tabular-nums ${
              (district.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 70
                ? 'text-orange-600'
                : (district.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 50
                ? 'text-amber-600'
                : 'text-stone-900'
            }`}>
              {district.enrollment.percentEconomicallyDisadvantaged != null
                ? `${district.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%`
                : '—'}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">econ. disadv.</div>
          </div>
        </div>

        {/* Demographics bar */}
        {(() => {
          const segs = [
            { label: 'White',    pct: district.enrollment.percentWhite ?? 0,    color: 'bg-blue-400' },
            { label: 'Black',    pct: district.enrollment.percentBlack ?? 0,    color: 'bg-amber-500' },
            { label: 'Hispanic', pct: district.enrollment.percentHispanic ?? 0, color: 'bg-teal-500' },
          ];
          const other = Math.max(0, 100 - segs.reduce((s, x) => s + x.pct, 0));
          if (other > 0) segs.push({ label: 'Other', pct: other, color: 'bg-stone-300' });
          const total = segs.reduce((s, x) => s + x.pct, 0);
          if (total < 5) return null;
          return (
            <div className="mt-2">
              <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
                {segs.map((s, i) => s.pct > 0 && (
                  <div key={i} className={s.color} style={{ width: `${s.pct}%` }} />
                ))}
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
        })()}

        <div className="mt-4 pt-3 border-t border-stone-100 space-y-1">
          {district.enrollment.percentSpecialEducation != null && (
            <FactRow label="Special education" value={`${district.enrollment.percentSpecialEducation.toFixed(0)}%`} />
          )}
          {district.enrollment.percentELL != null && (
            <FactRow label="English language learners" value={`${district.enrollment.percentELL.toFixed(0)}%`} />
          )}
        </div>
      </Section>

      {/* ── Chronic absenteeism ─────────────────────────────────── */}
      <Section label="Chronic absenteeism">
        <p className="text-stone-400 text-xs mb-3">
          Students missing 10%+ of school days — a key indicator of engagement and equity.
        </p>
        <div className="space-y-0 divide-y divide-stone-100">
          <Stub label="District chronic absenteeism rate" />
          <Stub label="Change year-over-year" />
          <Stub label="Most affected schools" />
        </div>
      </Section>

      {/* ── Schools ─────────────────────────────────────────────── */}
      <Section label={`Schools · ${district.schoolCount} total`}>
        <SchoolTouchList schools={district.schools} />
      </Section>

      {/* ── Academics ───────────────────────────────────────────── */}
      {hasAcademics && (
        <Section label="Academic performance">
          <div className="space-y-4">
            <ProfBar label="ELA proficiency" value={district.academics.elaProficiencyPercent} />
            <ProfBar label="Math proficiency" value={district.academics.mathProficiencyPercent} />
            <ProfBar label="College &amp; career ready" value={district.academics.collegeCareerReadinessPercent} />
            {district.academics.graduationRate != null && (
              <ProfBar label="Graduation rate" value={district.academics.graduationRate} />
            )}
          </div>
        </Section>
      )}

      {/* ── Teacher workforce ───────────────────────────────────── */}
      {(district.teachers.averageSalary != null || district.teachers.percentOnContinuingContract != null) && (
        <Section label="Teacher workforce">
          <div className="divide-y divide-stone-100">
            {district.teachers.averageSalary != null && (
              <FactRow
                label="Average teacher salary"
                value={`$${Math.round(district.teachers.averageSalary).toLocaleString()}`}
                highlight
              />
            )}
            {district.teachers.percentOnContinuingContract != null && (
              <FactRow
                label="On continuing contract"
                value={`${district.teachers.percentOnContinuingContract.toFixed(0)}%`}
              />
            )}
            {district.teachers.percentWithAdvancedDegree != null && (
              <FactRow
                label="With advanced degree"
                value={`${district.teachers.percentWithAdvancedDegree.toFixed(0)}%`}
              />
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 divide-y divide-stone-100">
            <Stub label="Vacancies / hard-to-fill positions" />
            <Stub label="Teacher turnover rate" />
          </div>
        </Section>
      )}

      {/* ── Finances ────────────────────────────────────────────── */}
      <Section label="District finances">
        <p className="text-stone-400 text-xs mb-3">
          State, local, and federal funding breakdown — key context for budget conversations.
        </p>
        <div className="divide-y divide-stone-100">
          <Stub label="Total budget" />
          <Stub label="Per-pupil expenditure" />
          <Stub label="% state funding" />
          <Stub label="% local funding" />
          <Stub label="% federal funding" />
        </div>
      </Section>

    </div>
  );
}
