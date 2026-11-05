// Hero-Video: bei reduzierter Bewegung angehalten, Pause-Knopf für alle (WCAG 2.2.2).
export function init() {
  const v = document.querySelector('.hero video'); const btn = document.querySelector('[data-hero-toggle]'); if (!v) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => { const paused = v.paused; if (btn) { btn.setAttribute('aria-pressed', String(paused)); btn.setAttribute('aria-label', paused ? 'Hintergrundvideo abspielen' : 'Hintergrundvideo anhalten'); btn.textContent = paused ? '▶' : '❚❚'; } };
  if (reduce) v.pause();
  btn?.addEventListener('click', () => { v.paused ? v.play() : v.pause(); sync(); });
  v.addEventListener('pause', sync); v.addEventListener('play', sync); sync();
}
