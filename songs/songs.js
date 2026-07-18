/* Workout Playlists — mood filter */
document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('.filter-tag'));
  const cards = Array.from(document.querySelectorAll('.playlist-card'));
  const emptyNote = document.getElementById('empty-note');

  function applyFilter(mood) {
    let visible = 0;
    for (const card of cards) {
      const match = mood === 'all' || card.dataset.mood === mood;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
        // Cards may still be waiting on the scroll-reveal observer;
        // make sure re-shown ones are visible.
        card.classList.add('visible');
      }
    }
    emptyNote.hidden = visible > 0;
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      for (const other of buttons) {
        const active = other === btn;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      }
      applyFilter(btn.dataset.mood);
    });
  }
});
