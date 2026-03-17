import type { StateOverview } from '@/lib/data/types';
import { MetricCard } from '@/components/metrics/MetricCard';
import { formatNumber, formatPercent } from '@/lib/utils/formatters';
import { GraduationCap, Building2, School, TrendingUp } from 'lucide-react';

export function StateHeroStats({ overview }: { overview: StateOverview }) {
  return (
    <section aria-label="Statewide statistics">
      <h2 className="sr-only">Statewide Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          variant="inverted"
          label="Total Enrollment"
          value={formatNumber(overview.totalEnrollment)}
          description="Students statewide"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <MetricCard
          variant="inverted"
          label="Districts"
          value={formatNumber(overview.totalDistricts)}
          description="School districts"
          icon={<Building2 className="w-5 h-5" />}
        />
        <MetricCard
          variant="inverted"
          label="Schools"
          value={formatNumber(overview.totalSchools)}
          description="Public schools"
          icon={<School className="w-5 h-5" />}
        />
        <MetricCard
          variant="inverted"
          label="Avg Graduation Rate"
          value={formatPercent(overview.averageGraduationRate)}
          description="High school graduates"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>
    </section>
  );
}
