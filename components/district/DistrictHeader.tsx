import type { District } from '@/lib/data/types';
import { RatingBadge } from '@/components/metrics/RatingBadge';
import { formatNumber } from '@/lib/utils/formatters';

export function DistrictHeader({ district }: { district: District }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-sc-text">{district.name}</h1>
        <RatingBadge rating={district.rating} size="lg" />
      </div>
      <p className="text-sc-muted">
        {formatNumber(district.schoolCount)} schools · {formatNumber(district.enrollment.total)} students enrolled · {district.reportYear} Report Card
      </p>
    </div>
  );
}
