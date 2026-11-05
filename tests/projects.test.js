const P = require('../js/projects.js');

describe('project data', () => {
  test('showcases the five requested repos', () => {
    expect(P.projects.map((p) => p.repo)).toEqual([
      'literaryworm',
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

  test('repoUrl points at the GitHub repo', () => {
    expect(P.repoUrl(P.projects[0])).toBe('https://github.com/ZuleikaRose/literaryworm');
  });

  test('LiteraryWorm is the current role, started October 2026', () => {
    const lw = P.experience[0];
    expect(lw.org).toBe('LiteraryWorm');
    expect(lw.role).toBe('Owner');
    expect(lw.start).toBe('Oct 2026');
    expect(lw.end).toBe('Present');
  });
});

describe('filterProjects', () => {
  test('"all" with no query returns everything', () => {
    expect(P.filterProjects(P.projects, 'all', '')).toHaveLength(5);
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
    expect(counts.find((t) => t.tag === 'Supabase').count).toBe(3);
  });
});
