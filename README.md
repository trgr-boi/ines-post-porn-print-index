# Post Porn Print Index

A static website that presents a browsable, alphabetically organized index of print publications (zines, magazines, books, etc.). Inspired by classic directory-index pages.

**Live site:** [ines-list.trgr.site](https://ines-list.trgr.site)

## Quick Start

No build step required — it's plain HTML/CSS/JS.

1. Clone the repo
2. Open `index.html` in a browser, or serve it locally:
   ```bash
   python3 -m http.server 8000
   ```
3. Visit `http://localhost:8000`

## Project Overview

```
.
├── index.html                # Main page (loads the table)
├── images.html               # Image gallery page (card grid)
├── about.html                # About/essay page
├── info.html                 # Legacy dev info (outdated)
├── CNAME                     # Custom domain for GitHub Pages
├── helpers/
│   └── tsv_to_json.py        # Converts the source TSV to data.json
├── src/
│   ├── css/style.css         # All styles (CSS custom properties for theming)
│   ├── data/data.json        # The indexed data (generated from TSV)
│   ├── fonts/                # Custom fonts (Amiamie, Doto Rounded)
│   ├── img/                  # Thumbnail images
│   ├── js/
│   │   ├── modal.js          # Shared modal (images + metadata overlay)
│   │   ├── table.js          # Renders the index table from JSON
│   │   ├── show_image.js     # Hover preview + opens modal (index page)
│   │   ├── images.js         # Card grid + search (images page)
│   │   ├── config.js         # Global site config (defaults + localStorage)
│   │   └── dev-menu.js       # Dev settings panel (bottom-right)
│   └── tsv/                  # Source TSV data
└── .github/workflows/
    └── jekyll-gh-pages.yml   # Deploys to GitHub Pages on push to main
```

## How It Works

1. **Source data** lives in `src/tsv/` as a TSV spreadsheet.
2. Run `helpers/tsv_to_json.py` to convert it into `src/data/data.json`. Images in `src/img/` are auto-discovered and grouped by filename.
3. The frontend (`table.js`) fetches `data.json` and renders an alphabetically sorted, sectioned HTML table.
4. Each row shows a hover preview and opens a full-screen modal on click (`modal.js`).
5. The images page (`images.js`) shows a card grid with the same modal.
6. A sticky alphabet navigation bar lets you jump to any letter.
7. Pushing to `main` triggers a GitHub Actions workflow that deploys to GitHub Pages.

## Data Pipeline

```bash
# Convert the source TSV into the JSON the frontend uses
python3 helpers/tsv_to_json.py
```

Each entry gets a zero-padded ID (e.g. `0001`). Images are auto-discovered from `src/img/` and grouped into arrays. The `bron?` column maps to `SOURCE`.

## Adding New Entries

1. Add rows to the TSV in `src/tsv/`.
2. Add images to `src/img/` named `<base>-1.<ext>`, `<base>-2.<ext>`, etc.
3. Re-run the conversion script.
4. Commit and push — the site redeploys automatically.

## Docs

More details are in the [`docs/`](docs/) directory.
