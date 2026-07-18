/* ============================================================
   FTP · Priority To-Do List
   - MinHeap    → task ordering (priority → due date → created)
   - Trie       → live prefix search, rebuilt on every change
   - UndoStack  → bounded undo history (Ctrl/Cmd + Z)
   Storage key: ftp.todos.v1
   ============================================================ */
(() => {
  'use strict';

  const KEY = 'ftp.todos.v1';
  const LEGACY_KEY = 'todo-list';
  const RANK = { High: 0, Medium: 1, Low: 2 };
  const { MinHeap, Trie, UndoStack } = window.FTPDSA;

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('add-form'),
    titleField: $('title-field'),
    title: $('task-title'),
    priority: $('task-priority'),
    due: $('task-due'),
    search: $('task-search'),
    undoBtn: $('undo-btn'),
    undoCount: $('undo-count'),
    activeList: $('active-list'),
    completedList: $('completed-list'),
    completedWrap: $('completed-wrap'),
    completedCount: $('completed-count'),
    emptyState: $('empty-state'),
    noMatch: $('no-match'),
    statTotal: $('stat-total'),
    statActive: $('stat-active'),
    statDone: $('stat-done'),
    statHigh: $('stat-high'),
  };

  const undoStack = new UndoStack(40);
  let tasks = load();
  let trie = null;
  let editingId = null;
  let query = '';

  /* ---------- Persistence ---------- */

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      // Migrate tasks from the old to-do list, if any.
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      if (Array.isArray(legacy) && legacy.length) {
        const migrated = legacy
          .filter((t) => t && typeof t.text === 'string' && t.text.trim())
          .map((t, i) => ({
            id: uid(),
            title: t.text.trim(),
            priority: 'Medium',
            due: null,
            created: Date.now() + i,
            completed: !!t.completed,
          }));
        localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch { /* corrupt state — start fresh */ }
    return [];
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); }
    catch { /* storage unavailable — keep in memory */ }
    rebuildTrie();
  }

  function uid() {
    return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function snapshot() {
    undoStack.push(JSON.stringify(tasks));
  }

  function toast(msg, type) {
    if (window.FTPApp && window.FTPApp.toast) window.FTPApp.toast(msg, type);
  }

  /* ---------- Ordering & search ---------- */

  function compare(a, b) {
    const p = (RANK[a.priority] ?? 1) - (RANK[b.priority] ?? 1);
    if (p !== 0) return p;
    const da = a.due ? Date.parse(a.due) : Infinity;
    const db = b.due ? Date.parse(b.due) : Infinity;
    if (da !== db) return da < db ? -1 : 1;
    return a.created - b.created;
  }

  function rebuildTrie() {
    trie = new Trie();
    for (const t of tasks) trie.insert(t.title, t);
  }

  /* ---------- Rendering ---------- */

  function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fmtDue(iso) {
    return new Date(iso + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function svgIcon(paths) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '17');
    svg.setAttribute('height', '17');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    for (const d of paths) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    }
    return svg;
  }

  function taskRow(t) {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' done' : '');

    if (editingId === t.id) {
      li.appendChild(editForm(t));
      return li;
    }

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = t.completed;
    box.setAttribute('aria-label', (t.completed ? 'Mark active: ' : 'Mark complete: ') + t.title);
    box.addEventListener('change', () => toggleTask(t.id));

    const main = document.createElement('div');
    main.className = 'task-main';
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = t.title;
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const tag = document.createElement('span');
    tag.className = 'tag p-' + t.priority.toLowerCase();
    tag.textContent = t.priority;
    meta.appendChild(tag);
    if (t.due) {
      const due = document.createElement('span');
      due.className = 'due' + (!t.completed && t.due < todayIso() ? ' overdue' : '');
      due.textContent = (!t.completed && t.due < todayIso() ? 'Overdue · ' : 'Due ') + fmtDue(t.due);
      meta.appendChild(due);
    }
    main.append(title, meta);

    li.append(box, main);

    if (!t.completed) {
      const edit = document.createElement('button');
      edit.className = 'icon-btn';
      edit.setAttribute('aria-label', 'Edit task: ' + t.title);
      edit.appendChild(svgIcon(['M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z']));
      edit.addEventListener('click', () => { editingId = t.id; render(); });
      li.appendChild(edit);
    }

    const del = document.createElement('button');
    del.className = 'icon-btn danger';
    del.setAttribute('aria-label', 'Delete task: ' + t.title);
    del.appendChild(svgIcon(['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6']));
    del.addEventListener('click', () => deleteTask(t.id));
    li.appendChild(del);

    return li;
  }

  function editForm(t) {
    const form = document.createElement('form');
    form.className = 'edit-form';

    const title = document.createElement('input');
    title.type = 'text';
    title.value = t.title;
    title.maxLength = 80;
    title.setAttribute('aria-label', 'Task title');

    const priority = document.createElement('select');
    priority.setAttribute('aria-label', 'Priority');
    for (const p of ['High', 'Medium', 'Low']) {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      opt.selected = t.priority === p;
      priority.appendChild(opt);
    }

    const due = document.createElement('input');
    due.type = 'date';
    due.value = t.due || '';
    due.setAttribute('aria-label', 'Due date');

    const actions = document.createElement('div');
    actions.className = 'edit-actions';
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'btn btn-primary btn-sm';
    save.textContent = 'Save';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-ghost btn-sm';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => { editingId = null; render(); });
    actions.append(save, cancel);

    form.append(title, priority, due, actions);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newTitle = title.value.trim();
      if (!newTitle) { title.focus(); return; }
      snapshot();
      const task = tasks.find((x) => x.id === t.id);
      if (task) {
        task.title = newTitle;
        task.priority = priority.value;
        task.due = due.value || null;
      }
      editingId = null;
      persist();
      render();
    });

    setTimeout(() => title.focus(), 0);
    return form;
  }

  function render() {
    const matched = query ? new Set(trie.search(query, 500).map((t) => t.id)) : null;
    const visible = (t) => !matched || matched.has(t.id);

    const active = MinHeap.from(tasks.filter((t) => !t.completed && visible(t)), compare).toSortedArray();
    const done = tasks
      .filter((t) => t.completed && visible(t))
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    els.activeList.textContent = '';
    for (const t of active) els.activeList.appendChild(taskRow(t));
    els.completedList.textContent = '';
    for (const t of done) els.completedList.appendChild(taskRow(t));

    els.emptyState.hidden = tasks.length > 0;
    els.noMatch.hidden = !(query && tasks.length > 0 && active.length === 0 && done.length === 0);
    els.completedWrap.hidden = done.length === 0;
    els.completedCount.textContent = String(done.length);

    // Stats are always global (not filtered by search).
    const allActive = tasks.filter((t) => !t.completed);
    els.statTotal.textContent = String(tasks.length);
    els.statActive.textContent = String(allActive.length);
    els.statDone.textContent = String(tasks.length - allActive.length);
    els.statHigh.textContent = String(allActive.filter((t) => t.priority === 'High').length);

    els.undoBtn.disabled = undoStack.size === 0;
    els.undoCount.textContent = String(undoStack.size);
  }

  /* ---------- Mutations ---------- */

  function addTask(title, priority, due) {
    snapshot();
    tasks.push({ id: uid(), title, priority, due: due || null, created: Date.now(), completed: false });
    persist();
    render();
    toast('Task added: ' + title);
  }

  function toggleTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    snapshot();
    t.completed = !t.completed;
    t.completedAt = t.completed ? Date.now() : null;
    persist();
    render();
  }

  function deleteTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    snapshot();
    tasks = tasks.filter((x) => x.id !== id);
    if (editingId === id) editingId = null;
    persist();
    render();
    toast('Task deleted — hit Undo to bring it back.');
  }

  function doUndo() {
    const snap = undoStack.pop();
    if (snap == null) return;
    try { tasks = JSON.parse(snap); } catch { return; }
    editingId = null;
    persist();
    render();
    toast('Undo — previous state restored.');
  }

  /* ---------- Wiring ---------- */

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.title.value.trim();
    if (!title) {
      els.titleField.classList.add('invalid');
      els.title.focus();
      return;
    }
    els.titleField.classList.remove('invalid');
    addTask(title, els.priority.value, els.due.value);
    els.form.reset();
    els.title.focus();
  });

  els.title.addEventListener('input', () => els.titleField.classList.remove('invalid'));

  els.search.addEventListener('input', () => {
    query = els.search.value.trim();
    render();
  });

  els.undoBtn.addEventListener('click', doUndo);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      doUndo();
    }
  });

  rebuildTrie();
  render();
})();
