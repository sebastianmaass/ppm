// Hell/Dunkel-Umschalter. Gespeichert wird nur die bewusste Wahl der Besucher:in (localStorage "suba-theme").
export function init() {
  const btn = document.querySelector('[data-theme-toggle]'); if (!btn) return;
  const root = document.documentElement;
  const isDark = () => { const t = root.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  const sync = () => { const d = isDark(); btn.setAttribute('aria-pressed', String(d)); btn.setAttribute('aria-label', d ? 'Helles Design einschalten' : 'Dunkles Design einschalten'); };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', next);
    try { localStorage.setItem('suba-theme', next); } catch { /* Speicher gesperrt: egal */ }
    sync();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', sync);
  sync();
}
