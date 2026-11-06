const fs = require('fs');
const path = require('path');
const P = require('../js/projects.js');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html').replace(/<!--[\s\S]*?-->/g, '');

describe('project notes', () => {
  test('a liveNote only appears on a project with a live link', () => {
    P.projects.filter((p) => p.liveNote).forEach((p) => expect(p.live).toMatch(/^https:\/\//));
  });
});

describe('index.html metadata', () => {
  test('has a canonical URL and social sharing image', () => {
    expect(html).toContain('<link rel="canonical" href="https://www.alicemillage.cv/">');
    expect(html).toContain('property="og:image" content="https://www.alicemillage.cv/assets/og-image.png"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  test('its JSON-LD is valid JSON describing a Person', () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const data = JSON.parse(json);
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Alice Millage');
  });

  test('every local asset it links to exists', () => {
    const refs = [...html.matchAll(/(?:href|src)="((?:assets|css|js)\/[^"]+)"/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((r) => expect(fs.existsSync(path.join(root, r))).toBe(true));
  });
});

describe('SEO files', () => {
  test('robots.txt points at the sitemap', () => {
    expect(read('robots.txt')).toContain('Sitemap: https://www.alicemillage.cv/sitemap.xml');
  });

  test('sitemap lists the home page', () => {
    expect(read('sitemap.xml')).toContain('<loc>https://www.alicemillage.cv/</loc>');
  });

  test('there is a custom 404 page', () => {
    expect(read('404.html')).toContain('Page not found');
  });
});

describe('education', () => {
  test('lists Code Platoon and Post University with their details', () => {
    const cp = P.education.find((e) => e.school === 'Code Platoon');
    expect(cp).toMatchObject({ program: 'AI Full-Stack Software Engineer', year: 2027 });
    expect(cp.details.join(' ')).toMatch(/Python, Django, React and PostgreSQL/);
    expect(cp.details).toContain('Project: LiteraryWorm');
    const post = P.education.find((e) => e.school === 'Post University');
    expect(post).toMatchObject({ program: 'Computer and Information Science, General', year: 2024 });
    expect(post.details).toContain('128+ credits');
    expect(html).toContain('id="edu-list"');
  });

  test('LiteraryWorm is listed as a project', () => {
    expect(P.projects.some((p) => p.title === 'LiteraryWorm')).toBe(true);
  });

  test('the résumé source has the Education entries and no photo', () => {
    const resume = read('assets/src/resume.html');
    expect(resume).toContain('<h2>Education</h2>');
    expect(resume).toContain('Post University');
    expect(resume).toContain('128+ credits');
    expect(resume).toContain('AI Full-Stack Software Engineer');
    expect(resume).not.toMatch(/<img\b/);
    expect(resume).not.toContain('120+');
  });
});
