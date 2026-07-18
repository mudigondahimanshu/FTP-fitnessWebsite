/* ============================================================
   FTP · Auth (client-side, demo-grade)
   Static hosting has no server, so accounts live in this
   browser's localStorage. Passwords are salted + SHA-256
   hashed via Web Crypto before storage — never kept in
   plain text. Do not reuse a real password here.
   ============================================================ */

const FTPAuth = (() => {
  const USERS_KEY = 'ftp.users.v1';
  const SESSION_KEY = 'ftp.session.v1';

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function hash(password, salt) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function randomSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function register({ username, email, password }) {
    username = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      throw new Error('Username must be 3–20 characters (letters, numbers, underscore).');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const users = loadUsers();
    const key = username.toLowerCase();
    if (users[key]) throw new Error('That username is already taken.');

    const salt = randomSalt();
    users[key] = {
      username,
      email: email.trim(),
      salt,
      hash: await hash(password, salt),
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
    setSession(username);
    return username;
  }

  async function login({ username, password }) {
    const users = loadUsers();
    const record = users[username.trim().toLowerCase()];
    if (!record) throw new Error('No account found with that username. Sign up first.');
    const candidate = await hash(password, record.salt);
    if (candidate !== record.hash) throw new Error('Incorrect password. Try again.');
    setSession(record.username);
    return record.username;
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      username,
      loggedInAt: new Date().toISOString(),
    }));
  }

  function currentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY))?.username || null; }
    catch { return null; }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  return { register, login, logout, currentUser };
})();

window.FTPAuth = FTPAuth;
