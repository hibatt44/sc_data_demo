import type { DataRepository } from '../repository';
import type { StateOverview, District, School, SearchableEntity } from '../types';
import fs from 'fs';
import path from 'path';

interface EducationData {
  stateOverview: StateOverview;
  districts: District[];
}

const filePath = path.join(process.cwd(), 'data', 'generated', 'sc-education-data.json');

function loadData(): EducationData {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as EducationData;
}

export class CsvAdapter implements DataRepository {
  private data: EducationData | null = null;
  private mtimeMs: number | null = null;

  private get(): EducationData {
    const stats = fs.statSync(filePath);
    if (!this.data || this.mtimeMs !== stats.mtimeMs) {
      this.data = loadData();
      this.mtimeMs = stats.mtimeMs;
    }
    return this.data;
  }

  async getStateOverview(): Promise<StateOverview> {
    return this.get().stateOverview;
  }

  async getAllDistricts(): Promise<District[]> {
    return this.get().districts;
  }

  async getDistrictBySlug(slug: string): Promise<District | null> {
    return this.get().districts.find(d => d.slug === slug) ?? null;
  }

  async getSchoolBySlug(slug: string): Promise<School | null> {
    for (const district of this.get().districts) {
      const school = district.schools.find(s => s.slug === slug);
      if (school) return school;
    }
    return null;
  }

  async getSchoolsByDistrict(districtSlug: string): Promise<School[]> {
    const district = await this.getDistrictBySlug(districtSlug);
    return district?.schools ?? [];
  }

  async getSearchIndex(): Promise<SearchableEntity[]> {
    const { districts } = this.get();
    const entities: SearchableEntity[] = [];
    for (const district of districts) {
      entities.push({
        id: district.id,
        name: district.name,
        slug: district.slug,
        type: 'district',
        rating: district.rating,
      });
      for (const school of district.schools) {
        entities.push({
          id: school.id,
          name: school.name,
          slug: school.slug,
          type: 'school',
          districtName: district.name,
          rating: school.rating,
        });
      }
    }
    return entities;
  }
}
