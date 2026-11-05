// Berufe-Finder: 4 Fragen, läuft komplett im Browser. Die Berufe kommen aus dem Seiten-HTML (data-finder-data).
const FRAGEN = [
  { q: 'Wo fühlst du dich wohl?', o: [
    ['In der Werkstatt oder Halle', ['praktisch', 'tuefteln', 'elektro']],
    ['Im Büro am Rechner', ['computer', 'kaufmaennisch', 'konstruktion']],
    ['Im Lager, in Bewegung', ['logistik', 'praktisch']]] },
  { q: 'Welche Schulfächer liegen dir?', o: [
    ['Mathe und Physik', ['konstruktion', 'elektro', 'tuefteln']],
    ['Informatik', ['computer']],
    ['Wirtschaft, Deutsch, Englisch', ['kaufmaennisch']],
    ['Werken und Technik', ['praktisch', 'tuefteln', 'logistik']]] },
  { q: 'Wie arbeitest du am liebsten?', o: [
    ['Ganz genau, bis ins Detail', ['tuefteln', 'konstruktion']],
    ['Mit Überblick: planen und organisieren', ['kaufmaennisch', 'logistik']],
    ['Tüfteln, bis es läuft', ['elektro', 'computer', 'praktisch']]] },
  { q: 'Was reizt dich mehr?', o: [
    ['Maschinen zum Laufen bringen', ['praktisch', 'elektro']],
    ['Etwas entwerfen und konstruieren', ['konstruktion', 'tuefteln']],
    ['Abläufe und Zahlen im Griff haben', ['kaufmaennisch', 'logistik']],
    ['IT-Probleme lösen', ['computer']]] },
];
export function init() {
  const root = document.querySelector('[data-module~="finder"]'); if (!root) return;
  const ui = root.querySelector('[data-finder-ui]'); const berufe = JSON.parse(root.querySelector('[data-finder-data]').textContent);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let step = 0; const score = {};
  const start = () => { step = 0; for (const k in score) delete score[k]; ask(); };
  function ask() {
    const f = FRAGEN[step];
    ui.innerHTML = `<div class="finder__bar" aria-hidden="true"><i style="width:${(step / FRAGEN.length) * 100}%"></i></div>
      <p class="coord">Frage ${step + 1} von ${FRAGEN.length}</p>
      <h3 class="finder__q" tabindex="-1">${esc(f.q)}</h3>
      <div class="finder__opts">${f.o.map((o, i) => `<button class="btn btn--secondary finder__opt" type="button" data-i="${i}">${esc(o[0])}</button>`).join('')}</div>`;
    ui.querySelector('.finder__q').focus();
    ui.querySelector('.finder__opts').addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      FRAGEN[step].o[+b.dataset.i][1].forEach(t => { score[t] = (score[t] || 0) + 1; });
      step++; step < FRAGEN.length ? ask() : result();
    });
  }
  function result() {
    const ranked = berufe.map(b => ({ b, s: b.tags.reduce((a, t) => a + (score[t] || 0), 0) })).sort((a, b) => b.s - a.s || a.b.titel.localeCompare(b.b.titel, 'de')).slice(0, 3);
    ui.innerHTML = `<div class="finder__bar" aria-hidden="true"><i style="width:100%"></i></div>
      <h3 class="finder__q" tabindex="-1">Das könnte zu dir passen</h3>
      <ul class="finder__results">${ranked.map(r => `<li><a href="${esc(r.b.url)}"><b>${esc(r.b.titel)}</b><span class="small">${esc(r.b.ort)}</span></a></li>`).join('')}</ul>
      <button class="btn btn--ghost" type="button" data-restart>Noch einmal starten</button>`;
    ui.querySelector('.finder__q').focus();
    ui.querySelector('[data-restart]').addEventListener('click', start);
  }
  ui.innerHTML = `<p class="lead" style="margin-top:0">Vier kurze Fragen, dann zeigen wir dir, welche Ausbildung zu dir passen könnte. Deine Antworten verlassen deinen Browser nicht.</p><button class="btn btn--accent" type="button" data-go>Los geht's <span class="arrow" aria-hidden="true">→</span></button>`;
  ui.querySelector('[data-go]').addEventListener('click', start);
}
