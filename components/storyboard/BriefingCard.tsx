import Link from 'next/link';
import type { District, StateOverview, School, AcademicMetrics } from '@/lib/data/types';
import {
  RatingPill, RATING_DOT_COLOR, GRADE_SHORT, GRADE_COLOR,
  Section, ProfBar, StatBox, FactRow, Stub, DemBar,
} from './primitives';

interface Props {
  district: District;
  stateOverview: StateOverview;
  stateAcademics: AcademicMetrics;
}

// ── County inference ───────────────────────────────────────────────────────────

function inferCounty(name: string): string | null {
  const m = name.match(/^([A-Za-z\s]+?)\s+(?:County|School)/);
  if (m) return `${m[1].trim()} County`;
  return null;
}

// ── School touch list ──────────────────────────────────────────────────────────

function SchoolTouchList({ schools }: { schools: School[] }) {
  const sorted = [...schools].sort((a, b) => b.enrollment.total - a.enrollment.total);
  return (
    <div className="divide-y divide-stone-100 -mx-5">
      {sorted.map(s => (
        <Link
          key={s.id}
          href={`/storyboard/school/${s.slug}/`}
          className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 active:bg-stone-100 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RATING_DOT_COLOR[s.rating] ?? RATING_DOT_COLOR['Not Rated']}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-stone-800 text-sm truncate">{s.name}</div>
            <div className="text-stone-400 text-xs mt-0.5">{s.enrollment.total.toLocaleString()} students</div>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${GRADE_COLOR[s.gradeBand] ?? GRADE_COLOR.Other}`}>
            {GRADE_SHORT[s.gradeBand] ?? '–'}
          </span>
          <span className="text-stone-300 ml-1">›</span>
        </Link>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BriefingCard({ district, stateOverview, stateAcademics }: Props) {
  const county = inferCounty(district.name);
  const largestSchool = [...district.schools].sort((a, b) => b.enrollment.total - a.enrollment.total)[0];

  const hasAcademics =
    district.academics.elaProficiencyPercent != null ||
    district.academics.mathProficiencyPercent != null;

  return (
    <div className="space-y-4">

      {/* ── Identity + Talking Points ──────────────────────────── */}
      <div className="bg-sc-navy rounded-2xl px-6 py-6 text-white">
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
          {district.reportYear} · District Briefing
        </p>
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-display text-2xl font-bold leading-tight">{district.name}</h1>
          <RatingPill rating={district.rating} />
        </div>
        {county && (
          <p className="text-blue-300 text-sm">{county}, South Carolina</p>
        )}

        {/* Superintendent */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Superintendent</p>
          {district.superintendentName ? (
            <div>
              <p className="text-white font-semibold text-sm">{district.superintendentName}</p>
              {district.superintendentEmail && (
                <p className="text-blue-300 text-xs">{district.superintendentEmail}</p>
              )}
            </div>
          ) : (
            <p className="text-blue-400/60 text-sm italic">Not in dataset</p>
          )}
        </div>

        {/* Key talking points */}
        <div className="mt-4 pt-4 border-t border-white/15">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Key talking points
          </p>
          <ul className="space-y-2 text-sm text-blue-100">
            <li className="flex gap-2">
              <span className="text-sc-gold flex-shrink-0">•</span>
              <span>
                <strong className="text-white">{district.enrollment.total.toLocaleString()}</strong> students
                across <strong className="text-white">{district.schoolCount}</strong> schools
              </span>
            </li>
            {district.enrollment.percentEconomicallyDisadvantaged != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">{district.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%</strong> economically disadvantaged
                </span>
              </li>
            )}
            {largestSchool && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Largest school: <strong className="text-white">{largestSchool.name}</strong>
                  {' '}({largestSchool.enrollment.total.toLocaleString()} students)
                </span>
              </li>
            )}
            {district.teachers.averageSalary != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Avg teacher salary: <strong className="text-white">${Math.round(district.teachers.averageSalary).toLocaleString()}</strong>
                </span>
              </li>
            )}
            {district.academics.graduationRate != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Graduation rate: <strong className="text-white">{district.academics.graduationRate.toFixed(0)}%</strong>
                  {stateAcademics.graduationRate != null && (
                    <span className={district.academics.graduationRate >= stateAcademics.graduationRate ? 'text-emerald-300' : 'text-amber-300'}>
                      {' '}({district.academics.graduationRate >= stateAcademics.graduationRate ? 'above' : 'below'} state avg)
                    </span>
                  )}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Political & civic context ────────────────────────────── */}
      <Section label="Political &amp; civic context" accent>
        <p className="text-stone-500 text-xs mb-4 -mt-1 leading-relaxed">
          Legislative representation and local funding context for this district.
          This section will be populated with data from the SC Legislature and Revenue &amp; Fiscal Affairs Office.
        </p>
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <div className="flex flex-col py-3 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">US Congress</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-3 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">State Senate</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-3">
              <span className="text-stone-400 text-xs uppercase tracking-wide">State House</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
          </div>
          <div>
            <div className="flex flex-col py-3 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">County seat</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-3 border-b border-stone-200/60">
              <span className="text-stone-400 text-xs uppercase tracking-wide">Property tax base</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
            <div className="flex flex-col py-3">
              <span className="text-stone-400 text-xs uppercase tracking-wide">Per-pupil local funding</span>
              <span className="text-stone-300 italic text-sm mt-0.5">Not in dataset</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Student population ───────────────────────────────────── */}
      <Section label="Student population">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatBox value={district.enrollment.total.toLocaleString()} label="enrolled" />
          <StatBox value={String(district.schoolCount)} label="schools" />
          <StatBox
            value={district.enrollment.percentEconomicallyDisadvantaged != null
              ? `${district.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%`
              : '—'}
            label="econ. disadv."
            warn={(district.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 70}
          />
        </div>
        <DemBar enrollment={district.enrollment} />
        <div className="mt-4 pt-3 border-t border-stone-100">
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
        <Stub label="District chronic absenteeism rate" />
        <Stub label="Change year-over-year" />
        <Stub label="Most affected schools" />
      </Section>

      {/* ── Schools ─────────────────────────────────────────────── */}
      <Section label={`Schools · ${district.schoolCount} total`}>
        <SchoolTouchList schools={district.schools} />
      </Section>

      {/* ── Academics ───────────────────────────────────────────── */}
      {hasAcademics && (
        <Section label="Academic performance vs. state">
          <div className="space-y-5">
            <ProfBar
              label="ELA proficiency"
              value={district.academics.elaProficiencyPercent}
              stateAvg={stateAcademics.elaProficiencyPercent}
            />
            <ProfBar
              label="Math proficiency"
              value={district.academics.mathProficiencyPercent}
              stateAvg={stateAcademics.mathProficiencyPercent}
            />
            <ProfBar
              label="College &amp; career ready"
              value={district.academics.collegeCareerReadinessPercent}
              stateAvg={stateAcademics.collegeCareerReadinessPercent}
            />
            {district.academics.graduationRate != null && (
              <ProfBar
                label="Graduation rate"
                value={district.academics.graduationRate}
                stateAvg={stateAcademics.graduationRate}
              />
            )}
          </div>
        </Section>
      )}

      {/* ── Teacher workforce ───────────────────────────────────── */}
      {(district.teachers.averageSalary != null || district.teachers.percentOnContinuingContract != null) && (
        <Section label="Teacher workforce">
          {district.teachers.averageSalary != null && (
            <FactRow label="Average teacher salary" value={`$${Math.round(district.teachers.averageSalary).toLocaleString()}`} />
          )}
          {district.teachers.percentOnContinuingContract != null && (
            <FactRow label="On continuing contract" value={`${district.teachers.percentOnContinuingContract.toFixed(0)}%`} sub="Staff retention indicator" />
          )}
          {district.teachers.percentWithAdvancedDegree != null && (
            <FactRow label="With advanced degree" value={`${district.teachers.percentWithAdvancedDegree.toFixed(0)}%`} />
          )}
          <div className="mt-3">
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
        <Stub label="Total budget" />
        <Stub label="Per-pupil expenditure" />
        <Stub label="% state funding" />
        <Stub label="% local funding" />
        <Stub label="% federal funding" />
      </Section>

    </div>
  );
}
