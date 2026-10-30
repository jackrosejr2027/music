(() => {
    'use strict';
    const button = document.getElementById('enter-app');
    const screen = document.getElementById('entry-screen');
    const app = document.querySelector('.app-container');
    const enter = () => {
        document.body.classList.remove('awaiting-entry');
        document.body.classList.add('entered-app');
        app?.removeAttribute('inert');
        screen?.classList.add('is-leaving');
        window.setTimeout(() => screen?.remove(), 260);
    };
    button?.addEventListener('click', enter);
    button?.focus({ preventScroll: true });
})();
