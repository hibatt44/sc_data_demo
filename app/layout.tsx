import type { Metadata } from 'next';
import { Bitter } from 'next/font/google';
import { Public_Sans } from 'next/font/google';
import './globals.css';

const bitter = Bitter({
  subsets: ['latin'],
  variable: '--font-bitter',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'SC Education Summary',
    template: '%s | SC Education Summary',
  },
  description: 'South Carolina Department of Education — District and school data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bitter.variable} ${publicSans.variable}`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
