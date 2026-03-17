export function formatPercent(value?: number, decimals = 1): string {
  if (value == null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value?: number): string {
  if (value == null) return 'N/A';
  return value.toLocaleString();
}

export function formatCurrency(value?: number): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
