# Architecture

The site is a static site with no build tools or frameworks.

## Pages

- **`index.html`** — The main page. Loads the CSS, then `table.js`, `modal.js`, `show_image.js`, `config.js`, and `dev-menu.js`.
- **`images.html`** — Card-based image gallery. Loads `modal.js`, `images.js`, `config.js`, and `dev-menu.js`.
- **`about.html`** — About/essay page with citation linking. No JavaScript.
- **`info.html`** — Legacy dev info page (Dutch, outdated).

## Frontend Scripts

### `table.js` (index page only)

On page load it fetches `src/data/data.json`, filters out rows with no title, then:

1. Builds a sticky alphabet navigation bar from the first letters of all titles.
2. Renders an HTML table sorted alphabetically, with letter section headers.
3. Each row carries a `data-image-path` attribute with the cover image path and a `data-row` attribute with the full JSON data.
4. Real-time search filtering via the search input.
5. Optional row/column hover highlighting (toggled via `HOVER_HIGHLIGHT` in `table.js`).

### `modal.js` (shared, loaded on index + images pages)

The full-screen modal overlay for viewing an issue's images and metadata:

- **Open/close** — attaches a single modal element to the page; manages body scroll lock with scrollbar-width compensation.
- **Image navigation** — left/right arrow keys, ▼ triangle arrows, or click the image to advance. Shows peek images (previous/next) scaled down behind the main image.
- **Scroll animation** — scrolling down reveals a data panel; the image shrinks and fades as it scrolls. ▼/▲ indicators jump between image and data views.
- **Data panel** — displays title, issue, author(s), type, place, year, description, publisher, print details, and source.
- **Keyboard** — Escape closes, ←/→ cycle images, ↑/↓ scroll between image and data.

### `show_image.js` (index page only)

Uses a `MutationObserver` to wait for the table to render, then attaches:

- **Hover preview** — a small fixed-position thumbnail appears (bottom-left) after a 300ms delay.
- **Click handler** — opens the shared modal (`modal.js`) with the row's data.
- All rows are clickable, including those without images (shows "no image" in the modal).

### `images.js` (images page only)

Fetches `data.json` and renders a responsive card grid:

- Each card shows the cover image (first in the `IMAGE` array) or a "no image" placeholder.
- Clicking a card opens the shared modal (`modal.js`).
- Real-time search filtering.
- Cards have a hover lift effect.

### `config.js` (shared)

Global site configuration (`window.SITE_CONFIG`). Defaults are defined in the file and can be overridden via localStorage through the dev menu.

### `dev-menu.js` (shared)

A collapsible "dev" button in the bottom-right corner. Expands to show toggles that map to `SITE_CONFIG` keys. Settings persist across sessions via localStorage.

## Data

`src/data/data.json` is a flat JSON array of objects. Each entry has:

| Field            | Description                                      |
|------------------|--------------------------------------------------|
| `ID`             | Zero-padded row number (e.g. `0001`)             |
| `IMAGE`          | Array of image paths; first is the cover. Can be empty. |
| `TITLE`          | Publication title                                |
| `ISSUE NUMBER`   | Issue/volume number                              |
| `AUTHOR(S)`      | Author/editor names                              |
| `TYPE`           | Format (zine, magazine, book, etc.)              |
| `PLACE`          | Country/location                                 |
| `YEAR`           | Publication year                                 |
| `DESCRIPTION`    | Free-text description                            |
| `PUBLISHER`      | Publisher name                                   |
| `PRINT DETAILS`  | Physical/print specs                             |
| `SOURCE`         | Source/reference URL or citation                 |

The table hides `ID`, `IMAGE`, `DESCRIPTION`, and `SOURCE` columns from the display. These are only shown in the modal.

### Images

`IMAGE` is an array. Entries with multiple images (e.g. a zine with several pages scanned) list all file paths. The first image is always the cover and is used for thumbnails and card views. All images are viewable in the modal by cycling with arrows or keyboard.

Image filenames in `src/img/` are grouped by base name (everything before the last `-N`). For example, `bikini_kill_1-1.png`, `bikini_kill_1-2.png`, `bikini_kill_1-3.png` are three pages of the same issue.

## Styles

`src/css/style.css` uses CSS custom properties for theming. Change the `--main-color-*` variables to restyle the entire site.

- Custom fonts via `@font-face` (Amiamie for body, Doto Rounded for headings).
- Sticky header and alphabet nav using `position: sticky` and a CSS variable (`--alphabet-nav-height`) for offset.
- Modal overlay with sticky image section and scrolling data panel.
- Peek images (prev/next) positioned behind the main modal image.
- Navigation arrows use rotated `▼` characters to match the scroll indicator style.
- Mobile breakpoint at 850px.
