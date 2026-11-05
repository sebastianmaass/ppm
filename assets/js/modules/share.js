// Teilen-Button: Teilen-Dialog des Geräts, sonst Link kopieren.
export function init() {
  document.querySelectorAll('[data-share]').forEach(b => b.addEventListener('click', async () => {
    const data = { title: b.dataset.title, url: b.dataset.url || location.href };
    const st = b.parentElement.querySelector('[data-share-status]');
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); if (st) st.textContent = 'Link kopiert.'; }
    } catch (e) { if (e.name !== 'AbortError' && st) st.textContent = 'Link: ' + data.url; }
  }));
}
