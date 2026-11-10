const P = require('../js/projects.js');

describe('project data', () => {
  test('showcases the six requested repos', () => {
    expect(P.projects.map((p) => p.repo)).toEqual([
      'literaryworm',
      'literarywormai',
      'cryptocurrency_portfolio_app',
      'netflix_clone',
      'angularzuleikav1',
      'codedemyv1'
    ]);
  });

  test('every project has the fields the page renders', () => {
    P.projects.forEach((p) => {
      expect(p.title).toBeTruthy();
      expect(p.tagline).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.tags.length).toBeGreaterThan(0);
      expect(['fullstack', 'mean']).toContain(p.category);
    });
  });

  test('LiteraryWorm AI is featured and its code is marked private', () => {
    const ai = P.projects.find((p) => p.repo === 'literarywormai');
    expect(ai.title).toBe('LiteraryWorm AI');
    expect(ai.featured).toBe(true);
    expect(ai.private).toBe(true);
    expect(ai.live).toBe('https://literarywormai.vercel.app/');
    expect(P.projects.filter((p) => p.private).map((p) => p.repo)).toEqual(['literarywormai']);
  });

  test('every project has its own cover colour that the stylesheet defines', () => {
    const css = require('fs').readFileSync(require('path').join(__dirname, '../css/styles.css'), 'utf8');
    const covers = P.projects.map((p) => p.cover);
    expect(new Set(covers).size).toBe(P.projects.length);
    covers.forEach((c) => expect(css).toContain('.project-cover.c' + c + ' {'));
  });

  test('repoUrl points at the GitHub repo', () => {
    expect(P.repoUrl(P.projects[0])).toBe('https://github.com/ZuleikaRose/literaryworm');
  });

  test('LiteraryWorm AI is the newest role, started November 2026', () => {
    const ai = P.experience[0];
    expect(ai.org).toBe('LiteraryWorm AI');
    expect(ai.role).toBe('Owner');
    expect(ai.start).toBe('Nov 2026');
    expect(ai.end).toBe('Present');
    expect(ai.location).toBe('Chicago, Illinois');
    expect(ai.bullets).toEqual([
      'Founded LiteraryWorm AI, an AI publishing dashboard that takes an ebook from idea to a live store listing.'
    ]);
  });

  test('LiteraryWorm is a current role, started October 2026', () => {
    const lw = P.experience[1];
    expect(lw.org).toBe('LiteraryWorm');
    expect(lw.role).toBe('Owner');
    expect(lw.start).toBe('Oct 2026');
    expect(lw.end).toBe('Present');
  });
});

describe('filterProjects', () => {
  test('"all" with no query returns everything', () => {
    expect(P.filterProjects(P.projects, 'all', '')).toHaveLength(6);
  });

  test('filters by category', () => {
    const mean = P.filterProjects(P.projects, 'mean', '');
    expect(mean.map((p) => p.repo)).toEqual(['angularzuleikav1', 'codedemyv1']);
  });

  test('searches tags case-insensitively', () => {
    const stripe = P.filterProjects(P.projects, 'all', '  stripe ');
    expect(stripe.map((p) => p.repo)).toEqual(['netflix_clone', 'angularzuleikav1', 'codedemyv1']);
  });

  test('combines category and query', () => {
    expect(P.filterProjects(P.projects, 'fullstack', 'mongodb')).toEqual([]);
  });
});

describe('tagCounts', () => {
  test('orders tags by frequency then name', () => {
    const counts = P.tagCounts(P.projects);
    expect(counts[0].count).toBeGreaterThanOrEqual(counts[1].count);
    expect(counts.find((t) => t.tag === 'Supabase').count).toBe(4);
  });
});
