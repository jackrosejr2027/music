/* Scales Thesaurus service worker: install the complete local app before activation. */
importScripts('offline-assets.js');
const VERSION_BASE = self.ST_OFFLINE.version;
const SCOPE_SUFFIX = '-' + encodeURIComponent(new URL(self.registration.scope).pathname);
const VERSION = VERSION_BASE + SCOPE_SUFFIX;
const PRECACHE = self.ST_OFFLINE.assets;
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(VERSION);
        try {
            const cacheOne = async (url) => {
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        await cache.add(new Request(url, { cache: 'reload' }));
                        return true;
                    } catch {
                        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
                    }
                }
                return false;
            };
            const missing = [];
            for (let i = 0; i < PRECACHE.length; i += 8) {
                const batch = PRECACHE.slice(i, i + 8);
                const results = await Promise.all(batch.map(cacheOne));
                batch.forEach((url, index) => { if (!results[index]) missing.push(url); });
            }
            if (missing.length) throw new Error('Offline install incomplete: ' + missing.slice(0, 8).join(', '));
            await cache.put(new URL('__offline-ready__', self.registration.scope), new Response(VERSION));
            await self.skipWaiting();
        } catch (error) {
            await caches.delete(VERSION);
            throw error;
        }
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('st-') && k.endsWith(SCOPE_SUFFIX) && k !== VERSION).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

function bypass(url) {
    return url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.includes('/_embedded_host') || url.pathname.includes('/_websim') || url.searchParams.has('__td_offline_refresh');
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (bypass(url)) return;
    event.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) {
            if (cached.redirected && req.mode === 'navigate') return new Response(await cached.blob(), { status: cached.status, headers: cached.headers });
            return cached;
        }
        if (req.mode === 'navigate') {
            const directoryPath = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
            const directoryIndex = await cache.match(new URL(directoryPath + 'index.html', url.origin), { ignoreSearch: true });
            if (directoryIndex) return directoryIndex;
        }
        try { return await fetch(req); } catch {}
        return new Response('This file is not in the offline copy. Reconnect and let the full app finish installing, or use a complete extracted package on localhost.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    })());
});
