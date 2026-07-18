/* ============================================================
   FTP · App shell
   Injects the shared navbar + footer on every page, wires the
   mobile menu, reveal-on-scroll, toasts, auth-aware nav state,
   trie-powered global search and LRU recently-viewed tracking.
   Requires: dsa.js, auth.js loaded first.
   ============================================================ */

(() => {
  const PAGES = [
    { title: 'Home', url: '/', keywords: 'home start feel the pump' },
    { title: 'Nutrition Hub', url: '/nutrition_page/nutrition.html', keywords: 'nutrition food diet macros protein' },
    { title: 'Fat Loss Plan', url: '/nutrition_page/fatloss_page/fatloss.html', keywords: 'fat loss cutting deficit diet' },
    { title: 'Weight Gain Plan', url: '/nutrition_page/weightgain_page/weightgain.html', keywords: 'weight gain bulking surplus diet' },
    { title: 'Muscle Building Plan', url: '/nutrition_page/musclebuilding_page/musclebuilding.html', keywords: 'muscle building lean protein diet' },
    { title: 'Workouts Hub', url: '/workout_page/workout.html', keywords: 'workouts training exercises gym' },
    { title: 'Chest Workouts', url: '/workout_page/chest/chest.html', keywords: 'chest pecs bench press push' },
    { title: 'Back Workouts', url: '/workout_page/back/back.html', keywords: 'back lats rows pull deadlift' },
    { title: 'Leg Workouts', url: '/workout_page/legs/legs.html', keywords: 'legs squat lower body' },
    { title: 'Quads & Hamstrings', url: '/workout_page/legs/leg_works/legmuscle.html', keywords: 'quads hamstrings thigh squat lunge' },
    { title: 'Calves', url: '/workout_page/legs/calves/calve.html', keywords: 'calves raise lower leg' },
    { title: 'Shoulder Workouts', url: '/workout_page/shoulders/shoulder.html', keywords: 'shoulders delts press lateral raise' },
    { title: 'Arm Workouts', url: '/workout_page/arms/arms.html', keywords: 'arms biceps triceps forearms' },
    { title: 'Biceps', url: '/workout_page/arms/biceps/biceps.html', keywords: 'biceps curls arms' },
    { title: 'Triceps', url: '/workout_page/arms/triceps/triceps.html', keywords: 'triceps pushdown extension arms' },
    { title: 'Forearms', url: '/workout_page/arms/forearms/forearms.html', keywords: 'forearms grip wrist curls' },
    { title: 'Core Workouts', url: '/workout_page/core/core.html', keywords: 'core abs plank crunch obliques' },
    { title: 'Workout Songs', url: '/songs/songs.html', keywords: 'songs music playlist gym vibe' },
    { title: 'Calendar', url: '/calender/calender.html', keywords: 'calendar schedule plan tracking' },
    { title: 'To-Do List', url: '/to_do_list/todolist.html', keywords: 'todo tasks list priority notes' },
    { title: 'About the Author', url: '/Author/aboutme.html', keywords: 'author himanshu about contact' },
    { title: 'Login / Sign Up', url: '/login-page/login.html', keywords: 'login sign up account register' },
  ];

  const NAV_HTML = `
    <nav class="site-nav" aria-label="Main navigation">
      <div class="nav-inner">
        <a class="nav-brand" href="/">
          <img src="/assets/img/logo-small.webp" alt="FTP logo" width="38" height="38" />
          <span>FTP<strong>·</strong>Feel The Pump</span>
        </a>
        <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
        <ul class="nav-links">
          <li>
            <a href="/nutrition_page/nutrition.html" data-nav="nutrition">Nutrition <span class="caret">▼</span></a>
            <ul class="dropdown-panel">
              <li><a href="/nutrition_page/fatloss_page/fatloss.html">Fat Loss</a></li>
              <li><a href="/nutrition_page/weightgain_page/weightgain.html">Weight Gain</a></li>
              <li><a href="/nutrition_page/musclebuilding_page/musclebuilding.html">Muscle Building</a></li>
            </ul>
          </li>
          <li>
            <a href="/workout_page/workout.html" data-nav="workouts">Workouts <span class="caret">▼</span></a>
            <ul class="dropdown-panel">
              <li><a href="/workout_page/chest/chest.html">Chest</a></li>
              <li><a href="/workout_page/back/back.html">Back</a></li>
              <li><a href="/workout_page/legs/legs.html">Legs</a></li>
              <li><a href="/workout_page/shoulders/shoulder.html">Shoulders</a></li>
              <li><a href="/workout_page/arms/arms.html">Arms</a></li>
              <li><a href="/workout_page/core/core.html">Core</a></li>
            </ul>
          </li>
          <li><a href="/songs/songs.html" data-nav="songs">Songs</a></li>
          <li><a href="/calender/calender.html" data-nav="calendar">Calendar</a></li>
          <li><a href="/to_do_list/todolist.html" data-nav="todo">To-Do</a></li>
          <li><a href="/Author/aboutme.html" data-nav="author">Author</a></li>
          <li class="nav-search-item">
            <div class="nav-search">
              <input type="search" id="global-search" placeholder="Search…" aria-label="Search the site" autocomplete="off" />
              <ul class="search-results" id="search-results" role="listbox" hidden></ul>
            </div>
          </li>
          <li class="nav-auth-slot"></li>
        </ul>
      </div>
    </nav>`;

  const FOOTER_HTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>FTP · Feel The Pump</h4>
            <p>Fuel your fitness journey. Build strength, sweat with purpose, and grow beyond your limits.</p>
          </div>
          <div>
            <h4>Train</h4>
            <a href="/workout_page/workout.html">Workouts</a>
            <a href="/nutrition_page/nutrition.html">Nutrition</a>
            <a href="/calender/calender.html">Calendar</a>
            <a href="/to_do_list/todolist.html">To-Do List</a>
          </div>
          <div>
            <h4>Connect</h4>
            <a href="mailto:himanshumudigonda@gmail.com">himanshumudigonda@gmail.com</a>
            <a href="https://github.com/mudigondahimanshu" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.linkedin.com/in/himanshu-mudigonda-09a9ba29b/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://www.instagram.com/skill_issue23040/" target="_blank" rel="noopener">Instagram</a>
          </div>
          <div>
            <h4>More</h4>
            <a href="/Author/aboutme.html">About Me</a>
            <a href="/songs/songs.html">Workout Songs</a>
            <a href="/login-page/login.html">Login</a>
          </div>
        </div>
        <div class="footer-bottom">© 2026 FTP · Built by Himanshu Mudigonda. All rights reserved.</div>
      </div>
    </footer>`;

  const SEARCH_CSS = `
    .nav-search { position: relative; }
    .nav-search input {
      background: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: 99px;
      color: var(--text);
      padding: 0.45rem 1rem;
      font-size: 0.92rem;
      width: 150px;
      transition: width 0.25s var(--ease), border-color 0.2s;
    }
    .nav-search input:focus { outline: none; border-color: var(--accent); width: 210px; }
    .search-results {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 240px;
      background: var(--bg-card);
      border: 1px solid var(--border-bright);
      border-radius: 12px;
      list-style: none;
      margin: 0;
      padding: 0.4rem;
      box-shadow: 0 18px 42px rgba(0,0,0,0.55);
      z-index: var(--z-dropdown);
    }
    .search-results a {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.93rem;
    }
    .search-results a:hover, .search-results li.selected a { background: var(--accent-soft); color: var(--text); }
    .search-results .no-results { padding: 0.5rem 0.75rem; color: var(--text-faint); font-size: 0.9rem; }
    @media (max-width: 900px) {
      .nav-search input, .nav-search input:focus { width: 100%; }
      .search-results { left: 0; right: 0; }
    }`;

  /* ---------- Injection ---------- */
  function inject() {
    const style = document.createElement('style');
    style.textContent = SEARCH_CSS;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

    const toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
  }

  /* ---------- Nav behaviour ---------- */
  function wireNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // On mobile, first tap on a dropdown parent opens the submenu.
    document.querySelectorAll('.nav-links > li > a[data-nav]').forEach((a) => {
      const li = a.parentElement;
      if (!li.querySelector('.dropdown-panel')) return;
      a.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && !li.classList.contains('submenu-open')) {
          e.preventDefault();
          li.classList.add('submenu-open');
        }
      });
    });

    // Highlight the active section.
    const path = location.pathname;
    const active =
      path.includes('nutrition') ? 'nutrition' :
      path.includes('workout') ? 'workouts' :
      path.includes('songs') ? 'songs' :
      path.includes('calender') ? 'calendar' :
      path.includes('to_do') ? 'todo' :
      path.includes('Author') ? 'author' : null;
    if (active) document.querySelector(`[data-nav="${active}"]`)?.classList.add('active');
  }

  /* ---------- Auth-aware nav ---------- */
  function wireAuthSlot() {
    const slot = document.querySelector('.nav-auth-slot');
    const user = window.FTPAuth?.currentUser();
    if (user) {
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'nav-cta nav-user';
      link.title = 'Click to log out';
      link.textContent = `${user} · Logout`;
      slot.replaceChildren(link);
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.FTPAuth.logout();
        window.FTPApp.toast(`Logged out. See you at the next session, ${user}!`);
        setTimeout(() => location.reload(), 900);
      });
    } else {
      slot.innerHTML = `<a href="/login-page/login.html" class="nav-cta">Login</a>`;
    }
  }

  /* ---------- Trie-powered global search ---------- */
  function wireSearch() {
    const trie = new window.FTPDSA.Trie();
    for (const page of PAGES) trie.insert(`${page.title} ${page.keywords}`, page);

    const input = document.getElementById('global-search');
    const results = document.getElementById('search-results');
    let selected = -1;

    function render(items) {
      if (!input.value.trim()) { results.hidden = true; return; }
      selected = -1;
      results.innerHTML = items.length
        ? items.map((p) => `<li><a href="${p.url}">${p.title}</a></li>`).join('')
        : '<li class="no-results">No matches found</li>';
      results.hidden = false;
    }

    input.addEventListener('input', () => render(trie.search(input.value)));
    input.addEventListener('keydown', (e) => {
      const items = [...results.querySelectorAll('li:not(.no-results)')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        selected = e.key === 'ArrowDown'
          ? Math.min(selected + 1, items.length - 1)
          : Math.max(selected - 1, 0);
        items.forEach((li, i) => li.classList.toggle('selected', i === selected));
      } else if (e.key === 'Enter' && selected >= 0) {
        e.preventDefault();
        items[selected].querySelector('a').click();
      } else if (e.key === 'Escape') {
        results.hidden = true;
        input.blur();
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search')) results.hidden = true;
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function wireReveal() {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ---------- LRU recently-viewed ---------- */
  function trackVisit() {
    const lru = new window.FTPDSA.LRUCache(6, 'ftp.recent.v1');
    const page = PAGES.find((p) => p.url === location.pathname
      || (p.url !== '/' && location.pathname.endsWith(p.url)));
    if (page && page.url !== '/' && !page.url.includes('login')) {
      lru.put(page.url, page.title);
    }
    window.FTPApp.recentPages = () => lru.entries();
  }

  /* ---------- Toast ---------- */
  function toast(message, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast${type === 'error' ? ' error' : ''}`;
    el.textContent = message;
    document.querySelector('.toast-stack').appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }

  window.FTPApp = { toast, pages: PAGES, recentPages: () => [] };

  document.addEventListener('DOMContentLoaded', () => {
    inject();
    wireNav();
    wireAuthSlot();
    wireSearch();
    wireReveal();
    trackVisit();
  });
})();
