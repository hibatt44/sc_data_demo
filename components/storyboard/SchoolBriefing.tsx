import type { School, SchoolRating } from '@/lib/data/types';

interface Props {
  school: School;
  districtName?: string;
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
const GRADE_COLOR: Record<string, string> = {
  Elementary: 'bg-blue-100 text-blue-700',
  Middle:     'bg-violet-100 text-violet-700',
  High:       'bg-teal-100 text-teal-700',
  'K-12':     'bg-amber-100 text-amber-700',
  Other:      'bg-stone-100 text-stone-600',
};

function RatingPill({ rating }: { rating: SchoolRating }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${RATING_PILL[rating]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${RATING_DOT[rating]}`} />
      {rating}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-5">
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

function FactRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <div>
        <div className="text-stone-600 text-sm">{label}</div>
        {sub && <div className="text-stone-400 text-xs mt-0.5">{sub}</div>}
      </div>
      <span className="text-stone-900 font-semibold text-sm tabular-nums">{value}</span>
    </div>
  );
}

function Stub({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-600 text-sm">{label}</span>
      <span className="text-xs text-stone-300 bg-stone-100 px-2 py-0.5 rounded-full">Not in dataset</span>
    </div>
  );
}

// ── Stability indicator ────────────────────────────────────────────────────────

function StabilityMeter({ pct }: { pct: number }) {
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

// ── Main component ─────────────────────────────────────────────────────────────

export function SchoolBriefing({ school, districtName }: Props) {
  const hasAcademics =
    school.academics.elaProficiencyPercent != null ||
    school.academics.mathProficiencyPercent != null;

  const hasTeachers =
    school.teachers.averageSalary != null ||
    school.teachers.percentOnContinuingContract != null;

  return (
    <div className="space-y-4">

      {/* ── Identity ────────────────────────────────────────────── */}
      <div className="bg-sc-navy rounded-2xl px-6 py-6 text-white">
        {districtName && (
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
            {districtName}
          </p>
        )}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold leading-tight">{school.name}</h1>
          <RatingPill rating={school.rating} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${GRADE_COLOR[school.gradeBand] ?? GRADE_COLOR.Other}`}>
            {school.gradeBand}
          </span>
          <span className="text-blue-300 text-sm">{school.reportYear} Report Card</span>
        </div>
      </div>

      {/* ── Enrollment snapshot ─────────────────────────────────── */}
      <Section label="Enrollment">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-stone-900 tabular-nums">
              {school.enrollment.total.toLocaleString()}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">students</div>
          </div>
          <div className="text-center">
            <div className={`font-display text-2xl font-bold tabular-nums ${
              (school.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 70 ? 'text-orange-600'
              : (school.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 50 ? 'text-amber-600'
              : 'text-stone-900'
            }`}>
              {school.enrollment.percentEconomicallyDisadvantaged != null
                ? `${school.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%`
                : '—'}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">econ. disadv.</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-stone-900 tabular-nums">
              {school.enrollment.percentSpecialEducation != null
                ? `${school.enrollment.percentSpecialEducation.toFixed(0)}%`
                : '—'}
            </div>
            <div className="text-stone-400 text-xs mt-0.5">special ed.</div>
          </div>
        </div>
        {school.enrollment.percentELL != null && (
          <FactRow label="English language learners" value={`${school.enrollment.percentELL.toFixed(0)}%`} />
        )}
      </Section>

      {/* ── Chronic absenteeism ─────────────────────────────────── */}
      <Section label="Chronic absenteeism">
        <p className="text-stone-400 text-xs mb-3">
          Students missing 10%+ of school days.
        </p>
        <div className="divide-y divide-stone-100">
          <Stub label="Chronic absenteeism rate" />
          <Stub label="Year-over-year change" />
        </div>
      </Section>

      {/* ── Academics ───────────────────────────────────────────── */}
      {hasAcademics && (
        <Section label="Academic performance">
          <div className="space-y-4">
            <ProfBar label="ELA proficiency" value={school.academics.elaProficiencyPercent} />
            <ProfBar label="Math proficiency" value={school.academics.mathProficiencyPercent} />
            <ProfBar label="College &amp; career ready" value={school.academics.collegeCareerReadinessPercent} />
            {school.academics.graduationRate != null && (
              <ProfBar label="Graduation rate" value={school.academics.graduationRate} />
            )}
          </div>
        </Section>
      )}

      {/* ── Teacher workforce ───────────────────────────────────── */}
      {hasTeachers && (
        <Section label="Teacher workforce">
          <div className="divide-y divide-stone-100">
            {school.teachers.averageSalary != null && (
              <FactRow
                label="Average teacher salary"
                value={`$${Math.round(school.teachers.averageSalary).toLocaleString()}`}
              />
            )}
            {school.teachers.percentOnContinuingContract != null && (
              <div className="flex items-center justify-between py-2.5 border-b border-stone-100">
                <div>
                  <div className="text-stone-600 text-sm">On continuing contract</div>
                  <div className="text-stone-400 text-xs mt-0.5">Staff retention indicator</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-900 font-semibold text-sm tabular-nums">
                    {school.teachers.percentOnContinuingContract.toFixed(0)}%
                  </span>
                  <StabilityMeter pct={school.teachers.percentOnContinuingContract} />
                </div>
              </div>
            )}
            {school.teachers.percentWithAdvancedDegree != null && (
              <FactRow
                label="With advanced degree"
                value={`${school.teachers.percentWithAdvancedDegree.toFixed(0)}%`}
              />
            )}
          </div>
          <div className="mt-3 divide-y divide-stone-100">
            <Stub label="Open / hard-to-fill vacancies" />
            <Stub label="Teacher turnover rate" />
          </div>
        </Section>
      )}

      {/* ── Finances ────────────────────────────────────────────── */}
      <Section label="School finances">
        <div className="divide-y divide-stone-100">
          <Stub label="Per-pupil expenditure" />
          <Stub label="Title I status" />
          <Stub label="Federal grants" />
        </div>
      </Section>

    </div>
  );
}
