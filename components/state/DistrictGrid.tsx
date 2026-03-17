import type { District } from '@/lib/data/types';
import { DistrictCard } from '@/components/district/DistrictCard';

export function DistrictGrid({ districts }: { districts: District[] }) {
  return (
    <section aria-label="Districts">
      <h2 className="font-display text-xl font-bold text-sc-text mb-4">
        {districts.length} Districts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
        {districts.map(district => (
          <DistrictCard key={district.id} district={district} />
        ))}
      </div>
    </section>
  );
}
