/* Nutrition hub — calorie target calculator + live food table filter */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    setupCalorieCalculator();
    setupFoodFilter();
  });

  /* ---------- Daily calorie target (Mifflin-St Jeor) ---------- */
  function setupCalorieCalculator() {
    const form = document.getElementById('calorie-form');
    if (!form) return;

    const fields = {
      age: { el: document.getElementById('calc-age'), min: 10, max: 100 },
      weight: { el: document.getElementById('calc-weight'), min: 25, max: 300 },
      height: { el: document.getElementById('calc-height'), min: 100, max: 250 },
    };
    const sexEl = document.getElementById('calc-sex');
    const activityEl = document.getElementById('calc-activity');
    const goalEl = document.getElementById('calc-goal');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let valid = true;
      const values = {};
      for (const key of Object.keys(fields)) {
        const { el, min, max } = fields[key];
        const value = parseFloat(el.value);
        const ok = Number.isFinite(value) && value >= min && value <= max;
        el.closest('.field').classList.toggle('invalid', !ok);
        if (!ok) valid = false;
        values[key] = value;
      }
      if (!valid) {
        if (window.FTPApp && window.FTPApp.toast) {
          window.FTPApp.toast('Please fix the highlighted fields.', 'error');
        }
        return;
      }

      // Mifflin-St Jeor BMR
      const base = 10 * values.weight + 6.25 * values.height - 5 * values.age;
      const bmr = sexEl.value === 'male' ? base + 5 : base - 161;
      const maintenance = bmr * parseFloat(activityEl.value);
      const target = Math.max(1200, Math.round(maintenance + parseFloat(goalEl.value)));

      const heightM = values.height / 100;
      const bmi = values.weight / (heightM * heightM);
      // ~1.6 g protein per kg body weight, a solid default for training
      const protein = Math.round(values.weight * 1.6);

      document.getElementById('stat-bmr').textContent = Math.round(bmr).toLocaleString();
      document.getElementById('stat-target').textContent = target.toLocaleString();
      document.getElementById('stat-bmi').textContent = bmi.toFixed(1);
      document.getElementById('stat-protein').textContent = String(protein);
      document.getElementById('calc-results').hidden = false;
    });

    // Clear the error state as soon as the value is corrected
    for (const key of Object.keys(fields)) {
      const { el, min, max } = fields[key];
      el.addEventListener('input', () => {
        const value = parseFloat(el.value);
        if (Number.isFinite(value) && value >= min && value <= max) {
          el.closest('.field').classList.remove('invalid');
        }
      });
    }
  }

  /* ---------- Live food table filter ---------- */
  function setupFoodFilter() {
    const input = document.getElementById('food-search');
    const table = document.getElementById('food-table');
    const empty = document.getElementById('food-empty');
    if (!input || !table) return;

    const rows = Array.from(table.tBodies[0].rows).map((row) => ({
      row,
      text: row.textContent.toLowerCase(),
    }));

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      for (const { row, text } of rows) {
        const match = query === '' || text.includes(query);
        row.hidden = !match;
        if (match) visible += 1;
      }
      if (empty) empty.hidden = visible !== 0;
    });
  }
})();
