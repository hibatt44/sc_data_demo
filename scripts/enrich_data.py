#!/usr/bin/env python3
"""
Enrich sc-education-data.json with superintendent names and school mascots
scraped from public sources (SCASA, sciway.net).
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "generated" / "sc-education-data.json"

# ── Superintendent data (SCASA directory, March 2026) ───────────────────────────
# Format: partial district name → (name, title_prefix)
# We match by checking if the key appears in the district name (case-insensitive)
SUPERINTENDENTS: dict[str, str] = {
    "abbeville": "Dr. Lori Brownlee-Brewton",
    "aiken": "Dr. Corey Murphy",
    "allendale": "Dr. Vallerie Cave",
    "anderson 1": "Dr. Seth Young",
    "anderson 2": "Mr. Jason Johns",
    "anderson 3": "Mrs. Kathy Hipp",
    "anderson 4": "Mr. Dee Christopher",
    "anderson 5": "Dr. Brenda Kelley",
    "bamberg": "Mr. Denny Ulmer",
    "barnwell": "Dr. Crystal Stapleton",
    "beaufort": "Dr. Frank Rodriguez",
    "berkeley": "Dr. Anthony Dixon",
    "calhoun": "Dr. Ferlondo Tullock",
    "charleston": "Ms. Anita Huggins",
    "cherokee": "Dr. Raashad Fitzpatrick",
    "chester": "Mrs. Tammy Snipes",
    "chesterfield": "Dr. Christopher Ballenger",
    "clarendon": "Dr. Shawn Johnson",
    "colleton": "Mrs. Jessica Williams",
    "darlington": "Dr. Matthew Ferguson",
    "dillon 3": "Mrs. Stephanie Ard",
    "dillon 4": "Mr. Douglas R. Rogers",
    "dorchester 2": "Mr. Chad Daugherty",
    "dorchester 4": "Mr. Jeff Beckwith",
    "edgefield": "Dr. Kevin O'Gorman",
    "fairfield": "Mr. Alvin Pressley",
    "florence 1": "Dr. Richard O'Malley",
    "florence 2": "Dr. Neal Vincent",
    "florence 3": "Mrs. Kasey Feagin",
    "florence 5": "Mr. Brian Goins",
    "georgetown": "Dr. Bethany Giles",
    "greenville": "Dr. W. Burke Royster",
    "greenwood 50": "Mr. Shane Goodwin",
    "greenwood 51": "Dr. Daniel Crockett",
    "greenwood 52": "Dr. Beth Taylor",
    "hampton": "Dr. Glenda Sheffield",
    "horry": "Mr. Cliff Jones",
    "jasper": "Dr. Laura Hickson",
    "kershaw": "Dr. Harrison Goodwin",
    "lancaster": "Dr. Norris Williams",
    "laurens 55": "Dr. Jody Penland",
    "laurens 56": "Dr. David O'Shields",
    "lee": "Mr. Bernard McDaniel",
    "lexington 1": "Dr. Keith Price",
    "lexington 2": "Dr. Brenda Hafner",
    "lexington 3": "Dr. Ashley Atkinson",
    "lexington 4": "Dr. Justin Nutter",
    "lexington.*richland": "Dr. Akil Ross",
    "marion": "Dr. Kandace Bethea",
    "marlboro": "Dr. Michael Thorsland",
    "mccormick": "Dr. Jaime Hembree",
    "newberry": "Dr. Chan Anderson",
    "oconee": "Mr. Andy Smith",
    "orangeburg": "Dr. Shawn Foster",
    "pickens": "Dr. Daniel Merck",
    "richland 1": "Dr. Todd Walker",
    "richland 2": "Dr. Kim Moore",
    "saluda": "Dr. Harvey Livingston",
    "spartanburg 1": "Dr. Mark Smith",
    "spartanburg 2": "Dr. Tim Newman",
    "spartanburg 3": "Dr. Julie Fowler",
    "spartanburg 4": "Dr. Aaron Fulmer",
    "spartanburg 5": "Dr. Randall Gary",
    "spartanburg 6": "Mr. Ken Kiser",
    "spartanburg 7": "Mr. Jeff Stevens",
    "sumter": "Dr. Shirley Gamble",
    "union": "Mr. Joey Haney",
    "williamsburg": "Dr. Angela Jacobs",
    "york 1": "Dr. Heath Branham",
    "york 2": "Dr. Sheila Quinn",
    "york 3": "Dr. Deborah Elder",
    "york 4": "Mr. Grey Young",
    # Alternate district name forms
    "clover": "Dr. Sheila Quinn",
    "fort mill": "Mr. Grey Young",
    "rock hill": "Dr. Deborah Elder",
    "charter institute": "Mr. Cameron Runyan",
    "limestone charter": "Mrs. Angel Malone",
    "palmetto unified": "Dr. Beverly Holiday",
    "juvenile justice": "Mr. Floyd Lyles",
    "public charter school district": "Mr. Chris Neeley",
    "deaf and": "Ms. Jolene Madison",
}

# ── Mascot data (sciway.net, high schools) ──────────────────────────────────────
# Key: normalized school name fragment → mascot
MASCOTS: dict[str, str] = {
    "a.c. flora": "Falcons",
    "a c flora": "Falcons",
    "ac flora": "Falcons",
    "academic magnet": "Raptors",
    "airport high": "Eagles",
    "andrew jackson": "Volunteers",
    "aynor": "Blue Jackets",
    "batesburg-leesville": "Panthers",
    "battery creek": "Dolphins",
    "beaufort high": "Eagles",
    "berea high": "Bulldogs",
    "berkeley high": "Stags",
    "brookland-cayce": "Bearcats",
    "byrnes": "Rebels",
    "c.a. johnson": "Hornets",
    "ca johnson": "Hornets",
    "camden high": "Bulldogs",
    "carolina forest": "Panthers",
    "carolina high": "Trojans",
    "chapin high": "Eagles",
    "chapman high": "Panthers",
    "chester high": "Cyclones",
    "chesterfield high": "Golden Rams",
    "clinton high": "Red Devils",
    "clover high": "Blue Eagles",
    "colleton county high": "Cougars",
    "columbia high": "Capitals",
    "conway high": "Tigers",
    "crescent high": "Tigers",
    "daniel high": "Lions",
    "darlington high": "Falcons",
    "dillon high": "Wildcats",
    "dorman high": "Cavaliers",
    "dreher high": "Blue Devils",
    "dutch fork": "Silver Foxes",
    "easley high": "Green Wave",
    "eastside high": "Eagles",
    "eau claire": "Shamrocks",
    "emerald high": "Vikings",
    "fort mill high": "Yellow Jackets",
    "gaffney": "Indians",
    "gilbert high": "Indians",
    "goose creek high": "Gators",
    "gray collegiate": "War Eagles",
    "great falls": "Red Devils",
    "green sea floyds": "Trojans",
    "greenwood high": "Eagles",
    "hartsville high": "Red Foxes",
    "hilton head": "Seahawks",
    "irmo high": "Yellow Jackets",
    "james island": "Trojans",
    "lancaster high": "Bruins",
    "laurens high": "Raiders",
    "lexington high": "Wildcats",
    "liberty high": "Red Devils",
    "loris high": "Lions",
    "lower richland": "Diamond Hornets",
    "lugoff-elgin": "Demons",
    "marlboro county high": "Bulldogs",
    "mauldin high": "Mavericks",
    "mccormick high": "Chiefs",
    "mullins high": "Auctioneers",
    "myrtle beach high": "Seahawks",
    "nation ford": "Falcons",
    "newberry high": "Bulldogs",
    "ninety six": "Wildcats",
    "north augusta": "Yellow Jackets",
    "north charleston high": "Cougars",
    "north myrtle beach": "Chiefs",
    "northwestern high": "Trojans",
    "palmetto high": "Mustangs",
    "pelion high": "Panthers",
    "pickens high": "Blue Flame",
    "richland northeast": "Cavaliers",
    "ridge view": "Blazers",
    "river bluff": "Gators",
    "rock hill high": "Bearcats",
    "saluda high": "Tigers",
    "seneca high": "Bobcats",
    "socastee": "Braves",
    "south aiken": "Thoroughbreds",
    "south florence": "Bruins",
    "spartanburg high": "Vikings",
    "spring valley": "Vikings",
    "stall high": "Warriors",
    "stratford high": "Knights",
    "strom thurmond": "Rebels",
    "summerville high": "Green Wave",
    "sumter high": "Gamecocks",
    "swansea high": "Tigers",
    "t.l. hanna": "Yellow Jackets",
    "tl hanna": "Yellow Jackets",
    "travelers rest": "Devildogs",
    "union county high": "Yellow Jackets",
    "wade hampton": "Cadets",
    "wagener-salley": "War Eagles",
    "walhalla high": "Razorbacks",
    "wando high": "Warriors",
    "west-oak": "Warriors",
    "westside high": "Rams",
    "white knoll": "Timberwolves",
    "woodmont high": "Wildcats",
    "wren high": "Hurricanes",
    "york comprehensive": "Cougars",
    # Common alternate names
    "abbeville high": "Panthers",
    "aiken high": "Hornets",
    "bluffton high": "Bobcats",
    "boiling springs high": "Bulldogs",
    "broome high": "Centurions",
    "cane bay high": "Cobras",
    "catawba ridge": "Copperheads",
    "cherokee trail": "Braves",
    "cheraw high": "Braves",
    "crestwood high": "Knights",
    "cross high": "Trojans",
    "edisto high": "Cougars",
    "fairfield central": "Griffins",
    "fort dorchester": "Patriots",
    "hanahan high": "Hawks",
    "indian land high": "Warriors",
    "j.l. mann": "Patriots",
    "jl mann": "Patriots",
    "keenan high": "Raiders",
    "lake city high": "Panthers",
    "lake marion high": "Gators",
    "lakewood high": "Gators",
    "landrum high": "Cardinals",
    "manning high": "Monarchs",
    "marion high": "Swamp Foxes",
    "mid-carolina": "Rebels",
    "oceanside collegiate": "Landsharks",
    "orangeburg-wilkinson": "Bruins",
    "phillip simmons": "Iron Horses",
    "south pointe high": "Stallions",
    "southside high": "Tigers",
    "timberland high": "Wolves",
    "west florence": "Knights",
    "westwood high": "Redhawks",
    "woodruff high": "Wolverines",
    # From wistv.com comprehensive SCHSL list
    "dixie high": "Hornets",
    "allendale-fairfax high": "Tigers",
    "allendale fairfax high": "Tigers",
    "andrews high": "Yellow Jackets",
    "ashley ridge": "Swamp Foxes",
    "bamberg-ehrhardt": "Red Raiders",
    "bamberg ehrhardt": "Red Raiders",
    "baptist hill": "Bobcats",
    "barnwell high": "Warhorses",
    "belton-honea path": "Bears",
    "belton honea path": "Bears",
    "bethune-bowman": "Mohawks",
    "bethune bowman": "Mohawks",
    "blacksburg high": "Wildcats",
    "blackville": "Fighting Hawks",
    "blue ridge high": "Fighting Tigers",
    "blythewood high": "Bengals",
    "branchville high": "Yellow Jackets",
    "buford high": "Yellow Jackets",
    "burke high": "Bulldogs",
    "calhoun county high": "Saints",
    "carvers bay": "Bears",
    "central high": "Eagles",
    "chesnee high": "Eagles",
    "coastal high": "Cougars",
    "denmark-olar": "Vikings",
    "denmark olar": "Vikings",
    "east clarendon": "Wolverines",
    "fox creek": "Predators",
    "georgetown high": "Bulldogs",
    "greenville senior high": "Red Raiders",
    "greenville tech": "Warriors",
    "greer high": "Yellow Jackets",
    "greer middle college": "Blazers",
    "hampton county high": "Devils",
    "hannah-pamplico": "Raiders",
    "hannah pamplico": "Raiders",
    "hardeeville": "Hurricanes",
    "hemingway high": "Tigers",
    "hillcrest high": "Rams",
    "hunter-kinard-tyler": "Trojans",
    "hunter kinard tyler": "Trojans",
    "j. l. mann": "Patriots",
    "j l mann": "Patriots",
    "johnsonville high": "Flashes",
    "kingstree high": "Jaguars",
    "lake city early college": "Panthers",
    "lake view high": "Wild Gators",
    "lamar high": "Silver Foxes",
    "latta high": "Vikings",
    "laurens district 55 high": "Raiders",
    "lee central": "Stallions",
    "lewisville high": "Lions",
    "lucy garrett beckham": "Bengals",
    "manning": "Monarchs",
    "may river high": "Sharks",
    "mcbee high": "Panthers",
    "midland valley high": "Mustangs",
    "north central high": "Knights",
    "north high": "Eagles",
    "orangeburg high": "Bruins",
    "pendleton high": "Bulldogs",
    "philip simmons high": "Iron Horses",
    "powdersville high": "Patriots",
    "ridge spring-monetta": "Trojans",
    "ridge spring monetta": "Trojans",
    "riverside high": "Warriors",
    "scotts branch": "Eagles",
    "scott's branch": "Eagles",
    "silver bluff": "Bulldogs",
    "spring hill high": "Bears",
    "st. james high": "Sharks",
    "st james high": "Sharks",
    "st. john's high": "Islanders",
    "st johns high": "Islanders",
    "t. l. hanna": "Yellow Jackets",
    "waccamaw high": "Warriors",
    "ware shoals": "Fighting Hornets",
    "west ashley high": "Wildcats",
    "west florence": "Knights",
    "whale branch": "Warriors",
    "williston-elko": "Blue Devils",
    "williston elko": "Blue Devils",
    "wilson high": "Tigers",
    "woodland high": "Wolverines",
}


WORD_TO_NUM = {
    "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
    "six": "6", "seven": "7", "eight": "8", "nine": "9",
}


def normalize(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s-]", "", text.lower())).strip()


def normalize_district(name: str) -> str:
    """Normalize district name: lowercase, convert word-numbers to digits, strip filler."""
    n = name.lower()
    for word, digit in WORD_TO_NUM.items():
        n = re.sub(rf"\b{word}\b", digit, n)
    # Remove common filler words
    n = re.sub(r"\b(county|school|district|public|schools|of|the)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def match_superintendent(district_name: str) -> "str | None":
    """Try to match a district name to a superintendent."""
    name_lower = district_name.lower()
    name_norm = normalize_district(district_name)
    # Sort by key length descending so "chesterfield" matches before "chester",
    # "dorchester 2" before "chester", etc.
    for pattern in sorted(SUPERINTENDENTS.keys(), key=len, reverse=True):
        supt = SUPERINTENDENTS[pattern]
        if ".*" in pattern:
            if re.search(pattern, name_lower) or re.search(pattern, name_norm):
                return supt
        else:
            # Use word boundary matching to prevent "chester" matching "dorchester"
            pat = re.escape(pattern)
            if re.search(rf"(?:^|[\s/])({pat})", name_lower) or re.search(rf"(?:^|[\s/])({pat})", name_norm):
                return supt
    return None


def match_mascot(school_name: str) -> "str | None":
    """Try to match a school name to a mascot."""
    name_norm = normalize(school_name)
    # Try longest keys first for specificity
    for key in sorted(MASCOTS.keys(), key=len, reverse=True):
        if key in name_norm:
            return MASCOTS[key]
    return None


import hashlib

# ── Fake principal/email generation ─────────────────────────────────────────────
# Deterministic fake names seeded by school ID so they're stable across runs.

FAKE_FIRST_M = [
    "James", "Robert", "Michael", "William", "David", "Richard", "Joseph",
    "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
    "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin",
    "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey",
    "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen",
]
FAKE_FIRST_F = [
    "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica",
    "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra",
    "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda",
    "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura",
    "Cynthia", "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda",
]

FAKE_LAST = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Evans", "Turner", "Phillips", "Parker", "Edwards",
    "Collins", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan",
    "Peterson", "Cooper", "Reed", "Bailey", "Bell", "Howard", "Ward",
]


def fake_principal(school_id: str) -> tuple[str, str]:
    """Generate a deterministic fake name + email from school ID."""
    h = int(hashlib.md5(school_id.encode()).hexdigest(), 16)
    is_female = (h >> 4) % 2 == 0
    if h % 3 == 0:
        prefix = "Dr."
        first = (FAKE_FIRST_F if is_female else FAKE_FIRST_M)[h % len(FAKE_FIRST_F)]
    elif is_female:
        prefix = "Ms."
        first = FAKE_FIRST_F[h % len(FAKE_FIRST_F)]
    else:
        prefix = "Mr."
        first = FAKE_FIRST_M[h % len(FAKE_FIRST_M)]
    last = FAKE_LAST[(h >> 8) % len(FAKE_LAST)]
    name = f"{prefix} {first} {last} (demo)"
    email = f"{first.lower()}.{last.lower()}@example.edu (demo)"
    return name, email


def fake_supt_email(district_name: str, supt_name: str) -> str:
    """Generate a fake email for a real superintendent."""
    parts = supt_name.replace("Dr. ", "").replace("Mr. ", "").replace("Mrs. ", "").replace("Ms. ", "").split()
    if len(parts) >= 2:
        first = re.sub(r"[^a-z]", "", parts[0].lower())
        last = re.sub(r"[^a-z]", "", parts[-1].lower())
        # Build domain slug from district name
        slug = normalize(district_name)
        slug = re.sub(r"\b(county|school|district|public|schools|of|the)\b", " ", slug)
        slug = re.sub(r"\s+", "", slug).strip()
        slug = re.sub(r"[^a-z0-9]", "", slug)
        if not slug:
            slug = "district"
        return f"{first}.{last}@{slug}.k12.sc.us (demo)"
    return ""


def main() -> None:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    supt_matched = 0
    mascot_matched = 0
    principal_count = 0
    total_schools = 0

    for district in data["districts"]:
        # Match superintendent
        supt = match_superintendent(district["name"])
        if supt:
            district["superintendentName"] = supt
            district["superintendentEmail"] = fake_supt_email(district["name"], supt)
            supt_matched += 1

        # Pass 1: Match mascots directly for all schools
        for school in district["schools"]:
            total_schools += 1
            mascot = match_mascot(school["name"])
            if mascot:
                school["mascot"] = mascot
                mascot_matched += 1

        # Pass 2: Inherit mascots for middle/elementary schools from matched
        # high schools in the same district that share a location prefix.
        # E.g., "North Augusta High" → "North Augusta Middle", "North Augusta Elementary"
        matched_schools = {s["name"]: s["mascot"] for s in district["schools"] if s.get("mascot")}
        if matched_schools:
            # Build prefix → mascot map from matched high schools
            prefix_mascot = {}
            for sname, mascot in matched_schools.items():
                # Strip school type suffixes to get location prefix
                prefix = re.sub(
                    r"\s+(high|middle|elementary|primary|intermediate|junior|senior|"
                    r"ms|es|hs|academy|school|of.*$).*$",
                    "", sname, flags=re.IGNORECASE
                ).strip()
                if len(prefix) >= 4:  # Avoid very short prefixes
                    prefix_mascot[prefix.lower()] = mascot

            for school in district["schools"]:
                if not school.get("mascot") and prefix_mascot:
                    sname_clean = re.sub(
                        r"\s+(high|middle|elementary|primary|intermediate|junior|senior|"
                        r"ms|es|hs|academy|school|of.*$).*$",
                        "", school["name"], flags=re.IGNORECASE
                    ).strip().lower()
                    if sname_clean in prefix_mascot:
                        school["mascot"] = prefix_mascot[sname_clean]
                        mascot_matched += 1

        # Generate fake principals for all schools
        for school in district["schools"]:
            pname, pemail = fake_principal(school["id"])
            school["principalName"] = pname
            school["principalEmail"] = pemail
            principal_count += 1

    DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")

    print(f"Superintendents: {supt_matched}/{len(data['districts'])} matched")
    print(f"Mascots: {mascot_matched}/{total_schools} matched")
    print(f"Principals (demo): {principal_count}/{total_schools}")
    print(f"Wrote {DATA_FILE}")


if __name__ == "__main__":
    main()
