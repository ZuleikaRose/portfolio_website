(function () {
  'use strict';
  const P = window.Portfolio;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'class') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach((c) => c && node.append(c));
    return node;
  }

  /* ---------- Theme ---------- */
  const themeBtn = $('.theme-toggle');
  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = currentTheme();
  themeBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = $('.nav-toggle');
  const navLinks = $('#nav-links');
  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('is-open', open);
  }
  navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------- Brands, skills, education, certifications ---------- */
  P.brands.forEach((b) => $('#brand-list').append(el('li', { text: b })));

  Object.entries(P.skills).forEach(([group, items]) => {
    $('#skills-grid').append(
      el('article', { class: 'skill-card' }, [
        el('h3', { text: group }),
        el('ul', {}, items.map((s) => el('li', { text: s })))
      ])
    );
  });
  P.education.forEach((e) => $('#edu-list').append(el('li', { text: e })));
  P.certifications.forEach((c) => $('#cert-list').append(el('li', { text: c })));

  /* ---------- Projects ---------- */
  const grid = $('#project-grid');
  const empty = $('#project-empty');
  const search = $('#project-search');
  let activeFilter = 'all';

  function projectCard(p) {
    const i = P.projects.indexOf(p);
    const desc = el('p', { class: 'project-desc', id: 'desc-' + p.repo, text: p.description, hidden: true });
    const more = el('button', { class: 'link-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': desc.id, text: 'Details' });
    more.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Less' : 'Details';
      desc.hidden = !open;
    });

    return el('article', { class: 'project-card' }, [
      el('div', { class: 'project-cover c' + i, 'aria-hidden': 'true', text: p.title }),
      el('div', { class: 'project-body' }, [
        el('div', { class: 'project-meta' }, [
          el('span', { class: 'badge', text: p.featured ? 'Featured' : 'Classic' }),
          el('span', { text: String(p.year) })
        ]),
        el('h3', { text: p.title }),
        el('p', { class: 'project-tagline', text: p.tagline }),
        desc,
        el('ul', { class: 'project-highlights' }, p.highlights.map((h) => el('li', { text: h }))),
        el('ul', { class: 'tags', 'aria-label': 'Technologies' }, p.tags.map((t) => el('li', { text: t }))),
        p.liveNote && el('p', { class: 'live-note', text: p.liveNote }),
        el('div', { class: 'project-links' }, [
          p.live && el('a', {
            href: p.live, target: '_blank', rel: 'noopener',
            text: p.liveNote ? 'Live demo (under review) ↗' : 'Live site ↗',
            title: p.liveNote || null
          }),
          el('a', { href: P.repoUrl(p), target: '_blank', rel: 'noopener', text: 'Code ↗' }),
          more,
          el('span', { class: 'repo-stats', 'data-repo': p.repo })
        ])
      ])
    ]);
  }

  function renderProjects() {
    const list = P.filterProjects(P.projects, activeFilter, search.value);
    grid.replaceChildren(...list.map(projectCard));
    empty.hidden = list.length > 0;
    fillRepoStats();
  }

  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      $$('.filter').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderProjects();
    });
  });
  search.addEventListener('input', renderProjects);

  /* Live "last updated" from the public GitHub API (cached per session). */
  const repoCache = {};
  function fillRepoStats() {
    $$('.repo-stats', grid).forEach((span) => {
      const repo = span.dataset.repo;
      const show = (data) => {
        if (!data || !data.pushed_at) return;
        const d = new Date(data.pushed_at);
        span.textContent = 'Updated ' + d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      };
      if (repoCache[repo]) return show(repoCache[repo]);
      let cached = null;
      try { cached = JSON.parse(sessionStorage.getItem('repo:' + repo)); } catch (e) { /* ignore */ }
      if (cached) { repoCache[repo] = cached; return show(cached); }
      fetch('https://api.github.com/repos/' + P.GITHUB_USER + '/' + repo)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          const slim = { pushed_at: data.pushed_at };
          repoCache[repo] = slim;
          try { sessionStorage.setItem('repo:' + repo, JSON.stringify(slim)); } catch (e) { /* ignore */ }
          show(slim);
        })
        .catch(() => { /* offline or rate-limited: stats are optional */ });
    });
  }
  renderProjects();

  /* ---------- Experience timeline ---------- */
  const timeline = $('#timeline');
  const VISIBLE = 4;
  P.experience.forEach((job, idx) => {
    const org = job.url
      ? el('a', { href: job.url, target: '_blank', rel: 'noopener', text: job.org })
      : document.createTextNode(job.org);
    const item = el('li', { class: 'timeline-item' + (job.end === 'Present' ? ' is-current' : '') }, [
      el('span', { class: 'timeline-date', text: job.start + ' — ' + job.end }),
      el('h3', { text: job.role }),
      el('p', { class: 'timeline-org' }, [org, document.createTextNode(' · ' + job.location)]),
      el('ul', {}, job.bullets.map((b) => el('li', { text: b })))
    ]);
    if (idx >= VISIBLE) item.hidden = true;
    timeline.append(item);
  });
  if (P.experience.length > VISIBLE) {
    const btn = el('button', { class: 'btn btn-ghost timeline-more', type: 'button', 'aria-expanded': 'false', text: 'Show full career history' });
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      $$('.timeline-item', timeline).forEach((li, i) => { if (i >= VISIBLE) li.hidden = !open; });
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less' : 'Show full career history';
    });
    timeline.after(btn);
  }

  /* ---------- Typed hero phrase ---------- */
  const typed = $('.typed');
  const phrases = ['high-performing websites', 'full-stack web apps', 'WordPress sites', 'AI-powered automations', 'accessible interfaces'];
  if (!reduceMotion) {
    let p = 0, c = phrases[0].length, deleting = true;
    function tick() {
      const word = phrases[p];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 40 : 80;
      if (!deleting && c === word.length) { deleting = true; delay = 1800; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 300; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 1800);
  }

  /* ---------- Reveal on scroll, counters, scroll spy ---------- */
  function countUp(node) {
    const target = Number(node.dataset.count);
    if (reduceMotion) { node.textContent = target; return; }
    const start = performance.now();
    const dur = 1200;
    (function step(now) {
      const t = Math.min(1, (now - start) / dur);
      node.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((s) => io.observe(s));

    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countUp(e.target);
        counterIO.unobserve(e.target);
      });
    });
    $$('.stat-num').forEach((n) => counterIO.observe(n));

    const links = $$('.nav-links a[href^="#"]');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  } else {
    $$('.reveal').forEach((s) => s.classList.add('is-visible'));
    $$('.stat-num').forEach((n) => { n.textContent = n.dataset.count; });
  }

  const progress = $('.scroll-progress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + '%';
  }, { passive: true });

  /* ---------- Contact form (opens the visitor's email app; no backend) ---------- */
  const form = $('#contact-form');
  const note = $('#form-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('input, textarea', form).forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in every field with a valid email.'; return; }
    const data = new FormData(form);
    const subject = 'Portfolio inquiry from ' + data.get('name');
    const body = data.get('message') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')';
    window.location.href = 'mailto:alice.millage@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app…';
  });

  $('#year').textContent = new Date().getFullYear();
})();
