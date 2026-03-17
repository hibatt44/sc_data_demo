import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-sc-navy text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-semibold text-sc-gold mb-2 text-sm uppercase tracking-wide">SC Department of Education</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              1429 Senate Street · Columbia, SC 29201
            </p>
            <p className="text-blue-200 text-sm mt-1">
              <a href="tel:+18033345400" className="hover:text-white">(803) 734-8500</a>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sc-gold mb-2 text-sm uppercase tracking-wide">Resources</h2>
            <ul className="space-y-1 text-sm">
              <li><a href="https://ed.sc.gov" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">ed.sc.gov</a></li>
              <li><a href="https://screportcards.com" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">SC Report Cards</a></li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-sc-gold mb-2 text-sm uppercase tracking-wide">Data</h2>
            <p className="text-blue-200 text-sm">
              Data sourced from the SC Report Card (2024). Updated annually.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-blue-400 text-xs">
          © {new Date().getFullYear()} South Carolina Department of Education. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
