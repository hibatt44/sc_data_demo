import type { Metadata } from 'next';
import { repository } from '@/lib/data/repository';
import { DistrictSelector } from '@/components/storyboard/DistrictSelector';

export const metadata: Metadata = { title: 'Select District' };

export default async function StoryboardHomePage() {
  const districts = await repository.getAllDistricts();

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">
          2024 Report Card · South Carolina
        </p>
        <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight">
          Select a district to brief
        </h1>
      </div>
      <DistrictSelector districts={districts} />
    </div>
  );
}
