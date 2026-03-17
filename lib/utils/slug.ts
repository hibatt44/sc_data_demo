import overrides from '@/data/slug-overrides.json';

const overrideMap: Record<string, string> = overrides;

export function toSlug(name: string): string {
  const override = overrideMap[name];
  if (override) return override;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
