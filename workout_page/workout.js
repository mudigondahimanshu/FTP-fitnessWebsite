/* Workout hub — live muscle-group filter powered by window.FTPDSA.Trie. */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('muscle-filter');
  const cards = Array.from(document.querySelectorAll('#muscle-grid [data-muscle]'));
  const empty = document.getElementById('filter-empty');
  if (!input || cards.length === 0 || !window.FTPDSA) return;

  const SYNONYMS = {
    chest: 'chest pecs pectorals bench press push-ups dips flyes upper lower',
    back: 'back lats traps trapezius rhomboids rows pull-ups deadlifts lower',
    legs: 'legs quads quadriceps hamstrings glutes calves squats lunges leg press lower body',
    shoulders: 'shoulders delts deltoids front lateral rear raises overhead press',
    arms: 'arms biceps triceps forearms curls extensions grip upper',
    core: 'core abs abdominals obliques planks crunches six-pack stability twists',
  };

  const trie = new window.FTPDSA.Trie();
  for (const card of cards) {
    const key = card.dataset.muscle;
    trie.insert(SYNONYMS[key] || key, key);
  }

  input.addEventListener('input', () => {
    const query = input.value.trim();
    let visible = 0;
    if (query === '') {
      cards.forEach((card) => { card.hidden = false; });
      visible = cards.length;
    } else {
      const matches = new Set(trie.search(query, cards.length));
      cards.forEach((card) => {
        const show = matches.has(card.dataset.muscle);
        card.hidden = !show;
        if (show) visible += 1;
      });
    }
    empty.hidden = visible !== 0;
  });
});
