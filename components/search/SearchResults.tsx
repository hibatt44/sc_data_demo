'use client';

import Link from 'next/link';
import type { SearchableEntity } from '@/lib/data/types';
import { RatingBadge } from '@/components/metrics/RatingBadge';
import { Building2, School } from 'lucide-react';

interface Props {
  results: SearchableEntity[];
  onSelect: () => void;
}

export function SearchResults({ results, onSelect }: Props) {
  if (results.length === 0) {
    return (
      <div id="search-results" className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-3 text-sm text-sc-muted">
        No results found
      </div>
    );
  }

  return (
    <ul
      id="search-results"
      role="listbox"
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto"
    >
      {results.map(entity => {
        const href = entity.type === 'district'
          ? `/district/${entity.slug}/`
          : `/school/${entity.slug}/`;
        return (
          <li key={entity.id} role="option">
            <Link
              href={href}
              onClick={onSelect}
              className="flex items-center gap-3 px-4 py-3 hover:bg-sc-gray transition-colors text-sm"
            >
              <span className="text-sc-muted flex-shrink-0">
                {entity.type === 'district'
                  ? <Building2 className="w-4 h-4" aria-hidden="true" />
                  : <School className="w-4 h-4" aria-hidden="true" />
                }
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sc-text truncate">{entity.name}</div>
                {entity.districtName && (
                  <div className="text-xs text-sc-muted truncate">{entity.districtName}</div>
                )}
              </div>
              <RatingBadge rating={entity.rating} size="sm" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
