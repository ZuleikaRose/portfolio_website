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

describe('experience timeline', () => {
  test('shows the first 5 roles before "Show full career history"', () => {
    expect(read('js/main.js')).toMatch(/const VISIBLE = 5;/);
    expect(P.experience.length).toBeGreaterThan(5);
  });
});

describe('index.html stats', () => {
  test('shows 3 companies founded & running', () => {
    expect(html).toMatch(/data-count="3">0<\/span><p>companies founded &amp; running<\/p>/);
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
    expect(cp).toMatchObject({ program: 'AI Full-Stack Software Engineer', dates: 'Oct 2026 – Jan 2027' });
    expect(cp.details).toContain('Python, Django, React, PostgreSQL, Supabase');
    expect(cp.details).toContain('Project: LiteraryWorm');
    const post = P.education.find((e) => e.school === 'Post University');
    expect(post).toMatchObject({ program: 'Computer and Information Sciences, General', dates: '2024' });
    expect(post.details).toContain('128+ credits');
    expect(html).toContain('id="edu-list"');
  });

  test('the résumé includes the LiteraryWorm AI role and project', () => {
    const resume = read('assets/src/resume.html');
    expect(resume).toContain('Owner of LiteraryWorm, LiteraryWorm AI and Zuleika LLC');
    expect(resume).toContain('Nov 2026 – Present · Chicago, IL</span></div>\n  <div class="org">LiteraryWorm AI — literaryworm.net</div>');
    expect(resume).toContain('Founded LiteraryWorm AI, an AI publishing dashboard that takes an ebook from idea to a live store listing.');
    expect(resume).toContain('Built the app with React, TypeScript and Vite on Supabase, deployed on Vercel: ChatGPT and Claude through one guarded Edge Function, Stripe billing, a chapter editor, outlining and EPUB 3 export.');
    expect(resume).toContain('Planned the product as 1,034 user stories across 17 build phases, tested with Jest, Playwright and axe in CI.');
    expect(resume).toContain('<li><b>LiteraryWorm AI</b> — React, TypeScript, Vite, Supabase, Vercel, Stripe, Claude API, OpenAI</li>');
  });

  test('the sharing image names LiteraryWorm AI', () => {
    expect(read('assets/src/og-image.html')).toContain('Owner of LiteraryWorm, LiteraryWorm AI &amp; Zuleika LLC');
  });

  test('the résumé contact line links literaryworm.net', () => {
    const contact = read('assets/src/resume.html').match(/<div class="contact">([\s\S]*?)<\/div>/)[1];
    expect(contact).toContain('<a href="https://literaryworm.net">literaryworm.net</a>');
  });

  test('Django is listed under Backend skills on the site and résumé', () => {
    expect(P.skills.Backend).toContain('Django');
    expect(read('assets/src/resume.html')).toMatch(/Back end &amp; data:<\/b>[^<]*Django/);
  });

  test('Docker is listed in skills, the résumé and the JSON-LD knowsAbout', () => {
    expect(P.skills['Cloud & DevOps']).toContain('Docker');
    expect(read('assets/src/resume.html')).toMatch(/Cloud &amp; quality:<\/b>[^<]*Docker/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    expect(ld.knowsAbout).toContain('Docker');
  });

  test('Python is in the résumé and the JSON-LD knowsAbout', () => {
    expect(read('assets/src/resume.html')).toMatch(/Back end &amp; data:<\/b>[^<]*Python/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    expect(ld.knowsAbout).toContain('Python');
  });

  test('CPA: Crypto Portfolio App lists Python on the site and résumé', () => {
    expect(P.projects.find((p) => p.title === 'CPA: Crypto Portfolio App').tags).toContain('Python');
    expect(read('assets/src/resume.html')).toMatch(/CPA: Crypto Portfolio App<\/b>[^<]*Python/);
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
    expect(resume).toContain('Oct 2026 – Jan 2027');
    expect(resume.replace(/<[^>]+>/g, '')).toContain('Python, Django, React, PostgreSQL, Supabase · Project: LiteraryWorm');
    expect(resume).toContain('Computer and Information Sciences, General');
    expect(resume).not.toMatch(/<img\b/);
    expect(resume).not.toContain('120+');
  });
});

describe('contact form honeypot', () => {
  const html = read('index.html');
  const form = html.match(/<form[^>]*id="contact-form"[\s\S]*?<\/form>/)[0];

  test('has a hidden, unfocusable website field outside the tab order', () => {
    const wrap = form.match(/<div class="contact-hp" aria-hidden="true">[\s\S]*?<\/div>/);
    expect(wrap).not.toBeNull();
    expect(wrap[0]).toMatch(/<input name="website"[^>]*tabindex="-1"[^>]*autocomplete="off"/);
  });

  test('is hidden off-screen by the stylesheet', () => {
    expect(read('css/styles.css')).toMatch(/\.contact-hp\s*\{[^}]*left:\s*-10000px/);
  });

  test('is skipped by client-side validation', () => {
    expect(read('js/main.js')).toContain("f.closest('.contact-hp')");
  });
});
