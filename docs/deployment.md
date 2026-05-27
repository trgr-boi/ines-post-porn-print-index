# Deployment

The site is deployed to **GitHub Pages** automatically.

## How It Works

The workflow lives at `.github/workflows/jekyll-gh-pages.yml`. It:

1. Triggers on every push to `main` (also manually triggerable via the Actions tab).
2. Builds with Jekyll (standard GitHub Pages pipeline) and deploys the entire repo as a static site.
3. No actual Jekyll content is used — it just serves the static HTML/CSS/JS files.

## Custom Domain

The `CNAME` file in the repo root sets the custom domain to `ines-list.trgr.site`. DNS must be configured on the domain side to point to GitHub Pages.

## Updating the Site

Just commit and push to `main`. There is no build step — whatever is in the repo is what gets served.

## Local Development

No build step required — it's plain HTML/CSS/JS.

```bash
# Serve locally
python3 -m http.server 8000
# Visit http://localhost:8000
```
