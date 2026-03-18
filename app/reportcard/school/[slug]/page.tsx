import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/data/repository';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SchoolHeader } from '@/components/school/SchoolHeader';
import { SchoolMetricsPanel } from '@/components/school/SchoolMetricsPanel';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const districts = await repository.getAllDistricts();
  return districts.flatMap(d => d.schools.map(s => ({ slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = await repository.getSchoolBySlug(slug);
  if (!school) return { title: 'School Not Found' };
  return { title: school.name };
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  const school = await repository.getSchoolBySlug(slug);
  if (!school) notFound();

  const district = await repository.getDistrictBySlug(school.districtSlug);

  return (
    <PageContainer>
      <Breadcrumb crumbs={[
        { label: 'State Overview', href: '/reportcard/' },
        { label: district?.name ?? 'District', href: `/reportcard/district/${school.districtSlug}/` },
        { label: school.name },
      ]} />

      <SchoolHeader school={school} />
      <SchoolMetricsPanel school={school} />
    </PageContainer>
  );
}
