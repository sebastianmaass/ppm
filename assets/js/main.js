// ============================================================================
// SUBA Holding: Einstiegspunkt. Lädt nur die Module, die die Seite braucht.
// Ein Baustein bestellt sein Modul mit data-module="name" (siehe /modules).
// ============================================================================
const start = async () => {
  document.documentElement.classList.add('js-ready');
  const wanted = new Set(['theme', 'nav', 'consent', 'reveal', 'fx', 'hero']);
  document.querySelectorAll('[data-module]').forEach(el => el.dataset.module.split(/\s+/).forEach(m => m && wanted.add(m)));
  await Promise.all([...wanted].map(async (name) => {
    try { const mod = await import(`./modules/${name}.js`); mod.init?.(); }
    catch (e) { console.error(`Modul "${name}" konnte nicht geladen werden`, e); }
  }));
};
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
