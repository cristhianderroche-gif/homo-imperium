/* Homo Imperium: guarda la app en el teléfono para jugar sin internet */
const V='hi-v66';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./privacidad.html'];
// al instalar una versión nueva, se baja todo fresco (sin copias viejas del navegador)
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin)return; // servidor del juego y demás: siempre directo por internet
  if(/metricas\.html$/.test(u.pathname))return; // el panel de métricas nunca se guarda
  if(r.mode==='navigate'){
    // páginas: primero internet (para recibir actualizaciones); sin internet, la copia guardada de esa misma página
    const key=/\/(index\.html)?$/.test(u.pathname)?'./index.html':r;
    // pregunta siempre si hay versión nueva (si no cambió, la respuesta es mínima)
    e.respondWith(fetch(new Request(r.url,{cache:'no-cache',credentials:'same-origin'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(key,cp));}return res;})
      .catch(()=>caches.match(key).then(m=>m||caches.match('./index.html'))));return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;})));
});
