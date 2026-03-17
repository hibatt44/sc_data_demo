'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

export function SiteHeader() {
  return (
    <header className="bg-sc-navy text-white border-b-2 border-sc-gold">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-sc-gold text-sc-navy px-3 py-1 rounded font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-8 h-8 bg-sc-gold flex items-center justify-center font-display font-bold text-sc-navy text-xs select-none">
              SC
            </div>
            <span className="font-semibold text-white text-sm tracking-wide uppercase hidden sm:block">
              SC Dept. of Education
            </span>
          </Link>

          <div className="flex-1 max-w-sm">
            <SearchBar />
          </div>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wider uppercase">
            <Link href="/" className="text-gray-300 hover:text-sc-gold transition-colors">Overview</Link>
            <Link href="/districts/" className="text-gray-300 hover:text-sc-gold transition-colors">Districts</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
