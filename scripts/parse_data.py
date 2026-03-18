#!/usr/bin/env python3

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_XLSX = ROOT / "data" / "raw" / "ReportCardData_forResearchers2024_11.xlsx"
OUT_JSON = ROOT / "data" / "generated" / "sc-education-data.json"
SEARCH_INDEX = ROOT / "public" / "search-index.json"


def write_search_index() -> None:
    payload = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    search_entities = []

    for district in payload["districts"]:
        search_entities.append({
            "id": district["id"],
            "name": district["name"],
            "slug": district["slug"],
            "type": "district",
            "rating": district["rating"],
        })
        for school in district["schools"]:
            search_entities.append({
                "id": school["id"],
                "name": school["name"],
                "slug": school["slug"],
                "type": "school",
                "districtName": district["name"],
                "rating": school["rating"],
            })

    SEARCH_INDEX.parent.mkdir(parents=True, exist_ok=True)
    SEARCH_INDEX.write_text(json.dumps(search_entities), encoding="utf-8")
    print(f"Wrote {len(payload['districts'])} districts, {payload['stateOverview']['totalSchools']} schools")


def enrich() -> None:
    """Run the enrichment script to add superintendent, principal, mascot data."""
    enrich_script = ROOT / "scripts" / "enrich_data.py"
    if enrich_script.exists() and OUT_JSON.exists():
        subprocess.run([sys.executable, str(enrich_script)], check=True)


def main() -> None:
    if RAW_XLSX.exists():
        subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "parse_report_card_xlsx.py"), str(RAW_XLSX), str(OUT_JSON)],
            check=True,
        )
        enrich()
        write_search_index()
        return

    if OUT_JSON.exists():
        enrich()
        write_search_index()
        return

    raise SystemExit("No report-card workbook found and no generated JSON exists.")


if __name__ == "__main__":
    main()
