/* ============================================================
   FTP · Training Calendar
   - Events stored in a hash map keyed by ISO date → O(1) day lookup
   - Upcoming sidebar sorted with FTPDSA.MinHeap
   Storage key: ftp.events.v1
   ============================================================ */
(() => {
  'use strict';

  const KEY = 'ftp.events.v1';
  const { MinHeap } = window.FTPDSA;

  const $ = (id) => document.getElementById(id);
  const els = {
    grid: $('cal-grid'),
    monthLabel: $('month-label'),
    prev: $('prev-month'),
    next: $('next-month'),
    today: $('today-btn'),
    upcomingList: $('upcoming-list'),
    upcomingEmpty: $('upcoming-empty'),
    modal: $('day-modal'),
    modalDate: $('modal-date'),
    modalEvents: $('modal-events'),
    modalEmpty: $('modal-empty'),
    form: $('event-form'),
    titleField: $('event-title-field'),
    title: $('event-title'),
    type: $('event-type'),
    close: $('modal-close'),
  };

  /** events: { 'YYYY-MM-DD': [{ id, title, type, created }] } */
  let events = load();
  const now = new Date();
  let viewY = now.getFullYear();
  let viewM = now.getMonth();
  let openIso = null;
  let lastTrigger = null;

  /* ---------- Persistence ---------- */

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    } catch { return {}; }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(events)); }
    catch { /* storage unavailable — keep in memory */ }
  }

  function uid() {
    return 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function toast(msg, type) {
    if (window.FTPApp && window.FTPApp.toast) window.FTPApp.toast(msg, type);
  }

  /* ---------- Date helpers ---------- */

  function isoOf(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function todayIso() {
    const t = new Date();
    return isoOf(t.getFullYear(), t.getMonth(), t.getDate());
  }
  function longDate(iso) {
    return new Date(iso + 'T00:00').toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }
  function shortDate(iso) {
    const t = todayIso();
    if (iso === t) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (iso === isoOf(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())) return 'Tomorrow';
    return new Date(iso + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /* ---------- Month grid ---------- */

  function renderGrid() {
    els.monthLabel.textContent = new Date(viewY, viewM, 1).toLocaleDateString(undefined, {
      month: 'long', year: 'numeric',
    });
    els.grid.textContent = '';

    const firstDow = new Date(viewY, viewM, 1).getDay();
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const tIso = todayIso();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < firstDow; i++) {
      const fill = document.createElement('div');
      fill.className = 'cal-fill';
      fill.setAttribute('aria-hidden', 'true');
      frag.appendChild(fill);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoOf(viewY, viewM, d);
      const dayEvents = events[iso] || []; // O(1) hash-map lookup
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-cell' + (iso === tIso ? ' is-today' : '');
      cell.setAttribute('aria-label',
        `${longDate(iso)} — ${dayEvents.length === 0 ? 'no workouts' : dayEvents.length + ' workout' + (dayEvents.length > 1 ? 's' : '')}. Open day.`);
      if (dayEvents.length) {
        cell.title = dayEvents.map((ev) => `${ev.title} (${ev.type})`).join(', ');
      }

      const num = document.createElement('span');
      num.className = 'day-num';
      num.textContent = String(d);
      cell.appendChild(num);

      if (dayEvents.length) {
        const dots = document.createElement('span');
        dots.className = 'cal-dots';
        for (const ev of dayEvents.slice(0, 4)) {
          const dot = document.createElement('span');
          dot.className = 'dot t-' + String(ev.type).toLowerCase();
          dots.appendChild(dot);
        }
        if (dayEvents.length > 4) {
          const more = document.createElement('span');
          more.className = 'more';
          more.textContent = '+' + (dayEvents.length - 4);
          dots.appendChild(more);
        }
        cell.appendChild(dots);
      }

      cell.addEventListener('click', () => openModal(iso, cell));
      frag.appendChild(cell);
    }

    els.grid.appendChild(frag);
  }

  /* ---------- Upcoming sidebar (MinHeap) ---------- */

  function renderUpcoming() {
    const t = todayIso();
    const pool = [];
    for (const [date, list] of Object.entries(events)) {
      if (date >= t) for (const ev of list) pool.push({ ...ev, date });
    }
    const heap = MinHeap.from(pool, (a, b) =>
      a.date === b.date ? a.created - b.created : (a.date < b.date ? -1 : 1));

    els.upcomingList.textContent = '';
    let n = 0;
    while (heap.size > 0 && n < 5) {
      const ev = heap.pop();
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot t-' + String(ev.type).toLowerCase();
      const main = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'upcoming-title';
      title.textContent = ev.title;
      const date = document.createElement('div');
      date.className = 'upcoming-date';
      date.textContent = `${shortDate(ev.date)} · ${ev.type}`;
      main.append(title, date);
      li.append(dot, main);
      els.upcomingList.appendChild(li);
      n++;
    }
    els.upcomingEmpty.classList.toggle('hidden', n > 0);
  }

  function renderAll() {
    renderGrid();
    renderUpcoming();
  }

  /* ---------- Modal ---------- */

  function openModal(iso, trigger) {
    openIso = iso;
    lastTrigger = trigger || null;
    els.modalDate.textContent = longDate(iso);
    renderModalEvents();
    els.form.reset();
    els.titleField.classList.remove('invalid');
    els.modal.hidden = false;
    els.title.focus();
  }

  function closeModal() {
    els.modal.hidden = true;
    openIso = null;
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  function renderModalEvents() {
    const list = events[openIso] || [];
    els.modalEvents.textContent = '';
    for (const ev of list) {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot t-' + String(ev.type).toLowerCase();
      const main = document.createElement('div');
      main.className = 'ev-main';
      const title = document.createElement('div');
      title.className = 'ev-title';
      title.textContent = ev.title;
      const type = document.createElement('div');
      type.className = 'ev-type';
      type.textContent = ev.type;
      main.append(title, type);
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'icon-btn';
      del.setAttribute('aria-label', 'Delete workout: ' + ev.title);
      del.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
      del.addEventListener('click', () => deleteEvent(openIso, ev.id));
      li.append(dot, main, del);
      els.modalEvents.appendChild(li);
    }
    els.modalEmpty.classList.toggle('hidden', list.length > 0);
  }

  /* ---------- Mutations ---------- */

  function addEvent(iso, title, type) {
    if (!events[iso]) events[iso] = [];
    events[iso].push({ id: uid(), title, type, created: Date.now() });
    persist();
    renderAll();
    if (openIso === iso) renderModalEvents();
    toast('Workout added: ' + title);
  }

  function deleteEvent(iso, id) {
    if (!events[iso]) return;
    events[iso] = events[iso].filter((ev) => ev.id !== id);
    if (events[iso].length === 0) delete events[iso];
    persist();
    renderAll();
    if (openIso === iso) renderModalEvents();
    toast('Workout removed.');
  }

  /* ---------- Wiring ---------- */

  els.prev.addEventListener('click', () => {
    viewM--;
    if (viewM < 0) { viewM = 11; viewY--; }
    renderGrid();
  });
  els.next.addEventListener('click', () => {
    viewM++;
    if (viewM > 11) { viewM = 0; viewY++; }
    renderGrid();
  });
  els.today.addEventListener('click', () => {
    const t = new Date();
    viewY = t.getFullYear();
    viewM = t.getMonth();
    renderGrid();
  });

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!openIso) return;
    const title = els.title.value.trim();
    if (!title) {
      els.titleField.classList.add('invalid');
      els.title.focus();
      return;
    }
    els.titleField.classList.remove('invalid');
    addEvent(openIso, title, els.type.value);
    els.form.reset();
    els.title.focus();
  });
  els.title.addEventListener('input', () => els.titleField.classList.remove('invalid'));

  els.close.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.hidden) closeModal();
  });

  /* ---------- Customizable weekly split ---------- */
  const SPLIT_KEY = 'ftp.split.v1';
  const SPLIT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const SPLIT_DEFAULT = ['Chest', 'Legs', 'Shoulders & Arms', 'Back', 'Core', 'Full Body or Cardio', 'Rest'];

  const splitList = document.getElementById('splitList');
  const splitEditBtn = document.getElementById('splitEditBtn');
  const splitResetBtn = document.getElementById('splitResetBtn');
  let splitEditing = false;

  function loadSplit() {
    try {
      const saved = JSON.parse(localStorage.getItem(SPLIT_KEY) || 'null');
      if (Array.isArray(saved) && saved.length === 7) return saved;
    } catch { /* fall through to default */ }
    return [...SPLIT_DEFAULT];
  }

  function saveSplit(values) {
    try { localStorage.setItem(SPLIT_KEY, JSON.stringify(values)); } catch { /* ignore */ }
  }

  function isCustomSplit(values) {
    return values.some((v, i) => v !== SPLIT_DEFAULT[i]);
  }

  function renderSplit() {
    const values = loadSplit();
    splitList.replaceChildren();
    values.forEach((value, i) => {
      const li = document.createElement('li');
      const day = document.createElement('strong');
      day.textContent = SPLIT_DAYS[i];
      li.appendChild(day);
      if (splitEditing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'split-input';
        input.value = value;
        input.maxLength = 40;
        input.setAttribute('aria-label', `Workout for ${SPLIT_DAYS[i]}`);
        const fit = () => { input.style.width = `${Math.min(40, Math.max(8, input.value.length + 2))}ch`; };
        input.addEventListener('input', fit);
        fit();
        li.appendChild(input);
        li.classList.add('editing');
      } else {
        li.appendChild(document.createTextNode(' ' + value));
      }
      splitList.appendChild(li);
    });
    splitEditBtn.textContent = splitEditing ? 'Save' : 'Edit';
    splitResetBtn.hidden = !(splitEditing || isCustomSplit(values));
  }

  splitEditBtn.addEventListener('click', () => {
    if (splitEditing) {
      const values = [...splitList.querySelectorAll('.split-input')]
        .map((input, i) => input.value.trim() || SPLIT_DEFAULT[i]);
      saveSplit(values);
      splitEditing = false;
      renderSplit();
      if (window.FTPApp) window.FTPApp.toast('Weekly split saved.');
    } else {
      splitEditing = true;
      renderSplit();
      splitList.querySelector('.split-input')?.focus();
    }
  });

  splitResetBtn.addEventListener('click', () => {
    localStorage.removeItem(SPLIT_KEY);
    splitEditing = false;
    renderSplit();
    if (window.FTPApp) window.FTPApp.toast('Weekly split reset to the suggested plan.');
  });

  renderSplit();

  renderAll();
})();
