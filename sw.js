/* Ao alterar o site, incremente VERSION para renovar todos os arquivos. */
const VERSION = 'pao-de-mel-offline-v2';
const BASE = new URL('./', self.location.href);
const FILES = [
  './', './index.html', './style.css', './script.js', './modelo-3d.js',
  './offline.js', './produto.json', './imagens/logo.png',
  './imagens/pao-de-mel.jpg', './imagens/abelha.svg',
  './imagens/tabela-nutricional.jpeg'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(FILES.map(path => new Request(new URL(path, BASE), {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('pao-de-mel-offline-') && name !== VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  // O cache só atende os arquivos deste projeto, nunca outras páginas do domínio.
  const asset = FILES.find(path => new URL(path,BASE).pathname === url.pathname);
  if (!asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const saved = await cache.match(new URL(asset,BASE).href);
    if (saved) return saved;
    return fetch(request);
  })());
});
