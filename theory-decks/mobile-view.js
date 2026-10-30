(function () {
  'use strict';
  const key = 'td-mobile-view';
  const button = document.getElementById('mobile-view-toggle');
  let enabled = false;

  // A deliberate choice follows in-app navigation, but never changes the next fresh/reloaded visit.
  try {
    const navigation = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const legacyReload = performance.navigation && performance.navigation.type === 1;
    const type = navigation ? navigation.type : legacyReload ? 'reload' : 'navigate';
    const wasEnabled = sessionStorage.getItem(key) === '1';
    enabled = type !== 'reload' && wasEnabled;
    if (type === 'reload') sessionStorage.removeItem(key);
  } catch { /* private browsing can disable storage; desktop remains the default */ }

  function apply() {
    document.body.classList.toggle('mobile-mode', enabled);
    if (button) {
      button.textContent = enabled ? 'Desktop view' : 'Mobile view';
      button.setAttribute('aria-pressed', String(enabled));
    }
  }

  apply();
  if (button) button.addEventListener('click', function () {
    enabled = !enabled;
    try {
      if (enabled) sessionStorage.setItem(key, '1');
      else sessionStorage.removeItem(key);
    } catch { /* the view still changes for this page */ }
    apply();
  });
})();
