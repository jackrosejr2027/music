(() => {
  // Service workers only run on http(s) secure origins; from file:// the app already works without one.
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) return;

  // Resolve the worker next to this script, so pages in sub-folders (Fretboard Diagrams/) register the same root worker
  const script = document.currentScript && document.currentScript.src;
  const workerUrl = script ? new URL('service-worker.js', script).href : './service-worker.js';
  // Also install the parent app so links out of Theory Decks work offline.
  const rootWorker = new URL('../sw.js', script || new URL('offline-support.js', location.href));
  const rootRegistration = navigator.serviceWorker.register(rootWorker.href, { scope: new URL('./', rootWorker).pathname, updateViaCache: 'none' }).catch(error => {
    console.error('Full app offline registration failed:', error);
    return null;
  });
  const registration = navigator.serviceWorker.register(workerUrl, { updateViaCache: 'none' }).catch(error => {
    console.error('Offline cache registration failed:', error);
    return null;
  });

  async function waitForCache() {
    await rootRegistration;
    const current = await registration;
    if (!current || navigator.serviceWorker.controller) return;
    const installing = current.installing || current.waiting;
    if (installing) {
      await new Promise(resolve => {
        const finish = () => {
          if (installing.state !== 'activated' && installing.state !== 'redundant') return;
          installing.removeEventListener('statechange', finish);
          resolve();
        };
        finish();
        installing.addEventListener('statechange', finish);
      });
    }
  }
  // Never hold a click for more than 2.5 s, even if caching stalls
  const withTimeout = (promise) => Promise.race([promise, new Promise(resolve => setTimeout(resolve, 2500))]);

  // On the very first visit, let the cache finish before following an in-app page link,
  // so the next page is already available offline.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return; // downloads are not page visits
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || !/\.html$|\/$/.test(url.pathname) || navigator.serviceWorker.controller) return;
    event.preventDefault();
    void withTimeout(waitForCache()).catch(error => {
      console.error('Offline cache is not ready:', error);
    }).finally(() => location.assign(url.href));
  });
})();
