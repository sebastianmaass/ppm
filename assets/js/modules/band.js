// Gruppenband: Linie füllt sich beim Scrollen, Knoten blenden per clip-path ein.
export function init() {
  const band = document.querySelector('.band'); if (!band) return;
  const prog = band.querySelector('.band__progress'); const nodes = [...band.querySelectorAll('.band__node')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { nodes.forEach(n => n.classList.add('is-active')); return; }
  const update = () => {
    const r = band.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
    prog.style.height = (p * 100) + '%';
    nodes.forEach(n => n.classList.toggle('is-active', n.getBoundingClientRect().top < vh * .7));
  };
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}
