// Interaktive Gruppenstruktur: Klick auf einen Knoten zeigt Kurzinfo und Link.
export function init() {
  document.querySelectorAll('[data-module~="structure"]').forEach(root => {
    const nodes = [...root.querySelectorAll('[data-node]')]; const panel = root.querySelector('[data-panel]');
    const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    nodes.forEach(n => n.addEventListener('click', () => {
      nodes.forEach(x => x.setAttribute('aria-pressed', String(x === n)));
      const d = n.dataset;
      panel.innerHTML = `<h3>${esc(d.name)}</h3><p class="label">${esc(d.ort)}</p><p>${esc(d.text)}</p>` +
        (d.link ? `<p><a class="btn btn--secondary" href="${esc(d.link)}" target="_blank" rel="noopener">Website öffnen <span aria-hidden="true">↗</span><span class="sr-only">(öffnet in neuem Tab)</span></a></p>` : '');
    }));
  });
}
