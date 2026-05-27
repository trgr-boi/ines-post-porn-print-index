#!/usr/bin/env python3
"""
Usage:
    python helpers/tsv_to_json.py

Converts the TSV source file into the JSON data file used by the site.

    Input:  src/tsv/a_post_porn_art_index_original.tsv
    Output: src/data/data.json

Each row is mapped to a JSON object with the following fields:
    ID, IMAGE, TITLE, ISSUE NUMBER, AUTHOR(S), TYPE, PLACE, YEAR,
    DESCRIPTION, PUBLISHER, PRINT DETAILS

IDs are auto-generated (0001, 0002, …).

IMAGE is an array of paths to thumbnails in src/img/. The script auto-discovers
all images belonging to the same issue by grouping files that share a base name
(the part before the last "-N" in the filename). The first image in the array
is always the cover. If no images match, IMAGE is an empty array.
"""
import csv
import json
import os
import re
import shutil
from collections import defaultdict
from datetime import date
from pathlib import Path

INPUT_PATH = Path("src/tsv/a_post_porn_art_index_original.tsv")
OUTPUT_PATH = Path("src/data/data.json")
IMG_DIR = Path("src/img")

FIELDS = [
    "ID",
    "IMAGE",
    "TITLE",
    "ISSUE NUMBER",
    "AUTHOR(S)",
    "TYPE",
    "PLACE",
    "YEAR",
    "DESCRIPTION",
    "PUBLISHER",
    "PRINT DETAILS",
]

TSV_COLUMNS = {
    "TITLE": "TITLE",
    "ISSUE NUMBER": "ISSUE N°",
    "AUTHOR(S)": "AUTHOR(S)",
    "TYPE": "TYPE",
    "PLACE": "PLACE",
    "YEAR": "YEAR",
    "DESCRIPTION": "DESCRIPTION",
    "PUBLISHER": "PUBLISHER",
    "PRINT DETAILS": "PRINT DETAILS",
}


def get_image_groups() -> dict[str, list[str]]:
    """Scan src/img/ and group files by base name (everything before the last '-N')."""
    groups: dict[str, list[str]] = defaultdict(list)
    if not IMG_DIR.exists():
        return groups
    for f in sorted(os.listdir(IMG_DIR)):
        full = IMG_DIR / f
        if not full.is_file():
            continue
        name, _ = os.path.splitext(f)
        parts = name.rsplit("-", 1)
        if len(parts) == 2 and parts[1].isdigit():
            base = parts[0]
        else:
            base = name
        groups[base].append(f"src/img/{f}")
    # Sort each group so -1 comes before -2, etc. (numeric sort on page number)
    for base in groups:
        groups[base].sort(key=_sort_key)
    return groups


def _sort_key(path: str) -> list:
    """Sort by base name then page number numerically."""
    filename = os.path.basename(path)
    name, _ = os.path.splitext(filename)
    parts = name.rsplit("-", 1)
    if len(parts) == 2 and parts[1].isdigit():
        return [parts[0], int(parts[1])]
    return [name, 0]


def find_images_for_entry(
    entry: dict, image_groups: dict[str, list[str]]
) -> list[str]:
    """Find all images belonging to this entry.

    Uses the existing IMAGE field if present to determine the base name,
    otherwise tries to match by filename pattern.
    """
    existing = entry.get("IMAGE", "")
    if isinstance(existing, list):
        if existing:
            # Already migrated — re-resolve from first image
            return _resolve_group(existing[0], image_groups)
        return []
    if isinstance(existing, str) and existing and existing != "/todo":
        return _resolve_group(existing, image_groups)
    return []


def _resolve_group(image_path: str, image_groups: dict[str, list[str]]) -> list[str]:
    """Given one image path, find all siblings in the same group."""
    filename = os.path.basename(image_path)
    name, _ = os.path.splitext(filename)
    parts = name.rsplit("-", 1)
    if len(parts) == 2 and parts[1].isdigit():
        base = parts[0]
    else:
        base = name
    return image_groups.get(base, [image_path] if image_path else [])


def main() -> None:
    if not INPUT_PATH.exists():
        raise SystemExit(f"Input file not found: {INPUT_PATH}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    if OUTPUT_PATH.exists():
        backup = OUTPUT_PATH.with_name(f"data-{date.today()}.json.bak")
        shutil.copy2(OUTPUT_PATH, backup)
        print(f"Backed up existing file to {backup}")

    image_groups = get_image_groups()
    print(f"Found {len(image_groups)} image groups in {IMG_DIR}")

    with INPUT_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        headers = next(reader, [])
        if headers:
            headers = headers[1:]

        rows = []
        row_index = 0
        for values in reader:
            values = values[1:] if values else []
            raw_row = dict(zip(headers, values))
            item = {}
            for field in FIELDS:
                if field in ("ID", "IMAGE"):
                    continue
                tsv_key = TSV_COLUMNS[field]
                item[field] = (raw_row.get(tsv_key) or "").strip()
            if not any(item.values()):
                continue
            row_index += 1
            item["ID"] = f"{row_index:04d}"

            # Try to find images from the TSV IMAGE column or auto-discover
            raw_image = (raw_row.get("IMAGE") or "").strip()
            if raw_image:
                item["IMAGE"] = _resolve_group(raw_image, image_groups)
            else:
                item["IMAGE"] = []

            rows.append(item)

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(rows)} rows to {OUTPUT_PATH}")
    multi = sum(1 for r in rows if len(r["IMAGE"]) > 1)
    empty = sum(1 for r in rows if len(r["IMAGE"]) == 0)
    print(f"  {multi} entries with multiple images, {empty} entries with no images")


if __name__ == "__main__":
    main()
