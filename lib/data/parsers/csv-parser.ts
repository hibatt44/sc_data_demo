import type { School, District, StateOverview, SchoolRating, GradeBand, DemographicBreakdown, AcademicMetrics, TeacherMetrics } from '../types';
import { toSlug } from '@/lib/utils/slug';

const COLUMN_MAP = {
  schoolId:              'SCHOOL_ID',
  schoolName:            'SCHOOL_NAME',
  districtId:            'DISTRICT_ID',
  districtName:          'DISTRICT_NAME',
  rating:                'OVERALL_RATING',
  gradeBand:             'GRADE_BAND',
  elaProficiency:        'ELA_PROF_PCT',
  mathProficiency:       'MATH_PROF_PCT',
  graduationRate:        'GRAD_RATE_PCT',
  ccrPercent:            'CCR_PCT',
  enrollment:            'TOTAL_ENROLLMENT',
  pctEconDisadvantaged:  'PCT_ECON_DISADVANTAGED',
  pctSpecialEd:          'PCT_SPECIAL_ED',
  pctELL:                'PCT_ELL',
  pctWhite:              'PCT_WHITE',
  pctBlack:              'PCT_BLACK',
  pctHispanic:           'PCT_HISPANIC',
  pctAdvancedDegree:     'PCT_ADVANCED_DEGREE',
  avgSalary:             'AVG_TEACHER_SALARY',
  pctContinuingContract: 'PCT_CONTINUING_CONTRACT',
  reportYear:            'REPORT_YEAR',
} as const;

type CsvRow = Record<string, string>;

function parseRating(raw: string): SchoolRating {
  const val = (raw ?? '').trim().toLowerCase();
  if (val === 'excellent') return 'Excellent';
  if (val === 'good') return 'Good';
  if (val === 'average' || val === 'fair') return 'Average';
  if (val === 'below average' || val === 'below_average') return 'Below Average';
  if (val === 'unsatisfactory') return 'Unsatisfactory';
  return 'Not Rated';
}

function parseGradeBand(raw: string): GradeBand {
  const val = (raw ?? '').trim().toLowerCase();
  if (val.includes('elementary')) return 'Elementary';
  if (val.includes('middle')) return 'Middle';
  if (val.includes('high')) return 'High';
  if (val === 'k-12' || val === 'k12') return 'K-12';
  return 'Other';
}

function pct(row: CsvRow, col: string): number | undefined {
  const v = parseFloat(row[col]);
  return isNaN(v) ? undefined : v;
}

function num(row: CsvRow, col: string): number {
  return parseInt(row[col], 10) || 0;
}

type DemoField = Exclude<keyof DemographicBreakdown, 'total'>;
const DEMO_FIELDS: DemoField[] = [
  'percentEconomicallyDisadvantaged', 'percentSpecialEducation', 'percentELL',
  'percentWhite', 'percentBlack', 'percentHispanic',
];

function aggregateDemographics(schools: School[]): DemographicBreakdown {
  const total = schools.reduce((s, sc) => s + sc.enrollment.total, 0);
  const result: DemographicBreakdown = { total };
  for (const field of DEMO_FIELDS) {
    const withData = schools.filter(sc => sc.enrollment[field] != null);
    if (withData.length === 0) continue;
    const wTotal = withData.reduce((s, sc) => s + sc.enrollment.total, 0);
    if (wTotal === 0) continue;
    result[field] = withData.reduce((s, sc) => s + (sc.enrollment[field] as number) * sc.enrollment.total, 0) / wTotal;
  }
  return result;
}

