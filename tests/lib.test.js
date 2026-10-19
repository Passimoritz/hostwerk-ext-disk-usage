const test = require('node:test');
const assert = require('node:assert');
const D = require('../page/lib.js');

test('Größen lesbar', () => { assert.strictEqual(D.bytes(0), '0 B'); assert.strictEqual(D.bytes(1536), '1,5 KB'); assert.strictEqual(D.bytes(1536, 'en'), '1.5 KB'); assert.strictEqual(D.bytes(5 * 1024 ** 3), '5 GB'); });
test('Anteile: größter Dienst = voller Balken, leere Dienste weg', () => {
  const s = D.shares([{ name: 'a', bytes: 100 }, { name: 'b', bytes: 300 }, { name: 'c', bytes: 0 }]);
  assert.deepStrictEqual(s.map((x) => [x.name, x.bar, x.pct]), [['b', 100, 75], ['a', 33, 25]]);
});
test('Laufwerk mit Warnstufen', () => {
  assert.strictEqual(D.disk({ total: 100, free: 50 }).level, 'ok'); assert.strictEqual(D.disk({ total: 100, free: 15 }).level, 'warn'); assert.strictEqual(D.disk({ total: 100, free: 5 }).level, 'err'); assert.strictEqual(D.disk(null), null);
});
