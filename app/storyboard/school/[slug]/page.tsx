import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repository } from '@/lib/data/repository';
import { SchoolBriefing } from '@/components/storyboard/SchoolBriefing';
import { ChevronLeft } from 'lucide-react';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const districts = await repository.getAllDistricts();
  return districts.flatMap(d => d.schools.map(s => ({ slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = await repository.getSchoolBySlug(slug);
  if (!school) return { title: 'Not Found' };
  return { title: school.name };
}

export default async function StoryboardSchoolPage({ params }: Props) {
  const { slug } = await params;
  const school = await repository.getSchoolBySlug(slug);
  if (!school) notFound();

  const district = await repository.getDistrictBySlug(school.districtSlug);

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 pb-24">
      <Link
        href={`/storyboard/district/${school.districtSlug}/`}
        className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {district?.name ?? 'District'}
      </Link>
      <SchoolBriefing
        school={school}
        districtName={district?.name}
        districtAcademics={district?.academics}
      />

      {/* Sticky bottom bar — always visible back nav for iPad */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-stone-200 z-10">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <Link
            href={`/storyboard/district/${school.districtSlug}/`}
            className="inline-flex items-center gap-1.5 text-sc-navy font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {district?.name ?? 'district'}
          </Link>
        </div>
      </div>
    </div>
  );
}
