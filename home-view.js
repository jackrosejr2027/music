(function () {
    'use strict';
    const catalog = window.APP_CATALOG;
    const main = document.getElementById('home-content');
    const original = catalog.viewMode() === 'default';
    const byPath = new Map(catalog.pages.map(page => [page.path, page]));
    const base = new URL('./', document.currentScript.src);
    const descriptions = {
        'fretboard-standalone.html': 'Just the neck diagram, full screen, with no header or controls.',
        'pattern-studio-standalone.html': 'Pattern Studio with no header, library or track picker.',
        'theory-decks/daw-standalone.html': 'The DAW with no site header or sub-navigation.',
        'andalusian-standalone.html': 'Andalusian cadences with no header or progression controls.',
        'cadence-map/cadence-map-standalone.html': 'Cadence Map with no header or sidebar, in the Home theme.',
        'theory-decks/cards-standalone.html': 'Practice cards with no header, sub-navigation or deck pickers.',
        'chord-progressions-standalone.html': 'Chord Progressions with no header or sidebar toggle.',
        'scale-explorer-standalone.html': 'Scale Explorer with no header or filters.',
        'interval-explorer-standalone.html': 'Interval Explorer with no header or filters.',
        'chord-explorer-standalone.html': 'Chord Explorer with no header or filters.',
        'theory-cards/flash-cards-standalone.html': 'Flash Cards with no header or deck filter.',
        'lessons-standalone.html': 'Lessons with no header or sidebar toggle.',
        'courses-standalone.html': 'Courses with no header or sidebar toggle.',
        'quizzes-standalone.html': 'Quizzes with no header or sidebar toggle.',
        'tests-standalone.html': 'Tests with no header or sidebar toggle.',
        'exams-standalone.html': 'Exams with no header or sidebar toggle.',
        'ebooks-standalone.html': 'eBooks with no header, sidebar toggle or setup panel.',

        'fretboard.html': 'See scales, chords and intervals on the neck. Play patterns and export diagrams.',
        'daw.html': 'Arrange musical ideas, hear your progression and export it as MIDI.',
        'dummy.html': 'Build a progression from any key, then hear it and transpose it instantly.',
        'theory-decks/index.html': 'Explore guitar theory cards, a creative DAW, fretboard tools and focused practice games.',
        'cadence-map/index.html': 'Explore Andalusian cadences and modal chord progressions in every key. Listen and export your selections.',
        'scales.html': 'Browse scale formulas, spellings and fretboard views.',
        'chords.html': 'Find voicings, chord tones and related scales.',
        'intervals.html': 'Hear and compare the distances between notes.',
        'data.html': 'Inspect and export the theory behind the tools.',
        'courses.html': 'Follow a structured path through music theory.',
        'lessons.html': 'Step-by-step tutorials with interactive diagrams.',
        'practice.html': 'Build a routine with drills and ear training.',
        'primer.html': 'Start with instrument basics, then follow a 20,000-step learning map.',
        'theory-cards/index.html': 'Review essential ideas with quick flashcards.',
        'coursesquizzes.html': 'Test what you know with generated assessments.',
        'ebooks.html': 'Make focused PDF guides for your next session.',
        'favorites.html': 'Return to saved scales, chords and diagrams.',
        'progress.html': 'See lessons, practice and recent activity.',
        'coursesideas.html': 'Keep a private notebook for musical ideas.',
        'site-map.html': 'Find every tool on Home and in Theory Decks, including header links.',
        'testing.html': 'Page test scripts, source checks and feedback prompts for changes.',
        'settings.html': 'Personalize themes, defaults and audio.'
    };
    main.className = 'home-container';
    if (original) {
        const hero = document.createElement('section'); hero.className = 'home-hero'; hero.setAttribute('aria-labelledby', 'home-title');
        hero.innerHTML = '<div class="home-hero-copy"><p class="home-eyebrow"><span class="home-eyebrow-mark" aria-hidden="true"></span>A WORKSPACE FOR MUSICAL CURIOSITY</p><h2 id="home-title">Manic Rules - Learn Music</h2><p class="home-intro">Explore the fretboard, shape a progression, or follow an idea wherever it leads.</p><a class="home-primary-link" href="fretboard.html">Open the fretboard <span aria-hidden="true">+</span></a></div><div class="home-hero-art" aria-hidden="true"><div class="home-art-orbit home-art-orbit-one"></div><div class="home-art-orbit home-art-orbit-two"></div><div class="home-art-note home-art-note-one">C</div><div class="home-art-note home-art-note-two">G</div><div class="home-art-note home-art-note-three">Am</div><div class="home-art-line home-art-line-one"></div><div class="home-art-line home-art-line-two"></div><div class="home-art-line home-art-line-three"></div><div class="home-art-line home-art-line-four"></div><div class="home-art-line home-art-line-five"></div><span class="home-art-caption">KEY / C MAJOR</span></div><div class="home-hero-index" aria-hidden="true"><span>01</span><span class="home-index-rule"></span><span>EXPLORE</span></div>';
        main.appendChild(hero);
    }
    function section(title, kicker, paths, featured = false, open = false, parent = main) {
        const pages = paths.map(path => byPath.get(path)).filter(page => page && (original || catalog.isVisible(page.path)));
        if (!pages.length) return;
        const section = document.createElement('details'); section.className = 'home-section'; section.open = open;
        const summary = document.createElement('summary');
        const heading = document.createElement('div'); heading.className = 'home-section-heading';
        const headingCopy = document.createElement('div');
        const small = document.createElement('p'); small.className = 'home-section-kicker'; small.textContent = kicker;
        const h2 = document.createElement('h2'); h2.textContent = title;
        if (kicker) headingCopy.appendChild(small);
        headingCopy.appendChild(h2); heading.appendChild(headingCopy); summary.appendChild(heading); section.appendChild(summary);
        const grid = document.createElement('div'); grid.className = featured ? 'home-feature-grid' : 'home-link-grid';
        const variants = ['fretboard', 'daw', 'progression', 'decks', 'progression'];
        pages.forEach((page, index) => {
            const link = document.createElement('a'); link.href = new URL(page.path, base).href;
            link.className = featured ? 'home-feature-card home-feature-' + variants[index] : 'home-link-card';
            const number = document.createElement('span'); number.className = featured ? 'home-card-index' : 'home-link-symbol'; number.textContent = String(index + 1).padStart(2, '0');
            const title = document.createElement('h3'); title.textContent = page.path === 'coursesquizzes.html' && original ? 'Quizzes & Exams' : page.name;
            const description = document.createElement('p'); description.textContent = descriptions[page.path] || page.features[0];
            const arrow = document.createElement('span'); arrow.className = featured ? 'home-card-action' : 'home-link-arrow'; arrow.textContent = featured ? 'Open ' + page.name + ' +' : '+';
            if (featured) link.append(number, title, description, arrow);
            else { const copy = document.createElement('span'); copy.append(title, description); link.append(number, copy, arrow); }
            grid.appendChild(link);
        });
        section.appendChild(grid); parent.appendChild(section);
        return section;
    }
    const search = document.createElement('div');
    search.className = 'home-search';
    search.innerHTML = '<label for="home-search-input">Find your next tool</label><input id="home-search-input" type="search" placeholder="Search apps, scales, lessons…" autocomplete="off"><span class="home-search-count" aria-live="polite"></span>';
    main.appendChild(search);
    if (original) {
        section('Play!', 'START MAKING', ['fretboard.html', 'daw.html', 'dummy.html', 'theory-decks/index.html', 'cadence-map/index.html'], true);
        section('Apps', 'Manic Rules', ['fretboard-standalone.html', 'pattern-studio-standalone.html', 'theory-decks/daw-standalone.html', 'andalusian-standalone.html', 'cadence-map/cadence-map-standalone.html', 'theory-decks/cards-standalone.html', 'chord-progressions-standalone.html', 'scale-explorer-standalone.html', 'interval-explorer-standalone.html', 'chord-explorer-standalone.html', 'theory-cards/flash-cards-standalone.html', 'lessons-standalone.html', 'courses-standalone.html', 'quizzes-standalone.html', 'tests-standalone.html', 'exams-standalone.html', 'ebooks-standalone.html'], false, true);
        section('Explore theory', 'FIND A SOUND', ['scales.html', 'chords.html', 'intervals.html', 'data.html']);
        section('Learn & practice', 'KEEP GOING', ['courses.html', 'lessons.html', 'practice.html', 'primer.html', 'theory-cards/index.html', 'coursesquizzes.html', 'ebooks.html']);
        section('Keep your ideas close', 'YOUR SPACE', ['favorites.html', 'progress.html', 'coursesideas.html', 'site-map.html', 'settings.html']);
        section('Testing Menu', '', ['testing.html']);
        const footer = document.createElement('footer'); footer.className = 'home-footer';
        footer.innerHTML = '<span>Scales Thesaurus</span><div><a href="about.html">About</a><a href="release-notes.html">Release notes</a></div><span>Make something musical.</span>';
        main.appendChild(footer);
    } else {
        const groups = new Map();
        catalog.pages.filter(page => !catalog.protectedPages.has(page.path)).forEach(page => { if (!groups.has(page.group)) groups.set(page.group, []); groups.get(page.group).push(page.path); });
        const OTHER_GROUPS = ['Play & Create', 'Reference', 'Learning', 'Personal Data', 'Documentation', 'Theory Decks'];
        const others = document.createElement('details'); others.className = 'home-section'; others.open = false;
        const otherSummary = document.createElement('summary');
        const otherHeading = document.createElement('div'); otherHeading.className = 'home-section-heading';
        const otherCopy = document.createElement('div'); const otherTitle = document.createElement('h2'); otherTitle.textContent = 'Other';
        otherCopy.appendChild(otherTitle); otherHeading.appendChild(otherCopy); otherSummary.appendChild(otherHeading); others.appendChild(otherSummary);
        const otherBody = document.createElement('div'); otherBody.className = 'home-other-body'; others.appendChild(otherBody);
        if (groups.has('Personal Data')) groups.get('Personal Data').push('admin.html');
        groups.forEach((paths, name) => { if (OTHER_GROUPS.includes(name)) section(name, '', paths, false, true, otherBody); });
        let placed = false;
        const placeOther = () => { if (!placed && otherBody.children.length) main.appendChild(others); placed = true; };
        groups.forEach((paths, name) => {
            if (OTHER_GROUPS.includes(name)) return;
            const isApps = name === 'Standalone';
            section(isApps ? 'Apps' : name, isApps ? 'Manic Rules' : '', paths, false, isApps);
            if (isApps) placeOther();
        });
        placeOther();
    }
    const searchInput = search.querySelector('input');
    const searchCount = search.querySelector('.home-search-count');
    const sections = [...main.querySelectorAll('.home-section')];
    const initialOpen = new Map(sections.map(item => [item, item.open]));
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLocaleLowerCase();
        let total = 0;
        sections.forEach(section => {
            const cards = [...section.querySelectorAll('.home-feature-card, .home-link-card')];
            let visible = 0;
            cards.forEach(card => {
                const match = !query || card.textContent.toLocaleLowerCase().includes(query);
                card.hidden = !match;
                if (match) visible++;
            });
            section.hidden = visible === 0;
            if (query && visible) section.open = true;
            else if (!query) section.open = initialOpen.get(section) ?? false;
        });
        total = [...main.querySelectorAll('.home-feature-card, .home-link-card')].filter(card => !card.hidden).length;
        const otherBody = main.querySelector('.home-other-body');
        if (otherBody) {
            const outer = otherBody.parentElement;
            const hasVisible = [...otherBody.querySelectorAll('.home-section')].some(item => !item.hidden);
            outer.hidden = !hasVisible;
            if (query && hasVisible) outer.open = true;
            else if (!query) outer.open = initialOpen.get(outer) ?? false;
        }
        searchCount.textContent = query ? total + (total === 1 ? ' match' : ' matches') : '';
    });
    // Home has no unsaved input: keep other open Home tabs in sync with Admin.
    window.addEventListener('storage', event => { if (event.key === 'st_ui_visibility_v1' || event.key === null) location.reload(); });
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
})();
