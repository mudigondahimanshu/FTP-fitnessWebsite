/* ============================================================
   FTP · Login page — wires the auth forms to window.FTPAuth.
   Runs after auth.js/app.js (all scripts are defer, this last).
   ============================================================ */

(() => {
  'use strict';

  const auth = window.FTPAuth;
  const app = window.FTPApp;

  const tabs = document.getElementById('authTabs');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const signedIn = document.getElementById('signedIn');
  const note = document.getElementById('authNote');

  /* ---------- field / form error helpers (.field + .error-msg) ---------- */
  function setFieldError(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.add('invalid');
    const el = field.querySelector('.error-msg');
    if (el) el.textContent = msg;
  }

  function clearFieldError(input) {
    const field = input.closest('.field');
    if (field) field.classList.remove('invalid');
  }

  function showFormError(form, msg) {
    const banner = form.querySelector('.form-error');
    if (banner) {
      banner.textContent = msg;
      banner.classList.add('show');
    }
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.field.invalid').forEach((f) => f.classList.remove('invalid'));
    const banner = form.querySelector('.form-error');
    if (banner) banner.classList.remove('show');
  }

  /* Send an FTPAuth error message to the most relevant field, else the banner. */
  function routeAuthError(form, message) {
    const msg = message || 'Something went wrong. Please try again.';
    const lower = msg.toLowerCase();
    let target = null;
    if (lower.includes('email')) target = form.querySelector('input[name="email"]');
    else if (lower.includes('password')) target = form.querySelector('input[name="password"]');
    else if (lower.includes('username') || lower.includes('account')) target = form.querySelector('input[name="username"]');
    if (target) setFieldError(target, msg);
    else showFormError(form, msg);
  }

  /* Clear inline errors as the user types again */
  [loginForm, signupForm].forEach((form) => {
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        clearFieldError(input);
        const banner = form.querySelector('.form-error');
        if (banner) banner.classList.remove('show');
      });
    });
  });

  /* ---------- Login / Sign-up toggle ---------- */
  function setMode(mode) {
    const isLogin = mode === 'login';
    tabs.dataset.mode = mode;
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabSignup.setAttribute('aria-selected', String(!isLogin));
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
    const first = (isLogin ? loginForm : signupForm).querySelector('input');
    if (first) first.focus({ preventScroll: true });
  }
  tabLogin.addEventListener('click', () => setMode('login'));
  tabSignup.addEventListener('click', () => setMode('signup'));
  document.querySelectorAll('[data-switch]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.switch));
  });

  /* ---------- Password show/hide ---------- */
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.pw-wrap').querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('showing', show);
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus({ preventScroll: true });
    });
  });

  /* ---------- Async submit plumbing ---------- */
  async function runAuth(form, busyText, action, welcome) {
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = busyText;
    try {
      const username = await action();
      rememberLastUser(username);
      if (app && app.toast) app.toast(welcome(username));
      btn.textContent = 'Success!';
      setTimeout(() => { window.location.href = '/'; }, 900);
    } catch (err) {
      routeAuthError(form, err && err.message);
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(loginForm);
    if (!auth) return showFormError(loginForm, 'Auth failed to load. Refresh the page and try again.');

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    let valid = true;
    if (!username) { setFieldError(loginForm.username, 'Enter your username.'); valid = false; }
    if (!password) { setFieldError(loginForm.password, 'Enter your password.'); valid = false; }
    if (!valid) return;

    runAuth(
      loginForm,
      'Logging in…',
      () => auth.login({ username, password }),
      (u) => `Welcome back, ${u}! Time to feel the pump.`
    );
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors(signupForm);
    if (!auth) return showFormError(signupForm, 'Auth failed to load. Refresh the page and try again.');

    const username = signupForm.username.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;
    let valid = true;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setFieldError(signupForm.username, 'Username must be 3–20 characters (letters, numbers, underscore).');
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(signupForm.email, 'Enter a valid email address.');
      valid = false;
    }
    if (password.length < 6) {
      setFieldError(signupForm.password, 'Password must be at least 6 characters.');
      valid = false;
    }
    if (!valid) return;

    runAuth(
      signupForm,
      'Creating account…',
      () => auth.register({ username, email, password }),
      (u) => `Welcome to the crew, ${u}! Let's get to work.`
    );
  });

  /* ---------- Already logged in? ---------- */
  function showSignedIn(username) {
    tabs.hidden = true;
    loginForm.hidden = true;
    signupForm.hidden = true;
    note.hidden = true;
    signedIn.hidden = false;
    document.getElementById('signedName').textContent = username;
    document.getElementById('signedAvatar').textContent = username.charAt(0).toUpperCase();
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (auth) auth.logout();
    if (app && app.toast) app.toast('Logged out. Come back soon!');
    setTimeout(() => window.location.reload(), 700);
  });

  /* ---------- Saved accounts: chips + last-username prefill ---------- */
  const LAST_USER_KEY = 'ftp.lastUser.v1';

  function rememberLastUser(username) {
    try { localStorage.setItem(LAST_USER_KEY, username); } catch { /* ignore */ }
  }

  function renderSavedAccounts() {
    const accounts = (auth && auth.knownUsers()) || [];
    if (!accounts.length) return;

    const box = document.createElement('div');
    box.className = 'saved-accounts';
    const label = document.createElement('p');
    label.className = 'saved-label';
    label.textContent = 'Saved on this device — tap to log in:';
    box.appendChild(label);

    const row = document.createElement('div');
    row.className = 'saved-row';
    for (const name of accounts.slice(0, 4)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'saved-chip';
      const avatar = document.createElement('span');
      avatar.className = 'saved-avatar';
      avatar.textContent = name.charAt(0).toUpperCase();
      chip.append(avatar, document.createTextNode(name));
      chip.addEventListener('click', () => {
        setMode('login');
        loginForm.username.value = name;
        clearFieldError(loginForm.username);
        loginForm.password.focus({ preventScroll: true });
      });
      row.appendChild(chip);
    }
    box.appendChild(row);
    tabs.insertAdjacentElement('afterend', box);

    const last = (() => {
      try { return localStorage.getItem(LAST_USER_KEY); } catch { return null; }
    })();
    if (last && accounts.includes(last)) {
      loginForm.username.value = last;
    }
  }

  const user = auth && auth.currentUser();
  if (user) showSignedIn(user);
  else renderSavedAccounts();
})();
