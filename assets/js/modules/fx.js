// Desktop-Effekte: Licht-Reflex, Magnet-Buttons, Cursor. Nur mit Maus und ohne reduzierte Bewegung.
export function init() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.hero, .glow').forEach(g => {
    g.classList.add('glow');
    g.addEventListener('pointermove', (e) => { const r = g.getBoundingClientRect(); g.style.setProperty('--gx', (e.clientX - r.left) + 'px'); g.style.setProperty('--gy', (e.clientY - r.top) + 'px'); g.classList.add('is-lit'); });
    g.addEventListener('pointerleave', () => g.classList.remove('is-lit'));
  });
  document.querySelectorAll('.btn--magnet').forEach(b => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .18) + 'px'); b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .28) + 'px'); });
    b.addEventListener('pointerleave', () => { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
  });
  const cur = document.getElementById('cursor'); if (!cur) return;
  addEventListener('pointermove', (e) => { cur.classList.add('is-on'); cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; cur.classList.toggle('is-big', !!e.target.closest('a,button,.chip,summary')); }, { passive: true });
  document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
}
