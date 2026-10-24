// Voxin Actas v1: la página se busca siempre en internet primero; sin conexión usa la copia guardada.
const CACHE="actas-v1";
const FILES=["./","index.html","manifest.json","icon-192.png","icon-512.png","icon-maskable.png","apple-touch-icon.png",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||(url.origin===location.origin&&/\/(index\.html)?$|manifest\.json$/.test(url.pathname));
  if(isPage){
    e.respondWith(fetch(req,{cache:"no-store"}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req).then(h=>h||caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
});
