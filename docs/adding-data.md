# Adding Data

## Steps

1. **Edit the source TSV** at `src/tsv/a_post_porn_art_index_original.tsv`.
   - Each row is a publication. The columns must match the expected headers (TITLE, ISSUE N°, AUTHOR(S), TYPE, PLACE, YEAR, DESCRIPTION, PUBLISHER, PRINT DETAILS, bron?).
   - The first column in the TSV (`IMAGE`) is ignored by the conversion script — images are auto-discovered from the file system.
   - The `bron?` column maps to the `SOURCE` field in the JSON.

2. **Add images** to `src/img/`.
   - Name files with a base name and page number: `<base>-1.jpg`, `<base>-2.jpg`, etc. (e.g. `bikini_kill_1-1.png`, `bikini_kill_1-2.png`).
   - The conversion script auto-discovers all images belonging to the same issue by grouping on the base name (everything before the last `-N`).
   - The first image (`-1`) is always the cover.
   - Supported formats: `.jpg`, `.png`, `.jpeg`, `.webp`.

3. **Run the conversion script**:
   ```bash
   python3 helpers/tsv_to_json.py
   ```
   This reads the TSV, scans `src/img/` for matching images, and writes `src/data/data.json`. It:
   - Skips empty rows.
   - Auto-assigns sequential zero-padded IDs.
   - Groups images by base name into arrays (first = cover).
   - Backs up the previous `data.json` as `data-<date>.json.bak`.
   - Maps the TSV's `bron?` column to the `SOURCE` field.

4. **Commit and push** to `main` — the site redeploys automatically.

## Notes

- IDs are re-generated every time the script runs based on row order. If you insert a row in the middle, all subsequent IDs shift.
- Empty rows (where all fields are blank) are skipped.
- Entries without images get an empty `IMAGE` array (`[]`). They still appear in the table and gallery with a "no image" placeholder.
- To manually set specific images for an entry, edit the `IMAGE` array in `data.json` after running the script (note: re-running will overwrite manual edits).
