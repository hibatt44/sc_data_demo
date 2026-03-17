'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { District } from '@/lib/data/types';
import { Search } from 'lucide-react';

const RACE_COLORS = ['#1B4D8E', '#C8860A', '#147A7A', '#94A3B8'];

function MiniBar({ d }: { d: District['enrollment'] }) {
  const segs = [
    { pct: d.percentWhite ?? 0,    color: RACE_COLORS[0] },
    { pct: d.percentBlack ?? 0,    color: RACE_COLORS[1] },
    { pct: d.percentHispanic ?? 0, color: RACE_COLORS[2] },
  ];
  const other = Math.max(0, 100 - segs.reduce((s, x) => s + x.pct, 0));
  if (other > 0) segs.push({ pct: other, color: RACE_COLORS[3] });
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-20 flex-shrink-0" aria-hidden="true">
      {segs.map((s, i) => s.pct > 0 && (
        <div key={i} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
      ))}
    </div>
  );
}

export function DistrictBrowser({ districts }: { districts: District[] }) {
  const [query, setQuery] = useState('');

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

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sc-muted pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by district name…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sc-text placeholder-sc-muted text-sm focus:outline-none focus:ring-2 focus:ring-sc-gold focus:border-transparent shadow-sm"
          aria-label="Filter districts"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sc-muted hover:text-sc-text text-xs px-2 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-sc-muted mb-6 font-medium uppercase tracking-wider">
        {query
          ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
          : `${districts.length} districts`}
      </p>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-sc-muted">
          <p className="text-lg font-semibold mb-1">No districts found</p>
          <p className="text-sm">Try searching by county name or district number</p>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-8">
        {grouped.map(([letter, dists]) => (
          <div key={letter}>
            {!query && (
              <div className="text-xs font-bold uppercase tracking-widest text-sc-muted border-b border-gray-200 pb-1 mb-3">
                {letter}
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {dists.map(d => (
                <Link
                  key={d.id}
                  href={`/district/${d.slug}/`}
                  className="flex items-center gap-4 py-3 px-2 -mx-2 rounded hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sc-text group-hover:text-sc-blue transition-colors text-sm truncate">
                      {d.name}
                    </div>
                    <div className="text-xs text-sc-muted mt-0.5">
                      {d.enrollment.total.toLocaleString()} students · {d.schoolCount} schools
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {d.enrollment.percentEconomicallyDisadvantaged != null && (
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-sc-rust">
                          {d.enrollment.percentEconomicallyDisadvantaged.toFixed(0)}%
                        </div>
                        <div className="text-xs text-sc-muted">econ. disadv.</div>
                      </div>
                    )}
                    <MiniBar d={d.enrollment} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
