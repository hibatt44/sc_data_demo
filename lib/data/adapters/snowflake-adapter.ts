import type { DataRepository } from '../repository';
import type { StateOverview, District, School, SearchableEntity } from '../types';

/**
 * Future Ed-Fi / Snowflake implementation.
 * Implement DataRepository using the same COLUMN_MAP pattern as csv-adapter.ts.
 * Swap in repository.ts: replace CsvAdapter with SnowflakeAdapter.
 */
export class SnowflakeAdapter implements DataRepository {
  async getStateOverview(): Promise<StateOverview> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
  async getAllDistricts(): Promise<District[]> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
  async getDistrictBySlug(_slug: string): Promise<District | null> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
  async getSchoolBySlug(_slug: string): Promise<School | null> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
  async getSchoolsByDistrict(_districtSlug: string): Promise<School[]> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
  async getSearchIndex(): Promise<SearchableEntity[]> {
    throw new Error('SnowflakeAdapter not yet implemented');
  }
}
