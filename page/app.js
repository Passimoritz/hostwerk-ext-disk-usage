// Speicher je Dienst – Seite und Kachel
const { html, t, raw } = Hostwerk;
const D = Disk;
const lang = () => Hostwerk.lang;
const REFRESH = 300000;
let lastLoad = 0;
let retryTimer = null;
const FOLDER = raw('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>');

/** Balken mit Wert für Bildschirmleser (role=meter). */
const bar = (pct, label, cls = '') => html`<div class="du-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="${label}"><span class="${cls}" style="${'width:' + pct + '%'}"></span></div>`;

/** Fehler mit „Erneut versuchen“ – auf der Seite als Hinweis, in der Kachel kurz. */
function showError(msg) {
  if (Hostwerk.embed === 'widget') Hostwerk.render('#app', html`<div class="stack du-stack" role="alert"><span class="small c-err">${t('errorShort')}</span><div><button class="btn xs" data-retry>${t('retry')}</button></div></div>`);
  else Hostwerk.render('#app', html`<div class="callout err" role="alert"><div class="grow"><b class="callout-title">${t('errorTitle')}</b><span>${msg}</span></div><button class="btn sm" data-retry>${t('retry')}</button></div>`);
}

/** Verlauf im Speicher der Erweiterung fortschreiben (ohne Speicher-Recht oder bei Fehlern einfach ohne Verlauf). */
async function history(dk) {
  try { const h = D.record(await Hostwerk.storage.get('history'), dk); await Hostwerk.storage.set('history', h); return h; } catch { return []; }
}

/** Kleiner Verlauf als Linie (letzte 30 Tage). */
function spark(points) {
  if (!points || points.length < 2) return '';
  const t0 = points[0].t; const span = points[points.length - 1].t - t0 || 1; const max = Math.max(...points.map((p) => p.total || p.used)) || 1;
  const pts = points.map((p) => `${Math.round(((p.t - t0) / span) * 200)},${Math.round(40 - (p.used / max) * 38)}`).join(' ');
  return html`<svg class="du-spark" viewBox="0 0 200 42" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

function forecastText(f) {
  if (!f) return t('forecastWait');
  if (f.days == null) return t('forecastFlat');
  const days = Math.round(f.days);
  return `${t('perDay', { size: D.bytes(f.perDay, lang()) })} · ${days <= 1 ? t('forecastDay') : t('forecastDays', { n: Hostwerk.fmt.number(days) })}`;
}

async function load() {
  clearTimeout(retryTimer);
  lastLoad = Date.now();
  let d; try { d = await Hostwerk.get('/system/disk-usage'); } catch (e) { showError(e.message); return; }
  if (d.computing && !d.services.length) { Hostwerk.render('#app', html`<div class="muted small">${t('computing')}</div>`); retryTimer = setTimeout(() => { if (!document.hidden) load(); }, 4000); return; }
  const list = D.shares(d.services); const dk = D.disk(d.disk);
  const hist = dk ? await history(dk) : [];
  const fc = D.forecast(hist);
  const driveLabel = dk ? t('drive', { used: D.bytes(dk.used, lang()), total: D.bytes(dk.total, lang()) }) : '';
  if (Hostwerk.embed === 'widget') {
    Hostwerk.render('#app', html`<div class="stack du-stack">${dk ? html`<div class="small">${driveLabel}</div>${bar(dk.pct, driveLabel, dk.level)}${fc && fc.days != null && fc.days < 60 ? html`<div class="tiny c-warn">${forecastText(fc)}</div>` : ''}` : ''}
      ${list.slice(0, 4).map((s) => html`<div class="row-tight small"><span class="grow ellipsis">${s.name}</span><b>${D.bytes(s.bytes, lang())}</b></div>`)}</div>`);
    return;
  }
  const tips = D.tips(list, dk);
  Hostwerk.render('#app', html`
    ${dk ? html`<div class="card card-pad du-gap"><div class="row"><b class="grow">${t('driveTitle')}</b><span class="badge ${dk.level}">${D.percent(dk.pct, lang())}</span></div>${bar(dk.pct, driveLabel, dk.level)}<div class="small muted">${driveLabel} · ${t('free', { free: D.bytes(dk.free, lang()) })}</div>
      <div class="du-trend"><div class="grow"><div class="small"><b>${t('trendTitle')}</b></div><div class="small ${fc && fc.days != null && fc.days < 60 ? 'c-warn' : 'muted'}">${forecastText(fc)}</div></div>${spark(fc && fc.points)}</div></div>` : ''}
    ${tips.length ? html`<div class="card card-pad du-gap"><b>${t('tipsTitle')}</b>${tips.map((x) => html`<div class="row du-tip"><span class="grow small">${x.kind === 'backups' ? t('tipBackups', { name: x.name, size: D.bytes(x.bytes, lang()) }) : t('tipCache')}</span><button class="btn sm" data-go="${x.route}">${x.kind === 'backups' ? t('tipBackupsBtn') : t('tipCacheBtn')}</button></div>`)}</div>` : ''}
    <div class="card">${list.length ? list.map((s) => html`<div class="list-item du-item"><div class="grow du-main"><div class="row-tight"><b class="grow ellipsis">${s.name}</b><span class="small muted">${t('kind.' + s.kind)}</span><span class="small muted" title="${t('shareHint')}">${D.percent(s.pct, lang())}</span><b>${D.bytes(s.bytes, lang())}</b></div>${bar(s.bar, t('shareLabel', { name: s.name, pct: D.percent(s.pct, lang()) }))}<div class="tiny muted">${s.parts.map((p) => `${t('part.' + p.label)}: ${D.bytes(p.bytes, lang())}`).join(' · ')}</div></div><button class="btn ghost sm icon" data-go="${D.route(s)}" title="${t('open', { name: s.name })}" aria-label="${t('open', { name: s.name })}">${FOLDER}</button></div>`) : html`<div class="empty"><p>${t('none')}</p></div>`}</div>
    <p class="tiny muted">${t('hint', { when: d.at ? Hostwerk.fmt.time(d.at) : '–' })}</p>`);
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) { Hostwerk.navigate(go.dataset.go); return; }
  if (e.target.closest('[data-retry]')) load();
});
// Versteckter Reiter oder eingeklappte Übersicht: nicht nachzählen; beim Zurückkommen nachholen, wenn es Zeit ist
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastLoad >= REFRESH) load(); });
Hostwerk.ready().then(() => { load(); setInterval(() => { if (!document.hidden) load(); }, REFRESH); Hostwerk.on('lang', load); });
