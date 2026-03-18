import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'District Briefing',
    template: '%s | District Briefing',
  },
  description: 'Executive district briefing for South Carolina school districts',
};

export default function StoryboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Minimal top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center justify-between">
          <Link href="/storyboard/" className="font-display font-bold text-sc-navy text-sm tracking-wide">
            District Briefing
          </Link>
          <Link href="/" className="text-stone-400 hover:text-stone-600 text-xs transition-colors">
            Launcher
          </Link>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
