'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { District } from '@/lib/data/types';
import { Search } from 'lucide-react';

const RATING_DOT: Record<string, string> = {
  'Excellent':      'bg-emerald-500',
  'Good':           'bg-teal-500',
  'Average':        'bg-amber-400',
  'Below Average':  'bg-orange-500',
  'Unsatisfactory': 'bg-red-500',
  'Not Rated':      'bg-stone-300',
};

export function DistrictSelector({ districts }: { districts: District[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(q));
  }, [districts, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search districts…"
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-base focus:outline-none focus:ring-2 focus:ring-sc-navy focus:border-transparent shadow-sm"
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Count */}
      <p className="text-stone-400 text-xs mb-4">
        {query ? `${filtered.length} of ${districts.length}` : `${districts.length} districts`}
      </p>

      {/* List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">No districts found</div>
        )}
        {filtered.map(d => (
          <Link
            key={d.id}
            href={`/storyboard/district/${d.slug}/`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 active:bg-stone-100 transition-colors"
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${RATING_DOT[d.rating] ?? RATING_DOT['Not Rated']}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-900 text-base truncate">{d.name}</div>
              <div className="text-stone-400 text-xs mt-0.5">
                {d.enrollment.total.toLocaleString()} students · {d.schoolCount} schools
              </div>
            </div>
            <span className="text-stone-300 text-sm flex-shrink-0">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
