import type { Metadata } from 'next';
import { repository } from '@/lib/data/repository';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { DistrictBrowser } from '@/components/state/DistrictBrowser';

export const metadata: Metadata = { title: 'All Districts' };

export default async function DistrictsPage() {
  const districts = await repository.getAllDistricts();

  return (
    <>
      <div className="bg-sc-navy text-white relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          <Breadcrumb crumbs={[
            { label: 'State Overview', href: '/' },
            { label: 'All Districts' },
          ]} />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
            All Districts
          </h1>
          <p className="text-blue-300 text-sm">
            {districts.length} school districts across South Carolina — filter by name below
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-sc-cream" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} aria-hidden="true" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 sm:px-8 py-8">
          <DistrictBrowser districts={districts} />
        </div>
      </div>
    </>
  );
}
