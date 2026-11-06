/* Project data and pure helpers. Loaded in the browser as a classic script
   (exposes window.Portfolio) and in Jest via module.exports. */
(function (root) {
  const GITHUB_USER = 'ZuleikaRose';

  const projects = [
    {
      repo: 'literaryworm',
      title: 'LiteraryWorm',
      tagline: 'A reading and listening app for ebooks and audiobooks',
      description:
        'A Netflix-style book discovery app where anyone can browse books and read other readers’ logs, and signed-in members build a personal library, household profiles and reading logs. Book data comes from the Google Books API through Supabase Edge Functions so the API key never reaches the browser, and Row Level Security protects every user’s data.',
      highlights: [
        'Google Books + LibriVox integration via Edge Functions',
        'Row Level Security on every table',
        'Accessibility-first UI'
      ],
      tags: ['React', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Vercel'],
      category: 'fullstack',
      live: 'https://www.literaryworm.com',
      year: 2026,
      featured: true
    },
    {
      repo: 'cryptocurrency_portfolio_app',
      title: 'CPA: Crypto Portfolio App',
      tagline: 'Track the crypto market, unlocks, funding rounds and your portfolio',
      description:
        'A responsive single-page app with coin rankings, token unlocks, funding rounds, a watchlist, a manual portfolio and price alerts. Live prices for 34 major coins come from CryptoRank, with price history from Coinbase and Kraken, via scheduled Supabase Edge Functions. Includes a no-signup private demo.',
      highlights: [
        'Scheduled Edge Functions pull live market data',
        'Bottom nav on phones, sidebar on desktop',
        'Hardened Vercel headers and service worker'
      ],
      tags: ['React', 'JavaScript', 'Supabase', 'PostgreSQL', 'Vercel'],
      category: 'fullstack',
      live: 'https://cpa-black.vercel.app',
      year: 2026,
      featured: true
    },
    {
      repo: 'netflix_clone',
      title: 'NetBox',
      tagline: 'A mobile-first streaming app with real TMDB titles',
      description:
        'A streaming app built with React 19, Vite 8 and React Router 7 on Supabase. Real trending and searchable titles from TMDB, profiles with PINs, watch parties over Supabase Realtime, an AI “what should I watch” picker powered by Claude, Stripe donations, a full Spanish translation, and Playwright end-to-end plus WCAG 2.2 AA tests on every user journey.',
      highlights: [
        'Playwright E2E + WCAG 2.2 AA test suite in CI',
        'Watch parties with Supabase Realtime',
        'Stripe payments with idempotent retries'
      ],
      tags: ['React', 'Vite', 'Supabase', 'Stripe', 'Playwright', 'Claude API'],
      category: 'fullstack',
      live: 'https://front-end-sepia-rho.vercel.app/',
      year: 2026,
      featured: true
    },
    {
      repo: 'angularzuleikav1',
      title: 'Amazon Clone (MEAN)',
      tagline: 'A full e-commerce storefront on the MEAN stack',
      description:
        'An Amazon-style store with product search powered by Algolia, image storage on AWS S3 (IAM and a public bucket), Stripe Checkout, and a REST API built with Express and MongoDB, tested in Postman.',
      highlights: ['Algolia instant search', 'AWS S3 product images', 'Stripe Checkout'],
      tags: ['Angular', 'TypeScript', 'Node', 'Express', 'MongoDB', 'AWS', 'Stripe'],
      category: 'mean',
      live: null,
      year: 2018,
      featured: false
    },
    {
      repo: 'codedemyv1',
      title: 'Codedemy',
      tagline: 'A Udemy-style online course marketplace',
      description:
        'An online learning platform with server-rendered EJS views, course video hosting on Wistia, paid enrollment through Stripe, and Mailchimp newsletter sign-ups, backed by Node, Express and MongoDB.',
      highlights: ['Wistia video hosting', 'Stripe enrollment payments', 'Mailchimp integration'],
      tags: ['Node', 'Express', 'MongoDB', 'EJS', 'Stripe'],
      category: 'mean',
      live: null,
      year: 2018,
      featured: false
    }
  ];

  const skills = {
    Frontend: ['React', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Vite', 'EJS'],
    'WordPress & Commerce': ['WordPress', 'SureCart', 'SureRank', 'Stripe', 'SEO (RankMath)'],
    Backend: ['Node.js', 'Python', 'Django', 'Express', 'Supabase Edge Functions', 'REST APIs'],
    Data: ['PostgreSQL', 'Row Level Security', 'MongoDB', 'Supabase Auth', 'CORS', 'Indexing'],
    'Cloud & DevOps': ['Vercel', 'Cloudflare', 'AWS S3 / IAM', 'GitHub Actions', 'Git'],
    'Testing & Quality': ['Playwright', 'Jest', 'Deno', 'Postman', 'WCAG 2.2 AA', 'Bug reporting'],
    'AI & Automation': ['Claude Code', 'Claude API', 'Subagents', 'AI automations'],
    'Business & Finance': ['Risk Management', 'Bloomberg Terminal', 'Derivatives operations', 'Excel reporting']
  };

  const experience = [
    {
      org: 'LiteraryWorm',
      role: 'Owner',
      start: 'Oct 2026',
      end: 'Present',
      location: 'Chicago, Illinois',
      url: 'https://www.literaryworm.com',
      bullets: [
        'Founded LiteraryWorm, a reading and listening app for ebooks and audiobooks with household profiles.',
        'Designed, built and deployed the product end to end on React, TypeScript, Supabase and Vercel.'
      ]
    },
    {
      org: 'Zuleika LLC',
      role: 'Owner | WordPress Web Developer',
      start: 'Jul 2025',
      end: 'Present',
      location: 'Chicago, Illinois',
      url: 'https://zuleikallc.com',
      bullets: [
        'Founded a WordPress web development and digital services agency building high-performing sites and AI-powered automations.',
        'Found bugs for 1Password to improve user experience; reported bugs and suggested roadmap features for Cuppa AI.',
        'Consulted RankMath, WPDeveloper and Termly on features, product strategy and offerings.'
      ]
    },
    {
      org: 'Zuleika, LLC',
      role: 'Founder | JavaScript Web Developer',
      start: 'Nov 2016',
      end: 'Mar 2018',
      location: 'Los Angeles, California',
      bullets: [
        'Founded a web development services company.',
        'Built an Amazon clone on the MEAN stack with Algolia, Stripe and Amazon Web Services.',
        'Advised Codecademy on mission direction following a $60M investment.'
      ]
    },
    {
      org: 'BNY Mellon',
      role: 'Derivatives Operations Specialist',
      start: 'Oct 2013',
      end: 'Feb 2016',
      location: 'Pittsburgh, Pennsylvania',
      bullets: [
        'Reclaimed ~$20M+ a month and saved 3 hours daily through Excel reporting and monitoring of client derivative transactions.',
        'Built an algorithm and streamlined ~40 morning reports covering 118 clients and 30–50 failed transactions daily.',
        'Verified ~$1.5B+ in daily wires through data quality controls.'
      ]
    },
    {
      org: 'BNY Mellon',
      role: 'Asset Servicing Undergraduate Intern',
      start: 'May 2013',
      end: 'Aug 2013',
      location: 'Pittsburgh, Pennsylvania',
      bullets: [
        'Business intelligence and market research contributing to ~$20M+ in client contract sales.',
        'Pitched a pricing framework that expanded client revenue by $1M+.'
      ]
    },
    {
      org: 'Accent Marketing',
      role: 'Engagement Specialist · Technical Support Representative',
      start: 'Dec 2008',
      end: 'May 2012',
      location: 'Monroe, Louisiana',
      bullets: [
        'Technical support and sales for WeightWatchers and Boost Mobile customers on Windows and Apple devices.',
        'Top salesperson (~$2,577 weekly), “WOW” awards, and featured in the 2009 Boost Mobile newsletter.'
      ]
    },
    {
      org: 'Primerica Financial Services',
      role: 'Senior Associate · Licensed Insurance Agent',
      start: 'Feb 2007',
      end: 'Feb 2010',
      location: 'West Monroe, Louisiana',
      bullets: ['Presented financial services to prospective clients and prepared life insurance proposals.']
    },
    {
      org: 'United States Air Force, Pacific Air Forces',
      role: 'Aerospace Medical Technician',
      start: 'Jul 2001',
      end: 'Aug 2006',
      location: 'Guam · South Korea · Japan',
      bullets: [
        'Achieved a 91% Preventive Health Assessment accuracy rate, ranked #1 in Pacific Air Command at Andersen AB, Guam.',
        'Raised PIMIR records capture from failing to 75% at Osan AB, South Korea.',
        'Administered DoD software security upgrades and clinic tech support at Yokota AB, Japan.',
        'Honorable discharge · Former Secret Clearance · Former Licensed EMT.'
      ]
    }
  ];

  const certifications = [
    'Claude Code in Action',
    'Claude 101',
    'Claude Platform 101',
    'Introduction to Subagents',
    'AI Capabilities and Limitations'
  ];

  const education = [
    {
      school: 'Code Platoon',
      program: 'AI Full-Stack Software Engineer',
      year: 2027,
      details: ['Learned Python, Django, React and PostgreSQL', 'Project: LiteraryWorm']
    },
    {
      school: 'Post University',
      program: 'Computer and Information Science, General',
      year: 2024,
      details: ['128+ credits']
    }
  ];

  const brands = [
    '1Password', 'RankMath', 'Termly', 'WPDeveloper', 'Cuppa AI', 'Brainstorm Force',
    'SEOscribed', 'Element UI', 'Codecademy', 'BNY', '1forone'
  ];

  function repoUrl(project) {
    return 'https://github.com/' + GITHUB_USER + '/' + project.repo;
  }

  /** Projects matching a category ('all' returns everything) and an optional
      case-insensitive text query over title, tagline and tags. */
  function filterProjects(list, category, query) {
    const q = (query || '').trim().toLowerCase();
    return list.filter(function (p) {
      if (category && category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const haystack = [p.title, p.tagline].concat(p.tags).join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  /** Every distinct tag across the projects, most used first, then A–Z. */
  function tagCounts(list) {
    const counts = {};
    list.forEach(function (p) {
      p.tags.forEach(function (t) {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (tag) { return { tag: tag, count: counts[tag] }; })
      .sort(function (a, b) { return b.count - a.count || a.tag.localeCompare(b.tag); });
  }

  const api = {
    GITHUB_USER: GITHUB_USER,
    projects: projects,
    skills: skills,
    experience: experience,
    certifications: certifications,
    education: education,
    brands: brands,
    repoUrl: repoUrl,
    filterProjects: filterProjects,
    tagCounts: tagCounts
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Portfolio = api;
})(typeof window !== 'undefined' ? window : globalThis);
