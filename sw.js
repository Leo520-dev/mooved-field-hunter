self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',function(e){
  e.respondWith(
    fetch(e.request).catch(function(){
      return new Response('You are offline. Some features may not be available.',{status:200,headers:{'Content-Type':'text/plain'}});
    })
  );
});
