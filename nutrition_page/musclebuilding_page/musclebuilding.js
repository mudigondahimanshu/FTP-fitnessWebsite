/* Muscle building plan — confirm PDF download with a toast */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[download]').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.FTPApp && window.FTPApp.toast) {
          window.FTPApp.toast('Lean Muscle Diet Plan PDF is downloading.');
        }
      });
    });
  });
})();
