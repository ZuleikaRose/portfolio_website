// Renders the generated assets from their HTML sources in assets/src/:
//   assets/og-image.png            1200x630 social sharing card
//   assets/Alice-Millage-Resume.pdf  US Letter résumé
// Needs Playwright with Chromium. It isn't a dependency of this static site; point NODE_PATH at any
// install, e.g. NODE_PATH=/path/to/project/node_modules node scripts/render-assets.cjs
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const src = (f) => 'file://' + path.join(root, 'assets', 'src', f);
const out = (f) => path.join(root, 'assets', f);

(async () => {
  const browser = await chromium.launch();
  try {
    const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await og.goto(src('og-image.html'), { waitUntil: 'networkidle' });
    await og.screenshot({ path: out('og-image.png') });

    const cv = await browser.newPage();
    await cv.goto(src('resume.html'), { waitUntil: 'networkidle' });
    await cv.pdf({ path: out('Alice-Millage-Resume.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
    console.log('Rendered og-image.png and Alice-Millage-Resume.pdf');
  } finally {
    await browser.close();
  }
})();
