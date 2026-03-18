export type SchoolRating = 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Unsatisfactory' | 'Not Rated';
export type GradeBand = 'Elementary' | 'Middle' | 'High' | 'K-12' | 'Other';

export interface DemographicBreakdown {
  total: number;
  percentEconomicallyDisadvantaged?: number;
  percentSpecialEducation?: number;
  percentELL?: number;
  percentWhite?: number;
  percentBlack?: number;
  percentHispanic?: number;
}

export interface AcademicMetrics {
  elaProficiencyPercent?: number;
  mathProficiencyPercent?: number;
  collegeCareerReadinessPercent?: number;
  graduationRate?: number;
}

export interface TeacherMetrics {
  percentWithAdvancedDegree?: number;
  averageSalary?: number;
  percentOnContinuingContract?: number;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  districtId: string;
  districtSlug: string;
  gradeBand: GradeBand;
  rating: SchoolRating;
  enrollment: DemographicBreakdown;
  academics: AcademicMetrics;
  teachers: TeacherMetrics;
  reportYear: number;
  principalName?: string;
  principalEmail?: string;
  mascot?: string;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  rating: SchoolRating;
  enrollment: DemographicBreakdown;
  academics: AcademicMetrics;
  teachers: TeacherMetrics;
  schoolCount: number;
  schools: School[];
  reportYear: number;
  superintendentName?: string;
  superintendentEmail?: string;
}

export interface StateOverview {
  totalEnrollment: number;
  totalDistricts: number;
  totalSchools: number;
  averageGraduationRate?: number;
  ratingDistribution: Record<SchoolRating, number>;
  schoolTypeDistribution: Record<GradeBand, number>;
  demographics?: DemographicBreakdown;
  reportYear: number;
}

export interface SearchableEntity {
  id: string;
  name: string;
  slug: string;
  type: 'school' | 'district';
  districtName?: string;
  rating: SchoolRating;
}
