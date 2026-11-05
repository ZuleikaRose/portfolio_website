# Alice Millage · Portfolio

Personal portfolio at **https://www.alicemillage.cv**: About, Projects, Experience, Skills & Certifications and Contact.
A static site (HTML, CSS and vanilla JavaScript), hosted on Vercel (team `zuleika-llc`, project `portfolio-website`).
Every push to `main` deploys production.

## Run it locally

```bash
npm install
npm start        # http://localhost:5500
npm test         # Jest: project data, page metadata, SEO files
```

## Where things live

| Path | What |
| --- | --- |
| `index.html` | The page, with sharing (Open Graph/Twitter) tags and JSON-LD for search |
| `js/projects.js` | All content: projects, experience, skills, certifications, brands. Edit text here |
| `js/main.js` | Rendering, filters, theme, animations, contact form |
| `css/styles.css` | Styles, light and dark themes |
| `404.html`, `robots.txt`, `sitemap.xml` | Custom not-found page and search engine files |
| `assets/og-image.png` | 1200×630 link preview image |
| `assets/Alice-Millage-Resume.pdf` | Downloadable résumé |
| `assets/src/` | HTML sources for the two files above |
| `scripts/render-assets.cjs` | Re-renders them with Playwright |
| `.github/workflows/ci.yml` | Runs the Jest tests on every push and pull request |

## Updating the résumé or preview image

Edit `assets/src/resume.html` or `assets/src/og-image.html`, then re-render with any Playwright install:

```bash
NODE_PATH=/path/to/a/project/node_modules node scripts/render-assets.cjs
```

Keep the résumé in step with `js/projects.js`, and update `<lastmod>` in `sitemap.xml`.

## Notes

- **Analytics:** Vercel Web Analytics (cookieless) is enabled for the project; the page loads its script only on
  `alicemillage.cv`. View it in the Vercel dashboard → portfolio-website → Analytics.
- **NetBox link:** `liveNote` in `js/projects.js` marks the NetBox demo as under Google Safe Browsing review. Remove
  it once the review clears.
- **Photo:** the About card shows an "AM" monogram. To use a photo, save it as `assets/profile.jpg` and follow the
  comment above `.portrait` in `index.html`.
