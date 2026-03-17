import Fuse from 'fuse.js';
import type { SearchableEntity } from '@/lib/data/types';

let fuse: Fuse<SearchableEntity> | null = null;

export function buildSearchIndex(entities: SearchableEntity[]): Fuse<SearchableEntity> {
  fuse = new Fuse(entities, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'districtName', weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
  });
  return fuse;
}

export function searchEntities(query: string): SearchableEntity[] {
  if (!fuse || !query.trim()) return [];
  return fuse.search(query).map(r => r.item);
}
