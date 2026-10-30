/* Release 3.2 checks for orientation, nested routes, and offline cache integrity. */
(function () {
    'use strict';
    async function cached(path) {
        if (!window.caches || !window.ST || !ST.cacheVersion) return null;
        const script = document.querySelector('script[src$="site.js"]');
        const scope = new URL('./', script ? script.src : location.href).href;
        const cache = await caches.open(ST.cacheVersion);
        const response = await cache.match(new URL(path, scope), { ignoreSearch: true });
        return response ? response.text() : null;
    }
    function add(id, name, run) { window.DIAGNOSTICS_TESTS.push({ id, name, run }); }

    add(54, 'Service worker uses app-root scope', async () => {
        const source = await cached('site.js');
        const ok = !!source && source.includes("new URL('sw.js', runtimeScriptUrl)") && source.includes('scope.pathname');
        return { ok, detail: ok ? 'Worker resolves beside the shared runtime on every route' : 'Root-relative worker registration is missing', probableFix: ok ? '' : 'Resolve sw.js from site.js and register the project-root scope.' };
    });
    add(55, 'Nested Theory Cards registers offline support', async () => {
        const page = await cached('theory-cards/index.html');
        const ok = !!page && page.includes('../site.js') && page.includes('../site.css');
        return { ok, detail: ok ? 'Nested route loads the shared worker registration and orientation styles' : 'Nested route can miss service-worker installation', probableFix: ok ? '' : 'Load the shared local runtime and styles from the nested page.' };
    });
    add(56, 'Landscape default and portrait control', async () => {
        const [manifest, runtime, styles] = await Promise.all([cached('manifest.webmanifest'), cached('site.js'), cached('site.css')]);
        let landscape = false;
        try { landscape = JSON.parse(manifest).orientation === 'landscape'; } catch (e) {}
        const ok = landscape && !!runtime && runtime.includes('st-orientation-toggle') && runtime.includes('Switch to portrait orientation') && !!styles && styles.includes('html.st-orientation-landscape');
        return { ok, detail: ok ? 'PWA defaults to landscape with a reachable portrait switch and CSS fallback' : 'Orientation defaults or fallback control are incomplete', probableFix: ok ? '' : 'Keep landscape in the manifest and expose the persistent portrait toggle.' };
    });
    add(57, 'Offline caches are isolated by app scope', async () => {
        const source = await cached('sw.js');
        const ok = !!source && source.includes('SCOPE_SUFFIX') && source.includes('k.endsWith(SCOPE_SUFFIX)');
        return { ok, detail: ok ? 'Activation only removes stale caches belonging to this app scope' : 'Cache cleanup can remove another app cache on a shared origin', probableFix: ok ? '' : 'Namespace cache versions and cleanup by registration scope.' };
    });
    add(58, 'Failed offline installs cannot leave a ready marker', async () => {
        const source = await cached('sw.js');
        const failedBatchGuard = source && source.includes('if (missing.length) throw new Error');
        const markerAfterGuard = source && source.indexOf('__offline-ready__') > source.indexOf('if (missing.length) throw new Error');
        const rollback = source && source.includes('await caches.delete(VERSION)');
        const ok = !!failedBatchGuard && !!markerAfterGuard && !!rollback;
        return { ok, detail: ok ? 'All retry batches must succeed before readiness; failed installs delete partial caches' : 'Partial cache may be mistaken for a complete offline install', probableFix: ok ? '' : 'Delete failed partial installs and write the readiness marker last.' };
    });
    add(59, 'Offline directory routes resolve to cached index pages', async () => {
        const source = await cached('sw.js');
        const ok = !!source && source.includes("url.pathname.endsWith('/')") && source.includes("directoryPath + 'index.html'");
        return { ok, detail: ok ? 'Nested directory navigations use their cached index document' : 'A cached directory route can fall back to the Home page while offline', probableFix: ok ? '' : 'Try the directory index cache key before using the root navigation fallback.' };
    });
    add(60, 'Mobile safe-area and viewport fallbacks', async () => {
        const [page, styles] = await Promise.all([cached('index.html'), cached('site.css')]);
        const ok = !!page && page.includes('viewport-fit=cover') && !!styles && styles.includes('width:100vh!important') && styles.includes('100dvh');
        return { ok, detail: ok ? 'Notch-safe viewport and legacy-to-dynamic viewport-height fallback are present' : 'iOS safe-area or browser viewport fallback is missing', probableFix: ok ? '' : 'Enable viewport-fit=cover and keep vh before dvh declarations.' };
    });
})();
