'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { School } from '@/lib/data/types';
import { formatPercent } from '@/lib/utils/formatters';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'enrollment' | 'econDis' | 'ell';

export function SchoolList({ schools }: { schools: School[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('enrollment');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === 'name'); }
  }

  const sorted = [...schools].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name')       cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'enrollment') cmp = a.enrollment.total - b.enrollment.total;
    else if (sortKey === 'econDis')    cmp = (a.enrollment.percentEconomicallyDisadvantaged ?? -1) - (b.enrollment.percentEconomicallyDisadvantaged ?? -1);
    else if (sortKey === 'ell')        cmp = (a.enrollment.percentELL ?? -1) - (b.enrollment.percentELL ?? -1);
    return sortAsc ? cmp : -cmp;
  });

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className={`flex items-center gap-1 font-semibold transition-colors ${active ? 'text-sc-navy' : 'text-sc-muted hover:text-sc-navy'}`}
        aria-sort={active ? (sortAsc ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? 'opacity-100' : 'opacity-40'}`} aria-hidden="true" />
      </button>
    );
  }

  const GRADE_BAND_COLOR: Record<string, string> = {
    Elementary: 'bg-blue-50 text-blue-800',
    Middle:     'bg-amber-50 text-amber-800',
    High:       'bg-teal-50 text-teal-800',
    'K-12':     'bg-purple-50 text-purple-800',
    Other:      'bg-gray-50 text-gray-600',
  };

  return (
    <section aria-label="Schools in district">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-xl font-bold text-sc-text">Schools</h2>
        <span className="text-sc-muted text-sm">{schools.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-sc-navy text-left text-xs uppercase tracking-wider">
              <th className="pb-2 pr-4 font-semibold text-sc-navy"><SortBtn k="name" label="School" /></th>
              <th className="pb-2 pr-4 font-semibold text-sc-navy hidden sm:table-cell">Type</th>
              <th className="pb-2 pr-4 font-semibold text-sc-navy text-right"><SortBtn k="enrollment" label="Enrolled" /></th>
              <th className="pb-2 pr-4 font-semibold text-sc-navy text-right hidden md:table-cell"><SortBtn k="econDis" label="Econ. Disadv." /></th>
              <th className="pb-2 font-semibold text-sc-navy text-right hidden lg:table-cell"><SortBtn k="ell" label="ELL" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(school => (
              <tr key={school.id} className="hover:bg-sc-cream transition-colors">
                <td className="py-3 pr-4">
                  <Link href={`/reportcard/school/${school.slug}/`} className="font-medium text-sc-blue hover:text-sc-navy hover:underline">
                    {school.name}
                  </Link>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GRADE_BAND_COLOR[school.gradeBand] ?? GRADE_BAND_COLOR.Other}`}>
                    {school.gradeBand}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-sc-text tabular-nums">
                  {school.enrollment.total.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right text-sc-muted tabular-nums hidden md:table-cell">
                  {formatPercent(school.enrollment.percentEconomicallyDisadvantaged)}
                </td>
                <td className="py-3 text-right text-sc-muted tabular-nums hidden lg:table-cell">
                  {formatPercent(school.enrollment.percentELL)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
