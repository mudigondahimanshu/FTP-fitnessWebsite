/* About the Author — copy email helper */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('copy-email');
  if (!btn) return;

  const EMAIL = 'himanshumudigonda@gmail.com';

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      if (window.FTPApp) window.FTPApp.toast('Email address copied to clipboard');
    } catch (err) {
      if (window.FTPApp) window.FTPApp.toast('Could not copy — email is ' + EMAIL, 'error');
    }
  });
});
