/* Recursos públicos versionados. O cache não intercepta autenticação ou partidas. */
const CACHE = 'noite-public-23e0b488f8bc';
const ROOT = new URL('./',self.location.href).href;
const SHELL = ['index.html','music-worker.js','manifest.webmanifest','vendor/supabase.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable.png','icons/apple-touch-icon.png'];
const ASSETS = new Set(SHELL.map(path=>new URL(path,ROOT).href));
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...ASSETS])));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys()){
   if(name.startsWith('noite-public-')&&name!==CACHE)await caches.delete(name);
  }
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
 const navigation=request.mode==='navigate';
 if(!navigation&&!ASSETS.has(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=navigation?new URL('index.html',ROOT).href:request;
  const stored=await cache.match(key);
  // A próxima versão é preparada pelo ciclo de atualização do service worker.
  // Aberturas seguintes usam imediatamente o pacote já validado e instalado.
  if(stored)return stored;
  try{
   const response=await fetch(request);
   if(response.ok)await cache.put(key,response.clone());
   return response;
  }catch{
   return new Response('Abra o Noite de Jogos com conexão para preparar o aplicativo.',{
    status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}
   });
  }
 })());
});
