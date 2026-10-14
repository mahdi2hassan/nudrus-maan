const C='plus-cert-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!/^http/.test(e.request.url))return;
  e.respondWith(caches.open(C).then(async c=>{
    const m=await c.match(e.request);
    const n=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}).catch(()=>m);
    return m||n;
  }));
});
