// Lagekarte: Pins zeigen beim Hover, Fokus oder Klick Firmenname und Link. Die Liste darunter ist die barrierefreie Alternative.
export function init() {
  document.querySelectorAll('[data-module~="map"]').forEach(root => {
    const map = root.querySelector('.map'); const pins = [...map.querySelectorAll('.map__pin')];
    const tips = new Map(pins.map(p => [p, map.querySelector('#' + p.getAttribute('aria-controls'))]));
    let timer;
    const close = () => pins.forEach(p => { p.setAttribute('aria-expanded', 'false'); tips.get(p).hidden = true; });
    const open = (p) => { clearTimeout(timer); close(); p.setAttribute('aria-expanded', 'true'); tips.get(p).hidden = false; };
    pins.forEach(p => {
      p.addEventListener('click', () => p.getAttribute('aria-expanded') === 'true' ? close() : open(p));
      p.addEventListener('mouseenter', () => open(p)); p.addEventListener('focus', () => open(p));
      const later = () => { timer = setTimeout(close, 400); };
      p.addEventListener('mouseleave', later); tips.get(p).addEventListener('mouseenter', () => clearTimeout(timer)); tips.get(p).addEventListener('mouseleave', later);
    });
    map.addEventListener('focusout', (e) => { if (!map.contains(e.relatedTarget)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', (e) => { if (!map.contains(e.target)) close(); });
  });
}
