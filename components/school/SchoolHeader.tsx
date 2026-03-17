import type { School } from '@/lib/data/types';
import { RatingBadge } from '@/components/metrics/RatingBadge';
import { formatNumber } from '@/lib/utils/formatters';

export function SchoolHeader({ school }: { school: School }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-sc-text">{school.name}</h1>
        <RatingBadge rating={school.rating} size="lg" />
      </div>
      <p className="text-sc-muted">
        {school.gradeBand} · {formatNumber(school.enrollment.total)} students enrolled · {school.reportYear} Report Card
      </p>
    </div>
  );
}
