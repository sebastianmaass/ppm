// Mobile Navigation: Menü-Knopf, Escape schließt, Klick auf Link schließt.
export function init() {
  const header = document.querySelector('.site-header'); const btn = header?.querySelector('.nav-toggle'); if (!btn) return;
  const set = (open) => { header.classList.toggle('is-open', open); document.body.classList.toggle('nav-lock', open); btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); };
  btn.addEventListener('click', () => set(!header.classList.contains('is-open')));
  header.addEventListener('click', (e) => { if (e.target.closest('.nav a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('is-open')) { set(false); btn.focus(); } });
  matchMedia('(min-width: 1061px)').addEventListener?.('change', (m) => { if (m.matches) set(false); });
}
