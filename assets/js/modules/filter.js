// Filter und Suche für Stellen und Berufe. Gruppen (Chips) wirken zusammen (UND), dazu das Suchfeld.
export function init() {
  document.querySelectorAll('[data-filter-root]').forEach(root => {
    const scope = root.parentElement; // Liste kann neben dem Filter liegen
    const items = [...scope.querySelectorAll('[data-item]')];
    const search = root.querySelector('[data-filter-search]'); const count = root.querySelector('[data-filter-count]');
    const empty = scope.querySelector('[data-filter-empty]');
    const state = {}; const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    root.querySelectorAll('[data-filter-group]').forEach(g => {
      state[g.dataset.filterGroup] = 'alle';
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-value]'); if (!b) return;
        state[g.dataset.filterGroup] = b.dataset.value;
        g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); apply();
      });
    });
    function apply() {
      const q = search ? norm(search.value.trim()) : ''; let n = 0;
      items.forEach(it => {
        let ok = Object.entries(state).every(([k, v]) => v === 'alle' || it.dataset[k] === v);
        if (ok && q && !norm(it.dataset.text || it.textContent).includes(q)) ok = false;
        it.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = `${n} ${n === 1 ? root.dataset.singular : root.dataset.plural}`;
      if (empty) empty.hidden = n > 0;
    }
    search?.addEventListener('input', apply); apply();
  });
}
