/**
 * Scales Thesaurus v1.0 - shared site runtime (all pages)
 * - Unified, up-to-date navigation on every page (incl. mobile menu)
 * - Offline support via service worker registration
 * - Local progress tracking (streak, practice time, page visits)
 * - Safe download helper used by every exporter
 */
(function () {
    'use strict';
    var VERSION = '1.0.1';
    var runtimeScript = document.currentScript;
    var runtimeScriptUrl = runtimeScript && runtimeScript.src || location.href;
    var NAV_ONLY = !!(runtimeScript && runtimeScript.hasAttribute('data-nav-only'));
    var CACHE_SCOPE = new URL('./', runtimeScriptUrl);
    var CACHE_VERSION = 'st-1.0.1-r102-' + encodeURIComponent(CACHE_SCOPE.pathname);
    var ST = window.ST = window.ST || {};
    ST.version = VERSION;
    ST.cacheVersion = CACHE_VERSION;

    // ---------- Storage helpers ----------
    ST.getJSON = function (key, fallback) {
        try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    };
    ST.setJSON = function (key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { console.warn('Storage full or unavailable', e); return false; }
    };
    ST.escape = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    };
    ST.safeName = function (s) {
        return String(s || 'export').replace(/#/g, 'sharp').replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_').slice(0, 120);
    };

    ST.favorites = (function () {
        var key = 'st_favorites_v1';
        function normalize(item) {
            if (!item || typeof item !== 'object' || typeof item.type !== 'string' || typeof item.id !== 'string' || typeof item.title !== 'string') return null;
            var type = item.type.trim(), id = item.id.trim(), title = item.title.trim();
            if (!/^[a-z0-9_-]{1,48}$/i.test(type) || !id || id.length > 512 || !title || title.length > 180) return null;
            var href = typeof item.href === 'string' ? item.href.slice(0, 2048) : '';
            if (href) {
                try {
                    var target = new URL(href, location.href);
                    if (target.origin !== location.origin || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.indexOf('//') === 0) href = '';
                } catch (error) { href = ''; }
            }
            var record = { type: type, id: id, title: title, href: href, data: item.data == null ? null : item.data, updated: Number(item.updated) || Date.now() };
            try { if (JSON.stringify(record).length > 131072) return null; } catch (error) { return null; }
            return record;
        }
        function list() {
            var stored = ST.getJSON(key, []);
            return Array.isArray(stored) ? stored.slice(0, 5000).map(normalize).filter(Boolean) : [];
        }
        function notify() {
            try { window.dispatchEvent(new CustomEvent('st:favoriteschange')); } catch (error) {}
        }
        window.addEventListener('pageshow', function (event) { if (event.persisted) notify(); });
        return {
            key: key,
            list: list,
            has: function (type, id) { return list().some(function (item) { return item.type === type && item.id === String(id); }); },
            toggle: function (item) {
                if (!item || item.id == null) return { ok: false, saved: false };
                var record = normalize(item);
                if (!record) return { ok: false, saved: false };
                var type = record.type, id = record.id;
                var items = list(), index = items.findIndex(function (entry) { return entry.type === type && entry.id === id; });
                var saved = index === -1;
                if (!saved) items.splice(index, 1);
                else {
                    record.updated = Date.now();
                    if (items.length >= 5000) return { ok: false, saved: false };
                    items.push(record);
                }
                if (!ST.setJSON(key, items)) return { ok: false, saved: !saved };
                notify();
                return { ok: true, saved: saved };
            },
            remove: function (type, id) {
                var items = list(), next = items.filter(function (item) { return item.type !== type || item.id !== String(id); });
                if (items.length === next.length) return true;
                if (!ST.setJSON(key, next)) return false;
                notify();
                return true;
            },
            replace: function (items) {
                if (!Array.isArray(items) || items.length > 5000) return false;
                var normalized = items.map(normalize);
                if (normalized.some(function (item) { return !item; }) || !ST.setJSON(key, normalized)) return false;
                notify();
                return true;
            }
        };
    })();

    // ---------- Downloads (works offline; Blob or data URL) ----------
    ST.download = function (data, filename) {
        var url = data, revoke = false;
        if (data instanceof Blob) { url = URL.createObjectURL(data); revoke = true; }
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { a.remove(); if (revoke) URL.revokeObjectURL(url); }, 60000);
    };

    ST.toast = function (msg, ms) {
        var t = document.createElement('div');
        t.className = 'st-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('show'); });
        setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, ms || 2600);
    };

    // ---------- Navigation ----------
    var NAV = [
        { href: 'index.html', label: 'Home', icon: 'home' },
        { label: 'Play', icon: 'play', children: [
            { href: 'fretboard.html', label: 'Neck Diagram Explorer', icon: 'fretboard' },
            { href: 'daw.html', label: 'Pattern Studio', icon: 'daw' },
            { href: 'theory-decks/index.html', label: 'Theory Decks Home', icon: 'cards' },
            { href: 'andalusian.html', label: 'Andalusian Cadence', icon: 'chords' },
            { href: 'cadence-map/index.html', label: 'Cadence Map', icon: 'chords' },
            { href: 'theory-decks/play.html', label: 'Practice Decks', icon: 'play' },
            { href: 'theory-decks/daw.html', label: 'Theory Decks DAW', icon: 'daw' },
            { href: 'theory-decks/reference.html', label: 'Theory Reference', icon: 'learn' },
            { href: 'theory-decks/Fretboard%20Diagrams/index.html', label: 'Theory Decks Fretboard', icon: 'fretboard' },
            { href: 'dummy.html', label: 'Chord Progressions', icon: 'chords' }
        ] },
        { label: 'Explore', icon: 'scales', children: [
            { href: 'scales.html', label: 'Scales', icon: 'scales' },
            { href: 'chords.html', label: 'Chords', icon: 'chords' },
            { href: 'intervals.html', label: 'Intervals', icon: 'intervals' },
            { href: 'theory-cards/index.html', label: 'Theory Cards', icon: 'cards' },
            { href: 'data.html', label: 'Application Data', icon: 'table' }
        ] },
        { label: 'Learn', icon: 'learn', children: [
            { href: 'lessons.html', label: 'Lessons', icon: 'lessons' },
            { href: 'courses.html', label: 'Courses', icon: 'courses' },
            { href: 'coursesquizzes.html', label: 'Quizzes', icon: 'quiz' },
            { href: 'coursestests.html', label: 'Tests', icon: 'tests' },
            { href: 'coursesexams.html', label: 'Exams', icon: 'exam' },
            { href: 'practice.html', label: 'Practice', icon: 'practice' },
            { href: 'primer.html', label: 'Primer', icon: 'learn' },
            { href: 'ebooks.html', label: 'eBooks (PDF)', icon: 'ebooks' },
            { href: 'coursesideas.html', label: 'Ideas & Notes', icon: 'ideas' }
        ] },
        { label: 'My Space', icon: 'favorites', children: [
            { href: 'favorites.html', label: 'Favorites', icon: 'favorites' },
            { href: 'progress.html', label: 'Progress', icon: 'progress' },
            { href: 'settings.html', label: 'Settings', icon: 'settings' }
        ] },
        { label: 'More', icon: 'about', children: [
            { href: 'site-map.html', label: 'Site Map', icon: 'table' },
            { href: 'testing.html', label: 'In dept testing', icon: 'tests' },
            { href: 'about.html', label: 'About', icon: 'about' },
            { href: 'release-notes.html', label: 'Release Notes', icon: 'release', cls: 'st-rn' }
        ] }
    ];
    ST.NAV = NAV;

    var NAV_ICON_PATHS = {
        home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/>',
        fretboard: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M13 4v16M17 4v16M3 9h18M3 14h18"/>',
        daw: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v9M11 4v9M15 4v9M19 4v9M7 13h12"/>',
        scales: '<path d="M4 19V5M4 19h16M7 16l3-5 3 2 5-7"/><circle cx="7" cy="16" r="1"/><circle cx="10" cy="11" r="1"/><circle cx="13" cy="13" r="1"/><circle cx="18" cy="6" r="1"/>',
        chords: '<path d="M9 18V5l12-2v13"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="18" cy="16" rx="3" ry="2"/>',
        intervals: '<path d="M4 8h16M4 16h16M8 4 4 8l4 4M16 12l4 4-4 4"/>',
        cards: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M12 9h5M12 13h5"/>',
        learn: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22z"/>',
        lessons: '<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
        courses: '<path d="M5 4h15v16H5zM2 7v14h15M8 8h9M8 12h9M8 16h6"/>',
        quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.5 1.8c-1.3 1.2-2 1.6-2 3.2M12 17.5v.1"/>',
        tests: '<path d="m4 7 2 2 3-3M11 7h9M4 14l2 2 3-3M11 14h9M4 20h16"/>',
        exam: '<circle cx="12" cy="8" r="5"/><path d="m8 12-1 9 5-3 5 3-1-9"/>',
        practice: '<path d="M4 20a8 8 0 1 1 16 0M12 12l4-4M12 4v2M4 12h2M18 12h2"/><circle cx="12" cy="12" r="1"/>',
        ebooks: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5A2.5 2.5 0 0 1 21 23z"/>',
        favorites: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
        progress: '<path d="M4 20V12M10 20V5M16 20v-8M22 20V8"/>',
        table: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>',
        ideas: '<path d="m4 16-.8 4.8L8 20l11-11-4-4zM13.5 6.5l4 4M4 4h6M4 8h4"/>',
        settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="11" cy="18" r="2" fill="currentColor"/>',
        about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
        release: '<path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h8"/>',
        play: '<path d="M7 4.5a1 1 0 0 1 1.5-.86l11 7.5a1 1 0 0 1 0 1.72l-11 7.5A1 1 0 0 1 7 19.5z"/>',
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
    };
    function makeNavIcon(name) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('class', 'st-icon');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.8');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = NAV_ICON_PATHS[name] || NAV_ICON_PATHS.about;
        return svg;
    }
    function appendNavContent(target, item) {
        target.appendChild(makeNavIcon(item.icon));
        var label = document.createElement('span');
        label.className = 'st-nav-label';
        label.textContent = item.label;
        target.appendChild(label);
    }
    function navHref(href) {
        return new URL(href, new URL('./', runtimeScriptUrl)).href;
    }
    function currentPage() {
        var path = location.pathname.toLowerCase();
        if (path.indexOf('/theory-cards/') !== -1) return 'theory-cards/' + (path.split('/').pop() || 'index.html');
        if (path.indexOf('/theory-decks/') !== -1) return 'theory-decks/' + (path.split('/').pop() || 'index.html');
        return path.split('/').pop() || 'index.html';
    }
    function isCurrentPage(href) {
        function pathKey(path) {
            var value = decodeURIComponent(path).replace(/\/+$/, '').toLowerCase();
            if (!value || !/\.[a-z0-9]+$/.test(value)) value += '/index.html';
            return value;
        }
        var target = new URL(href, new URL('./', runtimeScriptUrl)).pathname;
        return pathKey(location.pathname) === pathKey(target);
    }

    function applyPageVisibility() {
        var state = ST.getJSON('st_ui_visibility_v1', {});
        if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
        document.querySelectorAll('.st-nav a[href]').forEach(function (link) {
            var target = new URL(link.href, CACHE_SCOPE);
            if (target.origin !== CACHE_SCOPE.origin || !target.pathname.startsWith(CACHE_SCOPE.pathname)) return;
            var path = decodeURIComponent(target.pathname.slice(CACHE_SCOPE.pathname.length)) || 'index.html';
            var protectedPage = path === 'index.html' || path === 'home.html' || path === 'admin.html';
            link.style.display = state.viewMode !== 'default' && !protectedPage && state[path] === false ? 'none' : '';
        });
        document.querySelectorAll('.st-nav .st-dd').forEach(function (group) {
            group.style.display = Array.from(group.querySelectorAll('a[href]')).some(function (link) { return link.style.display !== 'none'; }) ? '' : 'none';
        });
    }
    window.addEventListener('storage', function (event) { if (event.key === 'st_ui_visibility_v1' || event.key === null) applyPageVisibility(); });
    window.addEventListener('app-visibility-change', applyPageVisibility);
    window.addEventListener('pageshow', applyPageVisibility);

    function buildNav() {
        var nav = document.querySelector('.header-nav');
        if (!nav) return;
        var page = currentPage();
        var host = nav.parentElement;
        if (host && page !== 'index.html' && page !== 'home.html' && !host.querySelector('.main-title, .site-brand, .wordmark')) {
            var brand = document.createElement('a');
            brand.className = 'site-brand';
            brand.href = navHref('index.html');
            brand.textContent = 'Scales Thesaurus';
            brand.setAttribute('aria-label', 'Scales Thesaurus home');
            host.insertBefore(brand, nav);
        }
        nav.classList.add('st-nav');
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = '';
        var consolidated = nav.dataset.consolidated === 'true';
        if (consolidated) nav.classList.add('st-nav-consolidated');
        var navItems = consolidated ? [{ label: 'Navigate', icon: 'menu', children: NAV.flatMap(function (item) {
            return item.children ? item.children.map(function (child) { return Object.assign({ group: item.label }, child); }) : [Object.assign({ group: 'Home' }, item)];
        }) }] : NAV;
        navItems.forEach(function (item) {
            if (item.children) {
                var dd = document.createElement('div');
                dd.className = 'st-dd';
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('aria-haspopup', 'true');
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-label', item.label + ' menu');
                btn.title = item.label;
                appendNavContent(btn, item);
                var menu = document.createElement('div');
                menu.className = 'st-dd-menu';
                if (consolidated) menu.classList.add('st-navigation-sections');
                var groups = new Map();
                item.children.forEach(function (c) {
                    var destination = menu;
                    if (c.group) {
                        if (!groups.has(c.group)) {
                            var section = document.createElement('section');
                            var heading = document.createElement('h3');
                            heading.textContent = c.group;
                            section.appendChild(heading); menu.appendChild(section); groups.set(c.group, section);
                        }
                        destination = groups.get(c.group);
                    }
                    var a = document.createElement('a');
                    a.href = navHref(c.href);
                    a.title = c.label;
                    a.setAttribute('aria-label', c.label);
                    appendNavContent(a, c);
                    if (isCurrentPage(c.href)) { a.classList.add('active'); dd.classList.add('has-active'); a.setAttribute('aria-current', 'page'); }
                    destination.appendChild(a);
                });
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var open = !dd.classList.contains('open');
                    nav.querySelectorAll('.st-dd.open').forEach(function (o) { o.classList.remove('open'); o.firstChild.setAttribute('aria-expanded', 'false'); });
                    dd.classList.toggle('open', open);
                    btn.setAttribute('aria-expanded', String(open));
                });
                if (consolidated) {
                    var actions = document.createElement('section');
                    var actionHeading = document.createElement('h3'); actionHeading.textContent = 'Diagram controls'; actions.appendChild(actionHeading);
                    [['header-play-pattern', 'Play'], ['header-stop-pattern', 'Stop'], ['sidebar-toggle', 'Toggle sidebar'], ['reset-settings', 'Reset all settings']].forEach(function (entry) {
                        var control = document.getElementById(entry[0]);
                        if (!control) return;
                        control.className = 'st-nav-action'; control.textContent = entry[1]; actions.appendChild(control);
                    });
                    if (actions.children.length > 1) menu.prepend(actions);
                }
                dd.appendChild(btn); dd.appendChild(menu);
                nav.appendChild(dd);
            } else {
                var a = document.createElement('a');
                a.href = navHref(item.href);
                a.title = item.label;
                a.setAttribute('aria-label', item.label);
                a.className = 'header-link' + (item.cls ? ' ' + item.cls : '');
                appendNavContent(a, item);
                if (isCurrentPage(item.href)) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
                if (item.cls === 'st-rn') {
                    var dot = document.createElement('span');
                    dot.className = 'st-offline-dot' + (navigator.onLine ? '' : ' off');
                    dot.title = navigator.onLine ? 'Online; offline cache status is not confirmed' : 'Offline; availability depends on cached files';
                    a.appendChild(dot);
                    window.addEventListener('online', function () { dot.classList.remove('off'); dot.title = 'Online; offline cache status is not confirmed'; });
                    window.addEventListener('offline', function () { dot.classList.add('off'); dot.title = 'Offline; availability depends on cached files'; });
                }
                nav.appendChild(a);
            }
        });
        function closeNavigationMenus() {
            nav.querySelectorAll('.st-dd.open').forEach(function (o) {
                o.classList.remove('open');
                o.firstChild.setAttribute('aria-expanded', 'false');
            });
            nav.classList.remove('mobile-open');
            var menuButton = nav.parentElement.querySelector('.st-nav-toggle');
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.setAttribute('aria-label', 'Open navigation menu');
                menuButton.title = 'Open navigation menu';
                var label = menuButton.querySelector('.st-nav-toggle-label');
                if (label) label.textContent = 'Menu';
            }
        }
        document.addEventListener('click', function (event) {
            nav.querySelectorAll('.st-dd.open').forEach(function (o) {
                if (!o.contains(event.target)) {
                    o.classList.remove('open');
                    o.firstChild.setAttribute('aria-expanded', 'false');
                }
            });
            if (!nav.contains(event.target) && nav.classList.contains('mobile-open')) closeNavigationMenus();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                var trigger = nav.contains(document.activeElement) && nav.querySelector('.st-dd.open > button');
                closeNavigationMenus();
                if (trigger) trigger.focus();
            }
        });

        // Mobile menu toggle (nav was previously hidden entirely on small screens)
        var host = nav.parentElement;
        if (host && !consolidated && !host.querySelector('.st-nav-toggle')) {
            var tg = document.createElement('button');
            tg.type = 'button';
            tg.className = 'st-nav-toggle';
            tg.setAttribute('aria-label', 'Open navigation menu');
            tg.title = 'Open navigation menu';
            tg.appendChild(makeNavIcon('menu'));
            var toggleLabel = document.createElement('span');
            toggleLabel.className = 'st-nav-toggle-label';
            toggleLabel.textContent = 'Menu';
            tg.appendChild(toggleLabel);
            tg.setAttribute('aria-expanded', 'false');
            tg.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = !nav.classList.contains('mobile-open');
                nav.classList.toggle('mobile-open', open);
                tg.setAttribute('aria-expanded', String(open));
                tg.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
                tg.title = open ? 'Close navigation menu' : 'Open navigation menu';
                toggleLabel.textContent = open ? 'Close' : 'Menu';
            });
            host.insertBefore(tg, nav.nextSibling);
        }
    }

    function setupOrientationToggle() {
        var host = document.querySelector('.top-header-content .sidebar-toggle-container') || document.querySelector('.topbar');
        if (!host) return;
        var toggle = host.querySelector('.st-orientation-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'st-orientation-toggle';
            toggle.addEventListener('click', function () {
                landscape = !landscape;
                try { localStorage.setItem('st_orientation', landscape ? 'landscape' : 'portrait'); } catch (e) {}
                update();
                var orientation = screen.orientation;
                if (orientation && typeof orientation.lock === 'function') {
                    try {
                        var lockRequest = orientation.lock(landscape ? 'landscape' : 'portrait-primary');
                        if (lockRequest && typeof lockRequest.catch === 'function') lockRequest.catch(function () {});
                    } catch (e) {}
                }
            });
            host.appendChild(toggle);
        }
        var landscape = true;
        try { landscape = localStorage.getItem('st_orientation') !== 'portrait'; } catch (e) {}
        function update() {
            document.documentElement.classList.toggle('st-orientation-landscape', landscape);
            document.documentElement.classList.toggle('st-orientation-portrait', !landscape);
            toggle.textContent = landscape ? 'Portrait' : 'Landscape';
            toggle.setAttribute('aria-label', landscape ? 'Switch to portrait orientation' : 'Switch to landscape orientation');
            toggle.setAttribute('aria-pressed', String(!landscape));
            toggle.title = landscape ? 'Switch to portrait orientation' : 'Switch to landscape orientation';
        }
        update();
    }

    // ---------- Progress tracking (all local) ----------
    function today() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    ST.today = today;
    function trackVisit() {
        function activityRecord(value) {
            var record = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            record.days = record.days && typeof record.days === 'object' && !Array.isArray(record.days) ? record.days : {};
            record.pages = record.pages && typeof record.pages === 'object' && !Array.isArray(record.pages) ? record.pages : {};
            return record;
        }
        function count(value) { return Number.isFinite(value) && value >= 0 ? value : 0; }
        var act = activityRecord(ST.getJSON('st_activity', {}));
        var d = today();
        act.days[d] = count(act.days[d]);
        var p = currentPage();
        act.pages[p] = count(act.pages[p]) + 1;
        ST.setJSON('st_activity', act);
        // Active-time accumulator: count 15s ticks while the tab is visible
        setInterval(function () {
            if (document.visibilityState !== 'visible') return;
            var activity = activityRecord(ST.getJSON('st_activity', {}));
            var k = today();
            activity.days[k] = count(activity.days[k]) + 15;
            ST.setJSON('st_activity', activity);
        }, 15000);
    }
    ST.recordView = function (type, id) {
        if (!type || !id) return;
        var v = ST.getJSON('st_viewed', {});
        if (!v || typeof v !== 'object' || Array.isArray(v)) v = {};
        if (!v[type] || typeof v[type] !== 'object' || Array.isArray(v[type])) v[type] = {};
        var current = v[type][id];
        v[type][id] = Number.isFinite(current) && current >= 0 ? current + 1 : 1;
        ST.setJSON('st_viewed', v);
    };

    // ---------- Offline (service worker) ----------
    function registerSW() {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
        function confirmCache(scope) {
            if (!('caches' in window)) return;
            var wasReady = false;
            try { wasReady = localStorage.getItem('st_offline_ready_' + CACHE_VERSION) === '1'; } catch (e) {}
            caches.open(CACHE_VERSION).then(function (cache) {
                return cache.match(new URL('__offline-ready__', scope || new URL('./', runtimeScriptUrl)));
            }).then(function (marker) {
                if (!marker) return;
                try { localStorage.setItem('st_offline_ready_' + CACHE_VERSION, '1'); } catch (e) {}
                document.querySelectorAll('.st-offline-dot').forEach(function (dot) {
                    dot.title = navigator.onLine ? 'Offline cache is fully ready' : 'Offline mode; all app files are cached';
                });
                if (!wasReady && !(runtimeScript && runtimeScript.hasAttribute('data-offline-only'))) ST.toast('Scales Thesaurus v' + VERSION + ' is ready to work offline');
            }).catch(function () {});
        }
        var workerUrl = new URL('sw.js', runtimeScriptUrl);
        var scope = new URL('./', workerUrl);
        navigator.serviceWorker.register(workerUrl.href, { scope: scope.pathname, updateViaCache: 'none' }).then(function (reg) {
            var worker = reg.installing || reg.waiting;
            if (worker) {
                worker.addEventListener('statechange', function () {
                    if (worker.state === 'activated') confirmCache();
                });
            }
            navigator.serviceWorker.ready.then(function () { confirmCache(scope.href); });
        }).catch(function (e) { console.warn('Service worker registration failed:', e); });
    }

    function setupMobileView() {
        var enabled = false;
        try { enabled = sessionStorage.getItem("st_mobile_view") === "1"; } catch (e) {}
        var toggles = document.querySelectorAll("#mobile-view-toggle, .st-view-toggle");
        function update() {
            document.body.classList.toggle("mobile-view", enabled);
            toggles.forEach(function (toggle) {
                var landingToggle = toggle.id === "mobile-view-toggle";
                var dotToggle = toggle.classList.contains("st-view-dot");
                toggle.setAttribute("aria-pressed", String(enabled));
                toggle.setAttribute("aria-label", enabled ? "Switch to desktop view" : "Switch to mobile view");
                if (!dotToggle) {
                    toggle.textContent = landingToggle
                        ? (enabled ? "Exit Mobile View" : "Use Mobile View")
                        : (enabled ? "Desktop" : "Mobile");
                }
                toggle.title = enabled ? "Switch to desktop view" : "Switch to mobile view";
            });
        }
        update();
        toggles.forEach(function (toggle) {
            toggle.addEventListener("click", function () {
                enabled = !document.body.classList.contains("mobile-view");
                try { sessionStorage.setItem("st_mobile_view", enabled ? "1" : "0"); } catch (e) {}
                update();
            });
        });
    }

    function init() {
        registerSW();
        if (runtimeScript && runtimeScript.hasAttribute('data-offline-only')) return;
        buildNav();
        applyPageVisibility();
        if (NAV_ONLY) return;
        setupMobileView();
        setupOrientationToggle();
        trackVisit();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
