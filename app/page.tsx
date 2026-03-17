import type { Metadata } from 'next';
import Link from 'next/link';
import { repository } from '@/lib/data/repository';
import { DemographicProfile } from '@/components/metrics/DemographicProfile';
import { SchoolTypeBreakdown } from '@/components/state/SchoolTypeBreakdown';
import { hasDemographicProfileData } from '@/lib/utils/demographics';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'State Overview' };

export default async function HomePage() {
  const overview = await repository.getStateOverview();
  const demo = hasDemographicProfileData(overview.demographics) ? overview.demographics : undefined;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="bg-sc-navy text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <p className="text-sc-gold text-xs font-semibold uppercase tracking-widest mb-5">
            {overview.reportYear} Annual Report Card · South Carolina
          </p>
          <h1 className="font-display text-6xl sm:text-8xl font-black text-white leading-none mb-3 tabular-nums">
            {overview.totalEnrollment.toLocaleString()}
          </h1>
          <p className="font-display text-2xl sm:text-3xl font-semibold text-blue-200 mb-10">
            public school students
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm border-t border-white/10 pt-6 text-blue-300">
            <span><strong className="text-white">{overview.totalDistricts}</strong> school districts</span>
            <span><strong className="text-white">{overview.totalSchools.toLocaleString()}</strong> public schools</span>
            <span>Source: SC Report Card</span>
          </div>
        </div>
        {/* Stepped bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-sc-cream" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} aria-hidden="true" />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {demo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-sc-text mb-2">
              Who are South Carolina's students?
            </h2>
            <p className="text-sc-muted text-sm mb-10 max-w-2xl">
              Enrollment composition across {overview.totalSchools.toLocaleString()} schools and {overview.totalDistricts} districts — 2024 Report Card.
            </p>
            <DemographicProfile enrollment={demo} />
          </div>
        )}

        {/* School type breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-sc-text mb-2">
            How are schools organized?
          </h2>
          <p className="text-sc-muted text-sm mb-10 max-w-2xl">
            Distribution of {overview.totalSchools.toLocaleString()} public schools by grade band,
            across {overview.totalDistricts} districts.
          </p>
          <SchoolTypeBreakdown
            distribution={overview.schoolTypeDistribution}
            totalSchools={overview.totalSchools}
          />
        </div>

        {/* Browse CTA */}
        <div className="bg-sc-navy rounded-lg px-8 py-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-white mb-1">
              Explore by District
            </h2>
            <p className="text-blue-300 text-sm">
              Drill into real enrollment totals and report-card results for all {overview.totalDistricts} districts.
            </p>
          </div>
          <Link
            href="/districts/"
            className="inline-flex items-center gap-2 bg-sc-gold text-sc-navy px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            View all districts
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
