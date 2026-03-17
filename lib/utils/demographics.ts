import type { DemographicBreakdown } from '@/lib/data/types';

export function hasDemographicProfileData(enrollment?: DemographicBreakdown): boolean {
  if (!enrollment) return false;

  return [
    enrollment.percentEconomicallyDisadvantaged,
    enrollment.percentSpecialEducation,
    enrollment.percentWhite,
    enrollment.percentBlack,
    enrollment.percentHispanic,
  ].some(value => value != null);
}
