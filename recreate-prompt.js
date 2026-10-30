(() => {
    'use strict';
    const open = document.getElementById('recreate-open');
    const dialog = document.getElementById('recreate-dialog');
    const text = document.getElementById('recreate-text');
    const copy = document.getElementById('recreate-copy');
    const close = document.getElementById('recreate-close');
    let loaded = null;
    const load = () => loaded ??= fetch('recreate-prompt.txt').then(response => response.text()).then(value => { text.value = value; return value; });
    open?.addEventListener('click', () => { load(); dialog.showModal(); text.focus(); });
    close?.addEventListener('click', () => dialog.close());
    copy?.addEventListener('click', async () => {
        const value = await load();
        try { await navigator.clipboard.writeText(value); }
        catch { text.select(); document.execCommand('copy'); }
        copy.textContent = 'Copied';
        setTimeout(() => { copy.textContent = 'Copy prompt'; }, 1400);
    });
})();
