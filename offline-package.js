(function () {
    'use strict';

    const buttons = document.querySelectorAll('.offline-package-button');
    if (!buttons.length) return;
    const statuses = document.querySelectorAll('.offline-package-status');

    function report(message, isError) {
        statuses.forEach(status => {
            status.textContent = message;
            status.classList.toggle('is-error', !!isError);
        });
    }

    buttons.forEach(button => button.addEventListener('click', async () => {
        if (button.disabled) return;
        button.disabled = true;
        const original = button.textContent;
        button.textContent = 'Preparing ZIP…';
        report('Checking the complete offline cache…', false);

        try {
            if (!window.JSZip) throw new Error('The bundled ZIP library is unavailable. Reload the app while online.');
            if (!('caches' in window)) throw new Error('This browser does not support the offline cache.');

            const script = document.querySelector('script[src$="site.js"]');
            const scopePath = new URL('./', script ? script.src : location.href).pathname;
            const cacheName = window.ST && ST.cacheVersion;
            if (!cacheName) throw new Error('The shared app runtime is unavailable. Reload Home and wait for the offline-ready notice.');
            if (!(await caches.keys()).includes(cacheName)) {
                throw new Error('Offline cache is not ready. Open Home while online and wait for the offline-ready notice.');
            }
            const cache = await caches.open(cacheName);
            const scope = new URL(scopePath, location.origin).href;
            const ready = await cache.match(new URL('__offline-ready__', scope));
            if (!ready) throw new Error('The full cache is still installing. Wait for the offline-ready notice, then retry.');

            const worker = await cache.match(new URL('offline-assets.js', scope));
            if (!worker) throw new Error('The cached package manifest is missing. Reconnect and reload Home.');
            const source = await worker.text();
            const block = source.match(/assets:\s*(\[[\s\S]*?\])/);
            if (!block) throw new Error('Could not read the offline package manifest.');
            const assets = JSON.parse(block[1]);
            if (!assets.length) throw new Error('The offline package manifest is empty.');

            const zip = new JSZip();
            const added = new Set();
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const encodedPath = asset === './' || asset === '/' ? 'index.html' : asset.replace(/^\.\//, '');
                let path;
                try { path = decodeURIComponent(encodedPath); }
                catch { throw new Error('Invalid encoded path in the offline package manifest.'); }
                if (!path || path.startsWith('/') || path.split('/').includes('..')) {
                    throw new Error('Unsafe path in the offline package manifest.');
                }
                if (added.has(path)) continue;
                const response = await cache.match(new URL(asset, scope), { ignoreSearch: true });
                if (!response) throw new Error('Offline cache is incomplete at ' + path + '. Reconnect and reload Home before packaging.');
                zip.file(path, await response.blob());
                added.add(path);
                if (i % 20 === 0) report('Adding app files… ' + Math.min(i + 1, assets.length) + ' of ' + assets.length, false);
            }

            zip.file('OFFLINE-START-HERE.txt', [
                'SCALES THESAURUS 3.2 THETA OFFLINE PACKAGE',
                '',
                'This archive contains the complete local app and its bundled libraries.',
                'index.html opens Home; choose Fretboard for the instrument or DAW for Pattern Studio.',
                'Extract the entire archive and preserve its folder structure.',
                'For reliable use, serve the extracted folder on localhost (no internet is needed).',
                'Example with Python installed: python -m http.server 8000',
                'Then open http://localhost:8000/index.html in your browser.',
                'Direct file:// opening is not fully supported: modules, fetch and browser storage policies vary.',
                'A file:// copy cannot register a service worker or receive app updates.',
                '',
                'iPhone / iPad: for reliable offline use, open the hosted HTTPS app in Safari while online,',
                'choose Share > Add to Home Screen, then open that installed app once until offline-ready.',
                'iOS Files previews and Safari local-file script policies vary; this ZIP is not an iOS installer,',
                'and opening the extracted index.html from Files is not guaranteed to run the multi-file app.',
                '',
                'After extraction, keep all included files and folders together.'
            ].join('\n'));

            report('Compressing ' + added.size + ' app files…', false);
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 5 }
            }, metadata => {
                if (metadata.percent > 0) report('Compressing offline package… ' + Math.round(metadata.percent) + '%', false);
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Scales-Thesaurus-3.2-theta-offline.zip';
            link.rel = 'noopener';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            report('Offline ZIP ready: ' + added.size + ' app files plus the start guide.', false);
        } catch (error) {
            console.warn('Offline package creation failed:', error);
            report(error && error.message ? error.message : 'Could not create the offline package.', true);
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    }));
})();
