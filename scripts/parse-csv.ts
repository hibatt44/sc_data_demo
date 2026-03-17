import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { parse } from 'csv-parse/sync';
import { parseRows } from '../lib/data/parsers/csv-parser';

const RAW_CSV = path.join(process.cwd(), 'data', 'raw', 'sc-report-card-2024.csv');
const RAW_XLSX = path.join(process.cwd(), 'data', 'raw', 'ReportCardData_forResearchers2024_11.xlsx');
const OUT_JSON = path.join(process.cwd(), 'data', 'generated', 'sc-education-data.json');

function run() {
  if (fs.existsSync(RAW_XLSX)) {
    const scriptPath = path.join(process.cwd(), 'scripts', 'parse_report_card_xlsx.py');
    const result = spawnSync('python3', [scriptPath, RAW_XLSX, OUT_JSON], {
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }

    writeSearchIndex();
    return;
  }

  if (!fs.existsSync(RAW_CSV)) {
    console.log('No CSV found at', RAW_CSV, '— generating sample data instead');
    generateSampleData();
    return;
  }

  const raw = fs.readFileSync(RAW_CSV, 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  const result = parseRows(rows);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));

  writeSearchIndex(result);
}

function writeSearchIndex(existingResult?: any) {
  const result = existingResult ?? JSON.parse(fs.readFileSync(OUT_JSON, 'utf-8'));
  const searchEntities = result.districts.flatMap((d: any) => [
    { id: d.id, name: d.name, slug: d.slug, type: 'district', rating: d.rating },
    ...d.schools.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      type: 'school',
      districtName: d.name,
      rating: s.rating,
    })),
  ]);
  const searchIndexPath = path.join(process.cwd(), 'public', 'search-index.json');
  fs.mkdirSync(path.dirname(searchIndexPath), { recursive: true });
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchEntities));
  console.log(`Wrote ${result.districts.length} districts, ${result.stateOverview.totalSchools} schools`);
}

function weightedDemographics(schools: any[]) {
  const total = schools.reduce((s: number, sc: any) => s + sc.enrollment.total, 0);
  const fields = ['percentEconomicallyDisadvantaged','percentSpecialEducation','percentELL','percentWhite','percentBlack','percentHispanic'];
  const result: any = { total };
  for (const f of fields) {
    const w = schools.filter((sc: any) => sc.enrollment[f] != null);
    if (!w.length) continue;
    const wt = w.reduce((s: number, sc: any) => s + sc.enrollment.total, 0);
    if (!wt) continue;
    result[f] = w.reduce((s: number, sc: any) => s + sc.enrollment[f] * sc.enrollment.total, 0) / wt;
  }
  return result;
}

