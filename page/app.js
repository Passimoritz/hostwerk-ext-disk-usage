// Speicher je Dienst – Seite und Kachel
const { html, t } = Hostwerk;
const D = Disk;
const lang = () => Hostwerk.info().lang;
async function load() {
  let d; try { d = await Hostwerk.get('/system/disk-usage'); } catch (e) { Hostwerk.render('#app', html`<div class="empty"><p>${e.message}</p></div>`); return; }
  if (d.computing && !d.services.length) { Hostwerk.render('#app', html`<div class="muted small">${t('computing')}</div>`); setTimeout(load, 4000); return; }
  const list = D.shares(d.services); const dk = D.disk(d.disk);
  const bar = (pct, cls = '') => html`<div class="du-bar"><span class="${cls}" style="${'width:' + pct + '%'}"></span></div>`;
  if (Hostwerk.embed === 'widget') {
    Hostwerk.render('#app', html`<div class="stack" style="gap:6px">${dk ? html`<div class="small">${t('drive', { used: D.bytes(dk.used, lang()), total: D.bytes(dk.total, lang()) })}</div>${bar(dk.pct, dk.level)}` : ''}
      ${list.slice(0, 4).map((s) => html`<div class="row-tight small"><span class="grow ellipsis">${s.name}</span><b>${D.bytes(s.bytes, lang())}</b></div>`)}</div>`);
    return;
  }
  Hostwerk.render('#app', html`
    ${dk ? html`<div class="card card-pad" style="margin-bottom:14px"><div class="row"><b class="grow">${t('driveTitle')}</b><span class="badge ${dk.level}">${dk.pct} %</span></div>${bar(dk.pct, dk.level)}<div class="small muted">${t('drive', { used: D.bytes(dk.used, lang()), total: D.bytes(dk.total, lang()) })} · ${t('free', { free: D.bytes(dk.free, lang()) })}</div></div>` : ''}
    <div class="card">${list.length ? list.map((s) => html`<div class="list-item" style="align-items:flex-start"><div class="grow" style="min-width:0"><div class="row-tight"><b class="grow ellipsis">${s.name}</b><span class="small muted">${t('kind.' + s.kind)}</span><b>${D.bytes(s.bytes, lang())}</b></div>${bar(s.bar)}<div class="tiny muted">${s.parts.map((p) => `${t('part.' + p.label)}: ${D.bytes(p.bytes, lang())}`).join(' · ')}</div></div></div>`) : html`<div class="empty"><p>${t('none')}</p></div>`}</div>
    <p class="tiny muted">${t('hint', { when: d.at ? new Date(d.at).toLocaleTimeString() : '–' })}</p>`);
}
Hostwerk.ready().then(() => { load(); setInterval(load, 300000); Hostwerk.on('lang', load); });
