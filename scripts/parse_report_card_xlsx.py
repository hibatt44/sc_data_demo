#!/usr/bin/env python3

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from typing import Optional

NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def normalize_text(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def normalize_id(raw: Optional[str]) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if not digits:
        return ""
    return digits.zfill(7)


def to_slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9\s-]", "", text.lower()).strip()
    return re.sub(r"\s+", "-", slug)


def parse_rating(raw: Optional[str]) -> str:
    value = normalize_text(raw).lower()
    if value == "excellent":
        return "Excellent"
    if value == "good":
        return "Good"
    if value == "average":
        return "Average"
    if value == "below average":
        return "Below Average"
    if value == "unsatisfactory":
        return "Unsatisfactory"
    return "Not Rated"


def parse_number(raw: Optional[str]) -> Optional[float]:
    value = normalize_text(raw)
    if not value or value == "*":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def parse_int(raw: Optional[str]) -> int:
    value = parse_number(raw)
    return int(round(value)) if value is not None else 0


def parse_grade_band(span: Optional[str], school_type: Optional[str]) -> str:
    value = normalize_text(span).upper()
    grades: list[int] = []
    has_early = "PK" in value or "K" in value
    for match in re.findall(r"\d+", value):
        grades.append(int(match))

    if has_early:
        grades.append(0)

    if len(grades) >= 2:
        low, high = min(grades), max(grades)
        if low <= 5 and high >= 9:
            return "K-12"
        if high >= 9:
            return "High"
        if low <= 5:
            return "Elementary"
        if low >= 6 and high <= 8:
            return "Middle"

    normalized_type = normalize_text(school_type).upper()
    if normalized_type in {"P", "E"}:
        return "Elementary"
    if normalized_type == "M":
        return "Middle"
    if normalized_type == "H":
        return "High"
    return "Other"


def build_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    strings = []
    for item in root.findall("a:si", NS):
        strings.append("".join(node.text or "" for node in item.iterfind(".//a:t", NS)))
    return strings


def get_sheet_path(archive: zipfile.ZipFile, sheet_name: str) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: "xl/" + rel.attrib["Target"] for rel in rels}
    for sheet in workbook.find("a:sheets", NS):
        if sheet.attrib["name"] == sheet_name:
            rel_id = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
            return rel_map[rel_id]
    raise KeyError(f"Missing sheet: {sheet_name}")


def read_sheet(archive: zipfile.ZipFile, shared_strings: list[str], sheet_name: str) -> list[dict[str, str]]:
    path = get_sheet_path(archive, sheet_name)
    root = ET.fromstring(archive.read(path))
    sheet_data = root.find("a:sheetData", NS)
    rows: list[dict[str, str]] = []

    for row in sheet_data.findall("a:row", NS):
        values: dict[str, str] = {}
        for cell in row.findall("a:c", NS):
            ref = cell.attrib["r"]
            col = re.match(r"[A-Z]+", ref).group(0)
            kind = cell.attrib.get("t")
            value = ""
            shared_value = cell.find("a:v", NS)
            inline_value = cell.find("a:is", NS)

            if kind == "s" and shared_value is not None:
                value = shared_strings[int(shared_value.text)]
            elif kind == "inlineStr" and inline_value is not None:
                value = "".join(node.text or "" for node in inline_value.iterfind(".//a:t", NS))
            elif shared_value is not None:
                value = shared_value.text or ""

            values[col] = normalize_text(value)
        rows.append(values)

    return rows


def make_school_slug(name: str, school_id: str) -> str:
    return to_slug(f"{name} {school_id}")


def average(numbers: list[Optional[float]]) -> Optional[float]:
    usable = [value for value in numbers if value is not None]
    if not usable:
        return None
    return sum(usable) / len(usable)


def round_metric(value: Optional[float]) -> Optional[float]:
    if value is None:
        return None
    return round(value, 1)


def weighted_average(items: list[dict], field: str, weight_field: str = "total") -> Optional[float]:
    weighted_sum = 0.0
    total_weight = 0.0
    for item in items:
        value = item.get(field)
        weight = item.get(weight_field)
        if value is None or weight is None:
            continue
        weighted_sum += value * weight
        total_weight += weight
    if total_weight == 0:
        return None
    return weighted_sum / total_weight


