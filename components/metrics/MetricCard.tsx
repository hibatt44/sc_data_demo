import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'inverted';
}

export function MetricCard({ label, value, unit, icon, description, variant = 'default' }: Props) {
  const isInverted = variant === 'inverted';
  return (
    <div className={`rounded-lg p-5 ${isInverted ? 'bg-sc-blue-dark border border-blue-700' : 'bg-white border border-gray-300 shadow-sm'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`text-xs font-semibold uppercase tracking-widest ${isInverted ? 'text-blue-300' : 'text-sc-blue'}`}>
          {label}
        </div>
        {icon && (
          <span className={`flex-shrink-0 ${isInverted ? 'text-sc-gold' : 'text-sc-blue'}`} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${isInverted ? 'text-white' : 'text-sc-text'}`}>{value}</span>
        {unit && <span className={`text-sm ${isInverted ? 'text-blue-300' : 'text-sc-muted'}`}>{unit}</span>}
      </div>
      {description && (
        <p className={`mt-1 text-xs ${isInverted ? 'text-blue-300' : 'text-sc-muted'}`}>{description}</p>
      )}
    </div>
  );
}
