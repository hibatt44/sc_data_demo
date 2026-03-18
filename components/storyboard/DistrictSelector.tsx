'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { District } from '@/lib/data/types';
import { RATING_DOT_COLOR } from './primitives';
import { Search } from 'lucide-react';

export function DistrictSelector({ districts }: { districts: District[] }) {
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(q));
  }, [districts, query]);

  // Group alphabetically
  const grouped = useMemo(() => {
    const map = new Map<string, District[]>();
    for (const d of filtered) {
      const letter = d.name[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(d);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // All available letters
  const letters = useMemo(() => grouped.map(([l]) => l), [grouped]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`sb-letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="relative">
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

      {/* Alpha index rail (only when not searching) */}
      {!query && letters.length > 5 && (
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-0.5">
          {letters.map(l => (
            <button
              key={l}
              onClick={() => scrollToLetter(l)}
              className="w-6 h-5 flex items-center justify-center text-xs font-semibold text-stone-400 hover:text-sc-navy active:text-sc-navy transition-colors"
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Grouped list */}
      <div ref={listRef} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">No districts found</div>
        )}
        {grouped.map(([letter, dists]) => (
          <div key={letter}>
            {!query && (
              <div
                id={`sb-letter-${letter}`}
                className="px-5 pt-3 pb-1 text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border-b border-stone-100"
              >
                {letter}
              </div>
            )}
            <div className="divide-y divide-stone-100">
              {dists.map(d => (
                <Link
                  key={d.id}
                  href={`/storyboard/district/${d.slug}/`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${RATING_DOT_COLOR[d.rating] ?? RATING_DOT_COLOR['Not Rated']}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-stone-900 text-base truncate">{d.name}</span>
                      <span className="text-stone-400 text-xs flex-shrink-0">{d.rating}</span>
                    </div>
                    <div className="text-stone-400 text-xs mt-0.5 flex items-center gap-3">
                      <span>{d.enrollment.total.toLocaleString()} students</span>
                      <span>{d.schoolCount} schools</span>
                      {d.enrollment.percentEconomicallyDisadvantaged != null && (
                        <span className={
                          d.enrollment.percentEconomicallyDisadvantaged >= 70
                            ? 'text-orange-500 font-medium'
                            : ''
                        }>
                          {d.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}% econ. disadv.
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-stone-300 text-sm flex-shrink-0">›</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
