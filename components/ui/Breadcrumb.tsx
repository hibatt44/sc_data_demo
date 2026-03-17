import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
  variant?: 'dark' | 'light';
}

export function Breadcrumb({ crumbs, variant = 'dark' }: Props) {
  const linkClass = variant === 'dark'
    ? 'text-blue-300 hover:text-sc-gold transition-colors'
    : 'text-sc-muted hover:text-sc-blue transition-colors underline underline-offset-2';
  const currentClass = variant === 'dark' ? 'text-blue-200/60' : 'text-sc-text';
  const dividerClass = variant === 'dark' ? 'text-blue-700' : 'text-gray-300';

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-1 items-center text-xs font-medium tracking-wide uppercase">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true" className={dividerClass}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className={linkClass}>{crumb.label}</Link>
            ) : (
              <span className={currentClass} aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
