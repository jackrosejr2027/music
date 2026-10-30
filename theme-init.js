// theme-init.js
(function() {
    const THEME_KEY = 'pageTheme';
    const FONT_SIZE_KEY = 'pageFontSize';

    function normalize(val) {
        if (!val) return 'default';
        let s = val.toString();
        if (s.startsWith('theme-')) s = s.substring(6);
        return s || 'default';
    }

    function applyThemeValue(value) {
        const normalized = normalize(value);
        const root = document.documentElement;
        Array.from(root.classList).filter(c => c.startsWith('theme-')).forEach(c => root.classList.remove(c));
        if (normalized !== 'default' && normalized !== '') {
            root.classList.add('theme-' + normalized);
        }
        try { localStorage.setItem(THEME_KEY, normalized); } catch(e) {}
        const sel = document.getElementById('page-theme');
        if (sel) {
            const optExists = Array.from(sel.options).some(o => o.value === normalized);
            if (optExists) sel.value = normalized;
        }
    }

    function applyFontSize(size) {
        const sizeValues = {
            'small': '0.875rem',
            'medium': '1rem',
            'large': '1.125rem',
            'extra-large': '1.25rem'
        };
        document.documentElement.style.fontSize = sizeValues[size] || '1rem';
        try { localStorage.setItem(FONT_SIZE_KEY, size); } catch(e) {}
        const sel = document.getElementById('font-size');
        if (sel) {
            sel.value = size;
        }
    }

    try {
        if (localStorage.getItem('st_orientation') === 'portrait') {
            document.documentElement.classList.add('st-orientation-portrait');
        } else {
            document.documentElement.classList.add('st-orientation-landscape');
        }
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            applyThemeValue(savedTheme);
        } else {
            // default to minimal theme when no saved preference exists
            applyThemeValue('minimal');
        }
        
        const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
        if (savedFontSize) applyFontSize(savedFontSize);
    } catch (e) {}

    document.addEventListener('change', (e) => {
        if (e.target) {
            if (e.target.id === 'page-theme') {
                applyThemeValue(e.target.value);
            } else if (e.target.id === 'font-size') {
                applyFontSize(e.target.value);
            }
        }
    });

    window.applyPageTheme = applyThemeValue;
    window.applyPageFontSize = applyFontSize;
})();