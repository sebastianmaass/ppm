// Einwilligung (selbst gebaut). Standard: nur technisch Notwendiges. Es gibt keine Cookies.
// Gespeichert wird in localStorage "suba-consent" nur, ob externe Medien erlaubt sind.
const KEY = 'suba-consent';
const get = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const set = (media) => { try { localStorage.setItem(KEY, JSON.stringify({ media, v: 1, t: Date.now() })); } catch { /* ignorieren */ } };

function load(el) {
  const f = document.createElement('iframe');
  f.src = el.dataset.embed; f.title = el.dataset.title || 'Eingebetteter Inhalt'; f.loading = 'lazy'; f.className = 'embed-frame';
  f.setAttribute('allow', 'fullscreen; picture-in-picture'); f.setAttribute('referrerpolicy', 'no-referrer'); f.setAttribute('allowfullscreen', '');
  el.replaceChildren(f);
}

export function init() {
  const banner = document.getElementById('consent'); const state = get();
  const gates = [...document.querySelectorAll('[data-embed]')];
  const loadAll = () => gates.forEach(load);
  if (state?.media) loadAll();
  if (banner && !state) { banner.hidden = false; }
  banner?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-consent]'); if (!b) return;
    const media = b.dataset.consent === 'media'; const was = !!get()?.media;
    set(media); banner.hidden = true;
    if (media) loadAll(); else if (was) location.reload();
  });
  banner?.addEventListener('keydown', (e) => { if (e.key === 'Escape') banner.hidden = true; });
  document.querySelectorAll('[data-consent-open]').forEach(b => b.addEventListener('click', () => { if (banner) { banner.hidden = false; banner.querySelector('button')?.focus(); } }));
  gates.forEach(g => {
    g.querySelector('[data-embed-load]')?.addEventListener('click', () => load(g));
    g.querySelector('[data-embed-always]')?.addEventListener('click', () => { set(true); loadAll(); });
  });
}
