import type { StateOverview, District, School, SearchableEntity } from './types';
import { CsvAdapter } from './adapters/csv-adapter';
// Future: import { SnowflakeAdapter } from './adapters/snowflake-adapter';

export interface DataRepository {
  getStateOverview(): Promise<StateOverview>;
  getAllDistricts(): Promise<District[]>;
  getDistrictBySlug(slug: string): Promise<District | null>;
  getSchoolBySlug(slug: string): Promise<School | null>;
  getSchoolsByDistrict(districtSlug: string): Promise<School[]>;
  getSearchIndex(): Promise<SearchableEntity[]>;
}

// ONE LINE to swap data sources:
const adapter = new CsvAdapter();
export const repository: DataRepository = adapter;
