// "Wir suchen dich"-Ticker: Endlosschleife, Pause per Knopf oder Fokus.
export function init() {
  const tk = document.querySelector('.ticker'); if (!tk) return;
  const track = tk.querySelector('.ticker__track'); const pause = tk.querySelector('.ticker__pause');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [...track.children].map(n => n.cloneNode(true)).forEach(c => { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c); });
  track.style.paddingRight = 'var(--sp-7)';
  pause?.addEventListener('click', () => { const p = tk.classList.toggle('is-paused'); pause.setAttribute('aria-pressed', String(p)); pause.textContent = p ? 'Weiter' : 'Pause'; });
  tk.addEventListener('focusin', () => tk.classList.add('is-paused'));
  tk.addEventListener('focusout', () => { if (pause?.getAttribute('aria-pressed') !== 'true') tk.classList.remove('is-paused'); });
}
