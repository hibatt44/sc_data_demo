import type { School, AcademicMetrics } from '@/lib/data/types';
import {
  RatingPill, GradeBadge,
  Section, ProfBar, StatBox, FactRow, Stub, StabilityMeter,
} from './primitives';

interface Props {
  school: School;
  districtName?: string;
  districtAcademics?: AcademicMetrics;
}

export function SchoolBriefing({ school, districtName, districtAcademics }: Props) {
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
          <GradeBadge band={school.gradeBand} />
          {school.mascot && (
            <span className="text-blue-200 text-sm">The <strong className="text-white">{school.mascot}</strong></span>
          )}
          <span className="text-blue-300 text-sm">{school.reportYear} Report Card</span>
        </div>

        {/* Principal + mascot */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Principal</p>
            {school.principalName ? (
              <div>
                <p className="text-white font-semibold text-sm">{school.principalName}</p>
                {school.principalEmail && (
                  <p className="text-blue-300 text-xs">{school.principalEmail}</p>
                )}
              </div>
            ) : (
              <p className="text-blue-400/60 text-sm italic">Not in dataset</p>
            )}
          </div>
          <div>
            <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">School mascot</p>
            {school.mascot ? (
              <p className="text-white font-semibold text-sm">{school.mascot}</p>
            ) : (
              <p className="text-blue-400/60 text-sm italic">Not in dataset</p>
            )}
          </div>
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
                <strong className="text-white">{school.gradeBand} school</strong> with{' '}
                <strong className="text-white">{school.enrollment.total.toLocaleString()}</strong> students
              </span>
            </li>
            {school.enrollment.percentEconomicallyDisadvantaged != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">{school.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%</strong> economically disadvantaged
                </span>
              </li>
            )}
            {school.academics.elaProficiencyPercent != null && school.academics.mathProficiencyPercent != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Proficiency: <strong className="text-white">{school.academics.elaProficiencyPercent.toFixed(0)}%</strong> ELA,{' '}
                  <strong className="text-white">{school.academics.mathProficiencyPercent.toFixed(0)}%</strong> Math
                  {districtAcademics?.elaProficiencyPercent != null && (
                    <span className={
                      school.academics.elaProficiencyPercent >= districtAcademics.elaProficiencyPercent
                        ? 'text-emerald-300' : 'text-amber-300'
                    }>
                      {' '}({school.academics.elaProficiencyPercent >= districtAcademics.elaProficiencyPercent ? 'above' : 'below'} district avg)
                    </span>
                  )}
                </span>
              </li>
            )}
            {school.academics.graduationRate != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Graduation rate: <strong className="text-white">{school.academics.graduationRate.toFixed(0)}%</strong>
                </span>
              </li>
            )}
            {school.teachers.percentOnContinuingContract != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Teacher retention: <strong className="text-white">{school.teachers.percentOnContinuingContract.toFixed(0)}%</strong> on continuing contract
                  {school.teachers.percentOnContinuingContract < 75 && (
                    <span className="text-amber-300"> — potential staffing concern</span>
                  )}
                </span>
              </li>
            )}
            {school.teachers.averageSalary != null && (
              <li className="flex gap-2">
                <span className="text-sc-gold flex-shrink-0">•</span>
                <span>
                  Avg teacher salary: <strong className="text-white">${Math.round(school.teachers.averageSalary).toLocaleString()}</strong>
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Enrollment ──────────────────────────────────────────── */}
      <Section label="Enrollment">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatBox value={school.enrollment.total.toLocaleString()} label="students" />
          <StatBox
            value={school.enrollment.percentEconomicallyDisadvantaged != null
              ? `${school.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%`
              : '—'}
            label="econ. disadv."
            warn={(school.enrollment.percentEconomicallyDisadvantaged ?? 0) >= 70}
          />
          <StatBox
            value={school.enrollment.percentSpecialEducation != null
              ? `${school.enrollment.percentSpecialEducation.toFixed(0)}%`
              : '—'}
            label="special ed."
          />
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
        <Stub label="Chronic absenteeism rate" />
        <Stub label="Year-over-year change" />
      </Section>

      {/* ── Academics vs. district ──────────────────────────────── */}
      {hasAcademics && (
        <Section label={districtAcademics ? 'Academic performance vs. district' : 'Academic performance'}>
          <div className="space-y-5">
            <ProfBar
              label="ELA proficiency"
              value={school.academics.elaProficiencyPercent}
              stateAvg={districtAcademics?.elaProficiencyPercent}
            />
            <ProfBar
              label="Math proficiency"
              value={school.academics.mathProficiencyPercent}
              stateAvg={districtAcademics?.mathProficiencyPercent}
            />
            <ProfBar
              label="College &amp; career ready"
              value={school.academics.collegeCareerReadinessPercent}
              stateAvg={districtAcademics?.collegeCareerReadinessPercent}
            />
            {school.academics.graduationRate != null && (
              <ProfBar
                label="Graduation rate"
                value={school.academics.graduationRate}
                stateAvg={districtAcademics?.graduationRate}
              />
            )}
          </div>
          {districtAcademics && (
            <p className="text-stone-400 text-xs mt-4">
              Dark marker = district average. <span className="text-emerald-600">▲ above</span> / <span className="text-amber-600">▼ below</span> district.
            </p>
          )}
        </Section>
      )}

      {/* ── Teacher workforce ───────────────────────────────────── */}
      {hasTeachers && (
        <Section label="Teacher workforce">
          {school.teachers.averageSalary != null && (
            <FactRow label="Average teacher salary" value={`$${Math.round(school.teachers.averageSalary).toLocaleString()}`} />
          )}
          {school.teachers.percentOnContinuingContract != null && (
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
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
            <FactRow label="With advanced degree" value={`${school.teachers.percentWithAdvancedDegree.toFixed(0)}%`} />
          )}
          <div className="mt-3">
            <Stub label="Open / hard-to-fill vacancies" />
            <Stub label="Teacher turnover rate" />
          </div>
        </Section>
      )}

      {/* ── Finances ────────────────────────────────────────────── */}
      <Section label="School finances">
        <Stub label="Per-pupil expenditure" />
        <Stub label="Title I status" />
        <Stub label="Federal grants" />
      </Section>

    </div>
  );
}
