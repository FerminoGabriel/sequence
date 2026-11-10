/* Cache exclusivo dos arquivos públicos. Partidas on-line continuam autoritativas. */
const CACHE = 'noite-public-v20261110-1';
const ROOT = new URL('./', self.location.href).href;
const SHELL = ['index.html','manifest.webmanifest','vendor/supabase.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable.png','icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(path => new URL(path,ROOT).href))));
});
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  for (const name of await caches.keys()) {
   if (name.startsWith('noite-public-') && name !== CACHE) await caches.delete(name);
  }
  await self.clients.claim();
 })());
});
self.addEventListener('message', event => {
 if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
 const request = event.request;
 const url = new URL(request.url);
 if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(ROOT)) return;
 const navigation = request.mode === 'navigate';
 const asset = SHELL.some(path => url.href === new URL(path,ROOT).href);
 if (!navigation && !asset) return;
 event.respondWith((async () => {
  const cache = await caches.open(CACHE);
  if (!navigation) {
   const cached = await cache.match(request);
   if (cached) return cached;
   const response = await fetch(request);
   if (response.ok) await cache.put(request,response.clone());
   return response;
  }
  const canonical = new URL('index.html',ROOT).href;
  let timer;
  const network = fetch(request).then(async response => {
   if (response.ok && response.headers.get('content-type')?.includes('text/html')) await cache.put(canonical,response.clone());
   if (!response.ok) throw Error('Página indisponível');
   return response;
  });
  try {
   return await Promise.race([network,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Rede lenta')),3500);})]);
  } catch {
   return await cache.match(canonical) || new Response('Abra o Noite de Jogos com conexão para preparar o aplicativo.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  } finally {
   clearTimeout(timer);
   // Mantém a atualização do cache viva mesmo quando a página usa a cópia local.
   event.waitUntil(network.catch(()=>{}));
  }
 })());
});
