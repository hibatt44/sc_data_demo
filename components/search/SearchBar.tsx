'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchResults } from './SearchResults';
import { buildSearchIndex, searchEntities } from '@/lib/search/search-index';
import type { SearchableEntity } from '@/lib/data/types';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableEntity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/search-index.json')
      .then(r => r.json())
      .then((entities: SearchableEntity[]) => buildSearchIndex(entities))
      .catch(() => {/* silently fail if not yet generated */});
  }, []);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const res = searchEntities(val);
      setResults(res.slice(0, 8));
      setIsOpen(val.trim().length > 0);
    }, 200);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="global-search" className="sr-only">Search districts and schools</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
          placeholder="Search districts or schools..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-sc-gold focus:bg-white/20"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen}
        />
      </div>
      {isOpen && <SearchResults results={results} onSelect={() => { setIsOpen(false); setQuery(''); }} />}
    </div>
  );
}
