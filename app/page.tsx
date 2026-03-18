import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'SC Education — Demo Launcher' };

export default function LauncherPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      {/* Wordmark */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-sc-gold flex items-center justify-center font-display font-bold text-sc-navy text-sm select-none">
            SC
          </div>
          <span className="text-white font-semibold text-lg tracking-wide uppercase">
            Dept. of Education
          </span>
        </div>
        <p className="text-slate-500 text-sm tracking-widest uppercase">Demo Environment</p>
      </div>

      {/* App cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        <Link
          href="/reportcard/"
          className="flex-1 group bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-sc-gold hover:bg-slate-800 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-sc-navy border border-sc-gold/30 flex items-center justify-center mb-5">
            <span className="text-sc-gold font-bold text-xs font-display">RC</span>
          </div>
          <h2 className="text-white font-display font-bold text-xl mb-2 group-hover:text-sc-gold transition-colors">
            Report Card
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Full district and school data explorer. Searchable, sortable, with demographics and academic metrics.
          </p>
          <div className="mt-6 text-sc-gold text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Open &rarr;
          </div>
        </Link>

        <Link
          href="/storyboard/"
          className="flex-1 group bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mb-5">
            <span className="text-emerald-400 font-bold text-xs font-display">SB</span>
          </div>
          <h2 className="text-white font-display font-bold text-xl mb-2 group-hover:text-emerald-400 transition-colors">
            Storyboard
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Executive district briefing. Fast facts for a superintendent visiting a district — optimized for iPad.
          </p>
          <div className="mt-6 text-emerald-400 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Open &rarr;
          </div>
        </Link>
      </div>

      <p className="mt-12 text-slate-600 text-xs">
        2024 SC Report Card Data
      </p>
    </div>
  );
}
