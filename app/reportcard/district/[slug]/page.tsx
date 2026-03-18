import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/data/repository';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { DemographicProfile } from '@/components/metrics/DemographicProfile';
import { SchoolTypeBreakdown } from '@/components/state/SchoolTypeBreakdown';
import { SchoolList } from '@/components/district/SchoolList';
import type { GradeBand } from '@/lib/data/types';
import { hasDemographicProfileData } from '@/lib/utils/demographics';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const districts = await repository.getAllDistricts();
  return districts.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const district = await repository.getDistrictBySlug(slug);
  if (!district) return { title: 'District Not Found' };
  return { title: district.name };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const [district, overview] = await Promise.all([
    repository.getDistrictBySlug(slug),
    repository.getStateOverview(),
  ]);
  if (!district) notFound();

  const stateDemo = hasDemographicProfileData(overview.demographics) ? overview.demographics : undefined;
  const hasDistrictDemographics = hasDemographicProfileData(district.enrollment);

  const typeDist = district.schools.reduce((acc, s) => {
    acc[s.gradeBand] = (acc[s.gradeBand] ?? 0) + 1;
    return acc;
  }, {} as Record<GradeBand, number>);
  const shortName = district.name
    .replace(' County School District', ' County')
    .replace(' County Public Schools', ' County')
    .replace(' School District', '')
    .replace(' Schools', '');

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="bg-sc-navy text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          <Breadcrumb crumbs={[
            { label: 'State Overview', href: '/reportcard/' },
            { label: 'Districts', href: '/reportcard/districts/' },
            { label: district.name },
          ]} />
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mt-5 mb-3 leading-tight">
            {district.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-blue-300 text-sm">
            <span><strong className="text-white">{district.enrollment.total.toLocaleString()}</strong> students enrolled</span>
            <span><strong className="text-white">{district.schoolCount}</strong> schools</span>
            <span>{district.reportYear} Report Card</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-sc-cream" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} aria-hidden="true" />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">

        {hasDistrictDemographics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">
            <h2 className="font-display text-2xl font-bold text-sc-text mb-2">
              Who are {shortName}'s students?
            </h2>
            {stateDemo && (
              <p className="text-sc-muted text-sm mb-10 max-w-2xl">
                Enrollment demographics for {district.name}, compared to the South Carolina statewide average.
                <span className="ml-1 font-medium text-sc-rust">Red</span> = above state avg ·{' '}
                <span className="font-medium text-sc-teal">Teal</span> = below.
              </p>
            )}
            {!stateDemo && <div className="mb-10" />}
            <DemographicProfile
              enrollment={district.enrollment}
              stateEnrollment={stateDemo}
              showComparison={!!stateDemo}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">
          <h2 className="font-display text-2xl font-bold text-sc-text mb-2">
            How are {shortName}'s schools organized?
          </h2>
          <p className="text-sc-muted text-sm mb-10 max-w-2xl">
            Distribution of {district.schoolCount} schools by grade band.
          </p>
          <SchoolTypeBreakdown distribution={typeDist} totalSchools={district.schoolCount} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">
          <SchoolList schools={district.schools} />
        </div>

      </div>
    </>
  );
}
