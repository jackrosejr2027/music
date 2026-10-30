importScripts('../offline-assets.js', 'offline-assets.js');
const { cache: CACHE_NAME, assets: ASSETS, optional: OPTIONAL_ASSETS } = self.TD_OFFLINE;
const CACHE_SUFFIX = '-' + encodeURIComponent(new URL('./', self.location.href).pathname);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheOne = async url => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await cache.add(new Request(url, { cache: 'reload' }));
          return true;
        } catch {
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
        }
      }
      return false;
    };
    try {
      const missing = [];
      for (let i = 0; i < ASSETS.length; i += 6) {
        const batch = ASSETS.slice(i, i + 6);
        const results = await Promise.all(batch.map(cacheOne));
        batch.forEach((url, index) => { if (!results[index]) missing.push(url); });
      }
      if (missing.length) throw new Error('Offline install incomplete: ' + missing.slice(0, 5).join(', '));
      for (let i = 0; i < OPTIONAL_ASSETS.length; i += 6) {
        await Promise.all(OPTIONAL_ASSETS.slice(i, i + 6).map(cacheOne));
      }
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('theory-decks-offline-') && name.endsWith(CACHE_SUFFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

// The Settings page asks for the cache name and progress
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'td-offline-info' && event.source) event.source.postMessage({ type: 'td-offline-info', cache: CACHE_NAME });
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin || (request.cache === 'reload' && requestUrl.searchParams.has('__td_offline_refresh'))) return;
  // Chrome throws on these (DevTools, some extensions); let the browser handle them
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

  // Serve saved files immediately; an offline launch should never wait for a network timeout.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      if (cached.redirected && request.mode === 'navigate') return new Response(await cached.blob(), { status: cached.status, headers: cached.headers });
      return cached;
    }
    if (request.mode === 'navigate') {
      const alt = requestUrl.pathname.endsWith('/') ? await cache.match(requestUrl.pathname + 'index.html', { ignoreSearch: true }) : null;
      if (alt) return alt;
    }
    try { return await fetch(request); } catch {}
    return new Response('This file is not in the offline copy yet. Open Settings while online to refresh the offline package.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
