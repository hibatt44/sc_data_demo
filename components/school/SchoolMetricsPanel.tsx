import type { School } from '@/lib/data/types';
import { MetricCard } from '@/components/metrics/MetricCard';
import { ProficiencyChart } from '@/components/metrics/ProficiencyChart';
import { DemographicsBar } from '@/components/metrics/DemographicsBar';
import { formatPercent, formatNumber, formatCurrency } from '@/lib/utils/formatters';
import { Users, BookOpen, DollarSign } from 'lucide-react';

export function SchoolMetricsPanel({ school }: { school: School }) {
  return (
    <div className="space-y-8">
      {/* Enrollment metrics */}
      <section aria-label="Enrollment">
        <h2 className="text-lg font-semibold text-sc-text mb-3">Enrollment</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard label="Total Students" value={formatNumber(school.enrollment.total)} icon={<Users className="w-5 h-5" />} />
          <MetricCard label="Econ. Disadvantaged" value={formatPercent(school.enrollment.percentEconomicallyDisadvantaged)} />
          <MetricCard label="Special Education" value={formatPercent(school.enrollment.percentSpecialEducation)} />
          <MetricCard label="English Learners" value={formatPercent(school.enrollment.percentELL)} />
        </div>
        <DemographicsBar enrollment={school.enrollment} />
      </section>

      {/* Academic metrics */}
      <section aria-label="Academic performance">
        <h2 className="text-lg font-semibold text-sc-text mb-3">Academic Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <MetricCard label="ELA Proficiency" value={formatPercent(school.academics.elaProficiencyPercent)} icon={<BookOpen className="w-5 h-5" />} />
          <MetricCard label="Math Proficiency" value={formatPercent(school.academics.mathProficiencyPercent)} />
          {school.academics.graduationRate != null && (
            <MetricCard label="Graduation Rate" value={formatPercent(school.academics.graduationRate)} />
          )}
          {school.academics.collegeCareerReadinessPercent != null && (
            <MetricCard label="College & Career Ready" value={formatPercent(school.academics.collegeCareerReadinessPercent)} />
          )}
        </div>
        <ProficiencyChart
          elaProficiency={school.academics.elaProficiencyPercent}
          mathProficiency={school.academics.mathProficiencyPercent}
          title="ELA & Math Proficiency"
        />
      </section>

      {/* Teacher metrics */}
      {(school.teachers.averageSalary != null || school.teachers.percentWithAdvancedDegree != null) && (
        <section aria-label="Teacher quality">
          <h2 className="text-lg font-semibold text-sc-text mb-3">Teacher Quality</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {school.teachers.averageSalary != null && (
              <MetricCard label="Avg Teacher Salary" value={formatCurrency(school.teachers.averageSalary)} icon={<DollarSign className="w-5 h-5" />} />
            )}
            {school.teachers.percentWithAdvancedDegree != null && (
              <MetricCard label="Advanced Degrees" value={formatPercent(school.teachers.percentWithAdvancedDegree)} />
            )}
            {school.teachers.percentOnContinuingContract != null && (
              <MetricCard label="Continuing Contract" value={formatPercent(school.teachers.percentOnContinuingContract)} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
