// Both installers and ZIP downloads use the complete parent-app manifest.
(function (scope) {
  const manifest = scope.ST_OFFLINE;
  if (!manifest) throw new Error('The shared offline manifest is missing.');
  const scriptUrl = scope.document ? scope.document.currentScript.src : scope.location.href;
  const suffix = '-' + encodeURIComponent(new URL('./', scriptUrl).pathname);
  scope.TD_OFFLINE = {
    version: 'I',
    cache: 'theory-decks-offline-' + manifest.version + suffix,
    assets: [...new Set(manifest.assets.map(asset => '../' + (asset === './' ? 'index.html' : asset)))],
    optional: []
  };
})(typeof self !== 'undefined' ? self : window);