def main() -> None:
    if len(sys.argv) not in {3, 4}:
        raise SystemExit("Usage: parse_report_card_xlsx.py <input.xlsx> <output.json> [additional-info.xlsx]")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    additional_info_path = Path(sys.argv[3]) if len(sys.argv) == 4 else input_path.with_name("ReportCardData_AdditionalInfo2024_6.xlsx")

    with zipfile.ZipFile(input_path) as archive:
        shared_strings = build_shared_strings(archive)

        main_rows = read_sheet(archive, shared_strings, "1.MainPage")
        ratings_rows = read_sheet(archive, shared_strings, "REPORT_CARD_RATINGS")
        elem_middle_rows = read_sheet(archive, shared_strings, "2a.AchievPrepSuccessELEMMIDD")
        high_rows = read_sheet(archive, shared_strings, "2b.AchievPrepSuccessHIGH")
        graduation_rows = read_sheet(archive, shared_strings, "3.Gradrate")
        ccr_rows = read_sheet(archive, shared_strings, "4.CollegeCareer")
        ml_rows = read_sheet(archive, shared_strings, "5.MultilingualLearners")

    subgroup_by_id: dict[str, dict[str, str]] = {}
    classroom_by_id: dict[str, dict[str, str]] = {}
    if additional_info_path.exists():
        with zipfile.ZipFile(additional_info_path) as archive:
            shared_strings = build_shared_strings(archive)
            subgroup_rows = read_sheet(archive, shared_strings, "5b.SchoolClimate_ChronicAbs")
            classroom_rows = read_sheet(archive, shared_strings, "6.ClassroomEnvironmentPage")
            subgroup_by_id = {normalize_id(row.get("D")): row for row in subgroup_rows[1:] if normalize_id(row.get("D"))}
            classroom_by_id = {normalize_id(row.get("D")): row for row in classroom_rows[1:] if normalize_id(row.get("D"))}

    ratings_by_id = {normalize_id(row.get("D")): row for row in ratings_rows[1:] if normalize_id(row.get("D"))}
    elem_middle_by_id = {normalize_id(row.get("D")): row for row in elem_middle_rows[1:] if normalize_id(row.get("D"))}
    high_by_id = {normalize_id(row.get("D")): row for row in high_rows[1:] if normalize_id(row.get("D"))}
    graduation_by_id = {normalize_id(row.get("D")): row for row in graduation_rows[1:] if normalize_id(row.get("D"))}
    ccr_by_id = {normalize_id(row.get("D")): row for row in ccr_rows[1:] if normalize_id(row.get("D"))}
    ml_by_id = {normalize_id(row.get("D")): row for row in ml_rows[1:] if normalize_id(row.get("D"))}

    district_rows: dict[str, dict[str, str]] = {}
    schools_by_district: dict[str, list[dict]] = defaultdict(list)
    seen_school_ids: set[str] = set()
    school_count_distribution: dict[str, int] = defaultdict(int)
    state_row: Optional[dict[str, str]] = None
    report_year = 2024

    for row in main_rows[1:]:
        entity_id = normalize_id(row.get("D"))
        school_type = normalize_text(row.get("E")).upper()
        district_name = row.get("B", "")
        school_name = row.get("C", "")

        if row.get("A"):
            report_year = int(float(row["A"]))

        if school_type == "S":
            state_row = row
            continue

        if school_type == "D":
            district_rows[entity_id] = row
            continue

        if entity_id in seen_school_ids:
            continue
        seen_school_ids.add(entity_id)

        district_slug = to_slug(district_name)
        enrollment_total = parse_int(row.get("K"))
        ml_row = ml_by_id.get(entity_id)
        subgroup_row = subgroup_by_id.get(entity_id, {})
        classroom_row = classroom_by_id.get(entity_id, {})
        lep_count = parse_number(ml_row.get("Q")) if ml_row else None
        percent_ell = round_metric((lep_count / enrollment_total) * 100) if lep_count is not None and enrollment_total else None
        subgroup_total = parse_number(subgroup_row.get("H")) if subgroup_row else None

        def subgroup_percent(key: str) -> Optional[float]:
            count = parse_number(subgroup_row.get(key)) if subgroup_row else None
            if count is None:
                return None
            base = subgroup_total or enrollment_total
            if not base:
                return None
            return round_metric((count / base) * 100)

        em_row = elem_middle_by_id.get(entity_id, {})
        hs_row = high_by_id.get(entity_id, {})
        rating_row = ratings_by_id.get(entity_id, {})
        graduation_row = graduation_by_id.get(entity_id, {})
        ccr_row = ccr_by_id.get(entity_id, {})

        grade_band = parse_grade_band(row.get("J"), school_type)
        school_count_distribution[grade_band] += 1

        school = {
            "id": entity_id,
            "name": school_name,
            "slug": make_school_slug(school_name, entity_id),
            "districtId": "",
            "districtSlug": district_slug,
            "gradeBand": grade_band,
            "rating": parse_rating(rating_row.get("P")),
            "enrollment": {
                "total": enrollment_total,
                "percentEconomicallyDisadvantaged": subgroup_percent("AI"),
                "percentSpecialEducation": subgroup_percent("AC"),
                "percentELL": percent_ell,
                "percentWhite": subgroup_percent("W"),
                "percentBlack": subgroup_percent("K"),
                "percentHispanic": subgroup_percent("T"),
            },
            "academics": {
                "elaProficiencyPercent": round_metric(parse_number(em_row.get("F")) if em_row else parse_number(hs_row.get("F"))),
                "mathProficiencyPercent": round_metric(parse_number(em_row.get("S")) if em_row else parse_number(hs_row.get("U"))),
                "collegeCareerReadinessPercent": round_metric(parse_number(ccr_row.get("J"))),
                "graduationRate": round_metric(parse_number(graduation_row.get("F"))),
            },
            "teachers": {
                "percentWithAdvancedDegree": round_metric(parse_number(classroom_row.get("H"))),
                "averageSalary": round_metric(parse_number((classroom_row.get("L") or "").replace("$", "").replace(",", ""))),
                "percentOnContinuingContract": round_metric(parse_number(classroom_row.get("N"))),
            },
            "reportYear": report_year,
        }

        schools_by_district[district_name].append(school)

    districts: list[dict] = []
    rating_distribution = {
        "Excellent": 0,
        "Good": 0,
        "Average": 0,
        "Below Average": 0,
        "Unsatisfactory": 0,
        "Not Rated": 0,
    }

    for district_id, row in sorted(district_rows.items(), key=lambda item: item[1].get("B", "")):
        district_name = row.get("B", "")
        district_slug = to_slug(district_name)
        district_schools = sorted(schools_by_district.get(district_name, []), key=lambda school: school["name"])

        for school in district_schools:
            school["districtId"] = district_id
            rating_distribution[school["rating"]] += 1

        district_rating_row = ratings_by_id.get(district_id, {})
        district_ml_row = ml_by_id.get(district_id, {})
        district_subgroup_row = subgroup_by_id.get(district_id, {})
        district_classroom_row = classroom_by_id.get(district_id, {})
        district_enrollment = parse_int(row.get("K"))
        district_lep_count = parse_number(district_ml_row.get("Q")) if district_ml_row else None
        district_percent_ell = round_metric((district_lep_count / district_enrollment) * 100) if district_lep_count is not None and district_enrollment else None
        district_subgroup_total = parse_number(district_subgroup_row.get("H")) if district_subgroup_row else None

        def district_subgroup_percent(key: str) -> Optional[float]:
            count = parse_number(district_subgroup_row.get(key)) if district_subgroup_row else None
            if count is None:
                return None
            base = district_subgroup_total or district_enrollment
            if not base:
                return None
            return round_metric((count / base) * 100)

        districts.append({
            "id": district_id,
            "name": district_name,
            "slug": district_slug,
            "rating": parse_rating(district_rating_row.get("P")),
            "enrollment": {
                "total": district_enrollment,
                "percentEconomicallyDisadvantaged": district_subgroup_percent("AI"),
                "percentSpecialEducation": district_subgroup_percent("AC"),
                "percentELL": district_percent_ell,
                "percentWhite": district_subgroup_percent("W"),
                "percentBlack": district_subgroup_percent("K"),
                "percentHispanic": district_subgroup_percent("T"),
            },
            "academics": {
                "elaProficiencyPercent": round_metric(average([school["academics"]["elaProficiencyPercent"] for school in district_schools])),
                "mathProficiencyPercent": round_metric(average([school["academics"]["mathProficiencyPercent"] for school in district_schools])),
                "collegeCareerReadinessPercent": round_metric(average([school["academics"]["collegeCareerReadinessPercent"] for school in district_schools])),
                "graduationRate": round_metric(average([school["academics"]["graduationRate"] for school in district_schools])),
            },
            "teachers": {
                "percentWithAdvancedDegree": round_metric(parse_number(district_classroom_row.get("H"))),
                "averageSalary": round_metric(parse_number((district_classroom_row.get("L") or "").replace("$", "").replace(",", ""))),
                "percentOnContinuingContract": round_metric(parse_number(district_classroom_row.get("N"))),
            },
            "schoolCount": len(district_schools),
            "schools": district_schools,
            "reportYear": report_year,
        })

    all_schools = [school for district in districts for school in district["schools"]]
    state_total_enrollment = parse_int(state_row.get("K")) if state_row else sum(district["enrollment"]["total"] for district in districts)

    result = {
        "stateOverview": {
            "totalEnrollment": state_total_enrollment,
            "totalDistricts": len(districts),
            "totalSchools": len(all_schools),
            "averageGraduationRate": round_metric(average([school["academics"]["graduationRate"] for school in all_schools])),
            "ratingDistribution": rating_distribution,
            "schoolTypeDistribution": {
                "Elementary": school_count_distribution["Elementary"],
                "Middle": school_count_distribution["Middle"],
                "High": school_count_distribution["High"],
                "K-12": school_count_distribution["K-12"],
                "Other": school_count_distribution["Other"],
            },
            "demographics": {
                "total": state_total_enrollment,
                "percentEconomicallyDisadvantaged": round_metric(weighted_average([district["enrollment"] for district in districts], "percentEconomicallyDisadvantaged")),
                "percentSpecialEducation": round_metric(weighted_average([district["enrollment"] for district in districts], "percentSpecialEducation")),
                "percentELL": round_metric(weighted_average([district["enrollment"] for district in districts], "percentELL")),
                "percentWhite": round_metric(weighted_average([district["enrollment"] for district in districts], "percentWhite")),
                "percentBlack": round_metric(weighted_average([district["enrollment"] for district in districts], "percentBlack")),
                "percentHispanic": round_metric(weighted_average([district["enrollment"] for district in districts], "percentHispanic")),
            },
            "reportYear": report_year,
        },
        "districts": districts,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
