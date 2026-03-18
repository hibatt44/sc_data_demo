import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repository } from '@/lib/data/repository';
import { BriefingCard } from '@/components/storyboard/BriefingCard';
import { ChevronLeft } from 'lucide-react';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const districts = await repository.getAllDistricts();
  return districts.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const district = await repository.getDistrictBySlug(slug);
  if (!district) return { title: 'Not Found' };
  return { title: district.name };
}

export default async function StoryboardDistrictPage({ params }: Props) {
  const { slug } = await params;
  const [district, overview] = await Promise.all([
    repository.getDistrictBySlug(slug),
    repository.getStateOverview(),
  ]);
  if (!district) notFound();

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 pb-16">
      <Link
        href="/storyboard/"
        className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        All districts
      </Link>
      <BriefingCard district={district} stateOverview={overview} />
    </div>
  );
}
