// Speicher je Dienst – Logik ohne Seite (auch in Node testbar)
(function (root) {
  function bytes(n, lang) { if (n == null || isNaN(n)) return '–'; const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let x = Number(n); while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; } return `${x.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE', { maximumFractionDigits: x >= 10 || i === 0 ? 0 : 1 })} ${u[i]}`; }
  /** Anteile für Balken: je Dienst Prozent vom größten (Balkenlänge) und vom Gesamtverbrauch. */
  function shares(services) {
    const list = (services || []).filter((s) => s.bytes > 0).sort((a, b) => b.bytes - a.bytes);
    const max = list[0] ? list[0].bytes : 1; const sum = list.reduce((a, s) => a + s.bytes, 0) || 1;
    return list.map((s) => ({ ...s, bar: Math.max(2, Math.round((s.bytes / max) * 100)), pct: Math.round((s.bytes / sum) * 1000) / 10 }));
  }
  /** Laufwerk: belegt in Prozent, Warnstufe ab 80 / 90 %. */
  function disk(d) { if (!d || !d.total) return null; const used = d.total - d.free; const pct = Math.round((used / d.total) * 100); return { used, free: d.free, total: d.total, pct, level: pct >= 90 ? 'err' : pct >= 80 ? 'warn' : 'ok' }; }
  const api = { bytes, shares, disk };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Disk = api;
})(typeof window !== 'undefined' ? window : globalThis);
