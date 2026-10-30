document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('rn-status');
    const update = async () => {
        let ready = false;
        if (window.ST && 'caches' in window) {
            try {
                const cache = await caches.open(ST.cacheVersion);
                ready = !!(await cache.match(new URL('__offline-ready__', location.href)));
            } catch (e) {}
        }
        el.textContent = (navigator.onLine ? 'Online' : 'Offline') + ' - ' +
            (ready ? 'ready to work offline' : ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) ? 'preparing offline copy…' : 'offline cache unavailable here'));
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', update);
});