export function parseRows(rows: CsvRow[]): { districts: District[]; stateOverview: StateOverview } {
  const C = COLUMN_MAP;
  const districtMap = new Map<string, { rows: CsvRow[]; districtName: string }>();

  for (const row of rows) {
    const dId = row[C.districtId];
    if (!dId) continue;
    if (!districtMap.has(dId)) {
      districtMap.set(dId, { rows: [], districtName: row[C.districtName] ?? dId });
    }
    districtMap.get(dId)!.rows.push(row);
  }

  const reportYear = parseInt(rows[0]?.[C.reportYear] ?? '2024', 10);

  const districts: District[] = [];

  for (const [districtId, { rows: dRows, districtName }] of districtMap) {
    const districtSlug = toSlug(districtName);
    const schools: School[] = dRows.map((row): School => {
      const enrollment: DemographicBreakdown = {
        total: num(row, C.enrollment),
        percentEconomicallyDisadvantaged: pct(row, C.pctEconDisadvantaged),
        percentSpecialEducation: pct(row, C.pctSpecialEd),
        percentELL: pct(row, C.pctELL),
        percentWhite: pct(row, C.pctWhite),
        percentBlack: pct(row, C.pctBlack),
        percentHispanic: pct(row, C.pctHispanic),
      };
      const academics: AcademicMetrics = {
        elaProficiencyPercent: pct(row, C.elaProficiency),
        mathProficiencyPercent: pct(row, C.mathProficiency),
        collegeCareerReadinessPercent: pct(row, C.ccrPercent),
        graduationRate: pct(row, C.graduationRate),
      };
      const teachers: TeacherMetrics = {
        percentWithAdvancedDegree: pct(row, C.pctAdvancedDegree),
        averageSalary: parseFloat(row[C.avgSalary]) || undefined,
        percentOnContinuingContract: pct(row, C.pctContinuingContract),
      };
      return {
        id: row[C.schoolId],
        name: row[C.schoolName],
        slug: toSlug(row[C.schoolName]),
        districtId,
        districtSlug,
        gradeBand: parseGradeBand(row[C.gradeBand]),
        rating: parseRating(row[C.rating]),
        enrollment,
        academics,
        teachers,
        reportYear,
      };
    });

    const totalEnrollment = schools.reduce((s, sc) => s + sc.enrollment.total, 0);
    const ratingCounts = { Excellent: 0, Good: 0, Average: 0, 'Below Average': 0, Unsatisfactory: 0, 'Not Rated': 0 };
    let sumELA = 0, countELA = 0, sumMath = 0, countMath = 0, sumGrad = 0, countGrad = 0;
    for (const sc of schools) {
      ratingCounts[sc.rating]++;
      if (sc.academics.elaProficiencyPercent != null) { sumELA += sc.academics.elaProficiencyPercent; countELA++; }
      if (sc.academics.mathProficiencyPercent != null) { sumMath += sc.academics.mathProficiencyPercent; countMath++; }
      if (sc.academics.graduationRate != null) { sumGrad += sc.academics.graduationRate; countGrad++; }
    }

    const districtRating = parseRating(dRows[0]?.[C.rating] ?? '');

    districts.push({
      id: districtId,
      name: districtName,
      slug: districtSlug,
      rating: districtRating,
      enrollment: aggregateDemographics(schools),
      academics: {
        elaProficiencyPercent: countELA > 0 ? sumELA / countELA : undefined,
        mathProficiencyPercent: countMath > 0 ? sumMath / countMath : undefined,
        graduationRate: countGrad > 0 ? sumGrad / countGrad : undefined,
      },
      teachers: {},
      schoolCount: schools.length,
      schools,
      reportYear,
    });
  }

  const totalEnrollment = districts.reduce((s, d) => s + d.enrollment.total, 0);
  const ratingDist: Record<SchoolRating, number> = { Excellent: 0, Good: 0, Average: 0, 'Below Average': 0, Unsatisfactory: 0, 'Not Rated': 0 };
  const typeDist: Record<GradeBand, number> = { Elementary: 0, Middle: 0, High: 0, 'K-12': 0, Other: 0 };
  let gradSum = 0, gradCount = 0;
  for (const d of districts) {
    for (const sc of d.schools) {
      ratingDist[sc.rating]++;
      typeDist[sc.gradeBand]++;
      if (sc.academics.graduationRate != null) { gradSum += sc.academics.graduationRate; gradCount++; }
    }
  }

  const allSchools = districts.flatMap(d => d.schools);
  const stateOverview: StateOverview = {
    totalEnrollment,
    totalDistricts: districts.length,
    totalSchools: districts.reduce((s, d) => s + d.schools.length, 0),
    averageGraduationRate: gradCount > 0 ? gradSum / gradCount : undefined,
    ratingDistribution: ratingDist,
    schoolTypeDistribution: typeDist,
    demographics: aggregateDemographics(allSchools),
    reportYear,
  };

  return { districts, stateOverview };
}
