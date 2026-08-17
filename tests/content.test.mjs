import assert from 'node:assert/strict';
import test from 'node:test';
import { getFeed } from '../src/services/content/index.ts';
import { deduplicateContent } from '../src/services/content/deduplicate.ts';
import { validateContentItem } from '../src/services/content/validate.ts';

test('normaliza el feed local sin alterar su orden editorial', () => {
  const feed = getFeed();
  assert.equal(feed.length, 16);
  assert.deepEqual(feed.slice(0, 5).map((item) => item.id), [
    'article-a-las-armas', 'iduar-01', 'iduar-02', 'iduar-03', 'iduar-04'
  ]);
  assert.equal(feed[0].title, 'A las armas las carga el narco');
  assert.equal(feed[0].sourceLabel, 'Artículo');
  assert.equal(feed[1].sourceLabel, 'IDUAR · Moreno');
  assert.equal(feed.filter((item) => item.source === 'article').length, 8);
  assert.equal(feed.filter((item) => item.source === 'iduar').length, 4);
  assert.equal(feed.filter((item) => item.integrationStatus === 'pending').length, 4);
});

test('todos los contenidos tienen autor, procedencia y categoría de interfaz', () => {
  getFeed().forEach((item) => {
    assert.ok(item.author.name);
    assert.ok(item.provenance.provider);
    assert.ok(['artículos', 'gestión', 'redes'].includes(item.feedCategory));
  });
});

test('elimina entradas repetidas por URL canónica aunque tengan distinto ID', () => {
  const original = getFeed()[0];
  const duplicate = { ...original, id: 'otra-fuente-misma-nota' };
  assert.equal(deduplicateContent([original, duplicate]).length, 1);
});

test('rechaza una integración pendiente marcada incorrectamente como verificada', () => {
  const pending = { ...getFeed().find((item) => item.integrationStatus === 'pending'), verified: true };
  assert.throws(() => validateContentItem(pending), /pendiente no puede estar verificada/);
});