function generateSampleData() {
  const ratings: Array<'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Unsatisfactory' | 'Not Rated'> = ['Excellent', 'Good', 'Average', 'Below Average', 'Unsatisfactory', 'Not Rated'];
  const gradeBands: Array<'Elementary' | 'Middle' | 'High' | 'K-12'> = ['Elementary', 'Middle', 'High', 'K-12'];

  const districtNames = [
    'Abbeville County School District',
    'Aiken County Public Schools',
    'Allendale County School District',
    'Anderson School District One',
    'Anderson School District Two',
    'Anderson School District Three',
    'Anderson School District Four',
    'Anderson School District Five',
    'Bamberg School District One',
    'Bamberg School District Two',
    'Barnwell School District Nineteen',
    'Barnwell School District Twenty-Nine',
    'Barnwell School District Forty-Five',
    'Beaufort County School District',
    'Berkeley County School District',
    'Calhoun County School District',
    'Charleston County School District',
    'Cherokee County School District',
    'Chester County School District',
    'Chesterfield County School District',
    'Clarendon School District One',
    'Clarendon School District Two',
    'Clarendon School District Three',
    'Colleton County School District',
    'Darlington County School District',
    'Dillon School District Three',
    'Dillon School District Four',
    'Dorchester School District Two',
    'Dorchester School District Four',
    'Edgefield County School District',
    'Fairfield County School District',
    'Florence School District One',
    'Florence School District Two',
    'Florence School District Three',
    'Florence School District Four',
    'Florence School District Five',
    'Georgetown County School District',
    'Greenville County School District',
    'Greenwood School District Fifty',
    'Greenwood School District Fifty-One',
    'Greenwood School District Fifty-Two',
    'Hampton School District One',
    'Hampton School District Two',
    'Horry County Schools',
    'Jasper County School District',
    'Kershaw County School District',
    'Lancaster County School District',
    'Laurens School District Fifty-Five',
    'Laurens School District Fifty-Six',
    'Lee County School District',
    'Lexington School District One',
    'Lexington School District Two',
    'Lexington School District Three',
    'Lexington School District Four',
    'Lexington School District Five',
    'Marion School District One',
    'Marion School District Two',
    'Marion School District Seven',
    'Marlboro County School District',
    'McCormick County School District',
    'Newberry County School District',
    'Oconee County School District',
    'Orangeburg Consolidated School District',
    'Pickens County School District',
    'Richland School District One',
    'Richland School District Two',
    'Saluda County School District',
    'Spartanburg School District One',
    'Spartanburg School District Two',
    'Spartanburg School District Three',
    'Spartanburg School District Four',
    'Spartanburg School District Five',
    'Spartanburg School District Six',
    'Spartanburg School District Seven',
    'Sumter School District',
    'Union County School District',
    'Williamsburg County School District',
    'York School District One',
    'York School District Two',
    'York School District Three',
    'York School District Four',
  ];

  const schoolPrefixes = ['North', 'South', 'East', 'West', 'Central', 'Oak', 'Pine', 'River', 'Lake', 'Spring'];
  const schoolSuffixes = ['Elementary', 'Middle School', 'High School', 'Academy', 'Primary', 'Intermediate'];

  // Approximate real school counts for SC's larger districts (from public records)
  const KNOWN_SCHOOL_COUNTS: Record<string, number> = {
    'Greenville County School District':  102,
    'Charleston County School District':   91,
    'Horry County Schools':                63,
    'Richland School District One':        54,
    'Berkeley County School District':     50,
    'Lexington School District One':       33,
    'Richland School District Two':        32,
    'Spartanburg School District Seven':   30,
    'Aiken County Public Schools':         29,
    'Anderson School District Five':       27,
    'York School District Three':          25,
    'Dorchester School District Two':      24,
    'Beaufort County School District':     32,
    'Sumter School District':              21,
    'Florence School District One':        21,
  };

  let schoolIdCounter = 1000;

  const districts = districtNames.map((districtName, di) => {
    const districtId = `D${String(di + 1).padStart(3, '0')}`;
    const schoolCount = KNOWN_SCHOOL_COUNTS[districtName] ?? (5 + Math.floor(Math.random() * 18));
    const districtSlug = districtName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // Apply known overrides
    const slugOverrides: Record<string, string> = {
      'Richland School District One': 'richland-one',
      'Richland School District Two': 'richland-two',
      'Charleston County School District': 'charleston-county',
      'Greenville County School District': 'greenville-county',
      'Horry County Schools': 'horry-county',
    };
    const finalDistrictSlug = slugOverrides[districtName] ?? districtSlug;

    const schools = Array.from({ length: schoolCount }, (_, si): any => {
      const prefix = schoolPrefixes[Math.floor(Math.random() * schoolPrefixes.length)];
      const suffix = schoolSuffixes[Math.floor(Math.random() * schoolSuffixes.length)];
      const schoolName = `${prefix} ${districtName.split(' ')[0]} ${suffix}`;
      const uniqueName = `${schoolName} ${si + 1}`;
      const schoolSlug = uniqueName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      const gradeBand = suffix.includes('Elementary') || suffix.includes('Primary') || suffix.includes('Intermediate')
        ? 'Elementary'
        : suffix.includes('Middle')
          ? 'Middle'
          : suffix.includes('High')
            ? 'High'
            : gradeBands[Math.floor(Math.random() * gradeBands.length)];

      const enrollment = 250 + Math.floor(Math.random() * 750);
      const ela = 20 + Math.floor(Math.random() * 60);
      const math = 15 + Math.floor(Math.random() * 65);
      const grad = gradeBand === 'High' ? 60 + Math.floor(Math.random() * 38) : undefined;

      return {
        id: `S${String(schoolIdCounter++).padStart(4, '0')}`,
        name: uniqueName,
        slug: schoolSlug,
        districtId,
        districtSlug: finalDistrictSlug,
        gradeBand,
        rating,
        enrollment: {
          total: enrollment,
          percentEconomicallyDisadvantaged: 20 + Math.random() * 60,
          percentSpecialEducation: 8 + Math.random() * 15,
          percentELL: Math.random() * 20,
          percentWhite: 20 + Math.random() * 50,
          percentBlack: 10 + Math.random() * 50,
          percentHispanic: 2 + Math.random() * 30,
        },
        academics: {
          elaProficiencyPercent: ela,
          mathProficiencyPercent: math,
          collegeCareerReadinessPercent: gradeBand === 'High' ? 30 + Math.floor(Math.random() * 50) : undefined,
          graduationRate: grad,
        },
        teachers: {
          percentWithAdvancedDegree: 15 + Math.random() * 40,
          averageSalary: 42000 + Math.floor(Math.random() * 20000),
          percentOnContinuingContract: 50 + Math.random() * 40,
        },
        reportYear: 2024,
      };
    });

    const elaVals = schools.filter((sc: any) => sc.academics.elaProficiencyPercent != null).map((sc: any) => sc.academics.elaProficiencyPercent!);
    const mathVals = schools.filter((sc: any) => sc.academics.mathProficiencyPercent != null).map((sc: any) => sc.academics.mathProficiencyPercent!);
    const gradVals = schools.filter((sc: any) => sc.academics.graduationRate != null).map((sc: any) => sc.academics.graduationRate!);

    return {
      id: districtId,
      name: districtName,
      slug: finalDistrictSlug,
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      enrollment: weightedDemographics(schools),
      academics: {
        elaProficiencyPercent: elaVals.length ? elaVals.reduce((a: number, b: number) => a + b, 0) / elaVals.length : undefined,
        mathProficiencyPercent: mathVals.length ? mathVals.reduce((a: number, b: number) => a + b, 0) / mathVals.length : undefined,
        graduationRate: gradVals.length ? gradVals.reduce((a: number, b: number) => a + b, 0) / gradVals.length : undefined,
      },
      teachers: {},
      schoolCount: schools.length,
      schools,
      reportYear: 2024,
    };
  });

  const allSchools = districts.flatMap((d: any) => d.schools);
  const ratingDist: Record<string, number> = { Excellent: 0, Good: 0, Average: 0, 'Below Average': 0, Unsatisfactory: 0, 'Not Rated': 0 };
  const typeDist: Record<string, number> = { Elementary: 0, Middle: 0, High: 0, 'K-12': 0, Other: 0 };
  let gradSum = 0, gradCount = 0;
  for (const sc of allSchools) {
    ratingDist[sc.rating]++;
    typeDist[sc.gradeBand]++;
    if (sc.academics.graduationRate != null) { gradSum += sc.academics.graduationRate; gradCount++; }
  }

  const stateDemographics = weightedDemographics(allSchools);
  const result = {
    stateOverview: {
      totalEnrollment: stateDemographics.total,
      totalDistricts: districts.length,
      totalSchools: allSchools.length,
      averageGraduationRate: gradCount > 0 ? gradSum / gradCount : undefined,
      ratingDistribution: ratingDist,
      schoolTypeDistribution: typeDist,
      demographics: stateDemographics,
      reportYear: 2024,
    },
    districts,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));

  // Write search index to public/ for client-side search
  const searchEntities = result.districts.flatMap((d: any) => [
    { id: d.id, name: d.name, slug: d.slug, type: 'district', rating: d.rating },
    ...d.schools.map((s: any) => ({
      id: s.id, name: s.name, slug: s.slug, type: 'school',
      districtName: d.name, rating: s.rating,
    })),
  ]);
  const searchIndexPath = path.join(process.cwd(), 'public', 'search-index.json');
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchEntities));
  console.log(`Generated sample data: ${districts.length} districts, ${allSchools.length} schools`);
}

run();
