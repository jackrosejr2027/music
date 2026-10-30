/**
 * Scales Page Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const musicTheory = new MusicTheory();
    const scaleListContainer = document.getElementById('scale-list');
    const intervalFilterListContainer = document.getElementById('interval-filter-list');
    const clearFiltersButton = document.getElementById('clear-filters');
    const showFavoritesCheckbox = document.getElementById('show-favorites-only');
    const namedOnlyCheckbox = document.getElementById('named-only');
    const modeIntervalsOnlyCheckbox = document.getElementById('mode-intervals-only');
    const searchInput = document.getElementById('scale-search');
    const scaleNameOptions = document.getElementById('scale-name-options');
    const toneCountSelect = document.getElementById('tone-count-filter');
    const resultsCountDisplay = document.getElementById('results-count');

    // Load favorites from localStorage
    let favoriteScales = {};
    try {
        const stored = JSON.parse(localStorage.getItem('favoriteScales') || '{}');
        favoriteScales = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch (e) { favoriteScales = {}; }
    // v1.0: compare intervals by pitch so filters treat #5 / b6 etc. as the same tone
    const semisOf = (iv) => { const v = musicTheory.getIntervalSemitones(iv); return v === null ? null : ((v % 12) + 12) % 12; };
    const baseZero = (formula) => Array.from(new Set([0].concat(formula.map(semisOf).filter(v => v !== null)))).sort((a, b) => a - b).join('-');
    function appendFact(target, label, value, valueClass) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const span = document.createElement('span');
        strong.textContent = label + ':';
        span.className = valueClass || '';
        span.textContent = value;
        p.append(strong, document.createTextNode(' '), span);
        target.appendChild(p);
    }

    // Get scales and intervals from MusicTheory class
    const scales = musicTheory.scales;
    const intervals = musicTheory.intervals;
    const signature = formula => baseZero(formula);
    const namedScales = new Map();
    Object.entries(scales).forEach(([id, data]) => {
        if (/^(?:a\d{4}_|\d{4}_)/.test(id) || /theoretical only/i.test(data.name)) return;
        const key = signature(data.intervals);
        if (!namedScales.has(key)) namedScales.set(key, data.name);
    });
    const namedChords = new Map();
    Object.values(musicTheory.chords).forEach(chord => {
        const key = signature(chord.intervals);
        if (!namedChords.has(key)) namedChords.set(key, chord.name);
    });
    function identifyCollection(id, data) {
        const key = signature(data.intervals);
        const count = key.split('-').length;
        if (count === 1) return { type: 'Interval', name: intervals['1'].name };
        if (count === 2) {
            const note = data.intervals.find(iv => semisOf(iv) !== 0);
            const interval = intervals[note] || Object.values(intervals).find(iv => iv.semitones % 12 === semisOf(note));
            return interval ? { type: 'Interval', name: interval.name } : { type: '', name: 'Theoretical only' };
        }
        const scaleName = /^(?:a\d{4}_|\d{4}_)/.test(id) ? namedScales.get(key) : data.name;
        const chordName = namedChords.get(key);
        if (count <= 4 && chordName) return { type: 'Chord', name: chordName };
        if (scaleName) return { type: 'Scale', name: scaleName };
        if (chordName) return { type: 'Chord', name: chordName };
        return { type: '', name: 'Theoretical only' };
    }

    // Store all created scale item elements and their associated data
    let allScaleData = [];

    // Function to populate the scale list
    function populateScales() {
        scaleListContainer.innerHTML = '';
        allScaleData = [];
        
        const sortedScaleEntries = Object.entries(scales).sort(([, a], [, b]) => a.name.localeCompare(b.name));
        const nameOptions = document.createDocumentFragment();
        [...new Set(sortedScaleEntries.flatMap(([id, data]) => [data.name, identifyCollection(id, data).name]).filter(name => name !== 'Theoretical only'))].forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            nameOptions.appendChild(option);
        });
        scaleNameOptions.replaceChildren(nameOptions);

        sortedScaleEntries.forEach(([id, data]) => {
            const scaleItemElement = document.createElement('div');
            scaleItemElement.className = 'scale-item';
            
            const details = document.createElement('div');
            details.className = 'scale-details';

            // Scale Name Heading
            const nameHeading = document.createElement('h3');
            nameHeading.textContent = data.name;
            details.appendChild(nameHeading);
            const identity = identifyCollection(id, data);
            const identityHeading = document.createElement('h4');
            identityHeading.className = 'scale-identity';
            identityHeading.textContent = identity.type ? identity.type + ' · ' + identity.name : identity.name;
            details.appendChild(identityHeading);

            const exampleNotes = musicTheory.getScaleNotes('C', id);
            const base0 = baseZero(data.intervals);
            appendFact(details, 'Formula', data.intervals.join(' - '), 'scale-notes');
            appendFact(details, 'Example (C root)', exampleNotes.join(' - '), 'scale-notes');
            appendFact(details, 'Base 0 pitch classes', base0, 'scale-notes');

            // Related Modes (if available via logic)
            const relatedModes = (typeof musicTheory.getRelatedModes === 'function') ? musicTheory.getRelatedModes(id) : [];
            if (relatedModes && relatedModes.length > 0) appendFact(details, 'Related modes', relatedModes.join(', '), '');

            // Description
            const description = (typeof musicTheory.getScaleDescription === 'function') ? musicTheory.getScaleDescription(id) : '';
            const aboutText = description && description.indexOf('unique collection of notes') === -1
                ? description + ' Base-0 pitch classes: ' + base0 + '.'
                : (identity.type ? identity.name : data.name) + ' is a ' + data.intervals.length + '-note collection with formula ' + data.intervals.join(' - ') + '. Base-0 pitch classes: ' + base0 + '.';
            appendFact(details, 'About', aboutText, '');

            // Buttons Container
            const buttonPairContainer = document.createElement('div');
            buttonPairContainer.className = 'button-pair-container';

            // Hear Scale Button
            const hearBtn = document.createElement('button');
            hearBtn.className = 'hear-scale-button';
            hearBtn.textContent = 'Hear Scale';
            hearBtn.addEventListener('click', async () => {
                try {
                    const started = await window.STAudioPreview.playTheoryItem('scale', 'C', id, musicTheory);
                    if (!started && window.ST) ST.toast('Audio playback is not available in this browser.');
                } catch (error) {
                    console.warn('Scale preview failed:', error);
                    if (window.ST) ST.toast('Could not play this scale. Tap to try again.');
                }
            });

            // View on Fretboard Button
            const showBtn = document.createElement('button');
            showBtn.className = 'view-diagram-button';
            showBtn.textContent = 'Fretboard';
            showBtn.addEventListener('click', () => {
                window.location.href = `fretboard.html?key=C&patternType=scale&pattern=${encodeURIComponent(id)}`;
            });

            buttonPairContainer.appendChild(hearBtn);
            buttonPairContainer.appendChild(showBtn);
            details.appendChild(buttonPairContainer);

            scaleItemElement.appendChild(details);

            // Favorite Star Toggle
            const favButton = document.createElement('button');
            favButton.type = 'button';
            favButton.className = 'favorite-button';
            favButton.textContent = favoriteScales[id] ? '★' : '☆';
            favButton.classList.toggle('favorited', !!favoriteScales[id]);
            favButton.title = favoriteScales[id] ? 'Remove scale from Favorites' : 'Save scale to Favorites';
            favButton.setAttribute('aria-label', favButton.title);
            favButton.setAttribute('aria-pressed', String(!!favoriteScales[id]));
            favButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(id, favButton, scaleItemElement);
            });
            scaleItemElement.appendChild(favButton);

            scaleListContainer.appendChild(scaleItemElement);
            // v1.0 perf fix: precompute search text once instead of on every keystroke
            allScaleData.push({
                id, data, element: scaleItemElement,
                named: identity.name !== 'Theoretical only',
                modeIntervals: data.intervals.every(interval => window.STModeIntervals.has(interval)),
                semis: new Set(data.intervals.map(semisOf)),
                search: [data.name, identity.name, identity.type, data.intervals.join(' '), data.intervals.join(''), exampleNotes.join(' '), base0, id].join(' | ').toLowerCase()
            });
        });
    }

    // Populate Interval Checkboxes with 3-state logic: None -> Include -> Exclude
    function populateIntervalFilters() {
        intervalFilterListContainer.innerHTML = '';
        const sortedIntervals = Object.entries(intervals).sort(([, a], [, b]) => a.semitones - b.semitones);
        
        sortedIntervals.forEach(([id, data]) => {
            const filterItem = document.createElement('div');
            filterItem.className = 'interval-filter-item';
            filterItem.dataset.id = id;
            filterItem.dataset.state = 'none'; // none, include, exclude
            
            // We use the wrapper for clicking to cycle states
            filterItem.addEventListener('click', (e) => {
                e.preventDefault();
                let currentState = filterItem.dataset.state;
                
                if (currentState === 'none') {
                    filterItem.dataset.state = 'include';
                    filterItem.classList.add('selected');
                    filterItem.classList.remove('excluded');
                } else if (currentState === 'include') {
                    filterItem.dataset.state = 'exclude';
                    filterItem.classList.remove('selected');
                    filterItem.classList.add('excluded');
                } else {
                    filterItem.dataset.state = 'none';
                    filterItem.classList.remove('selected');
                    filterItem.classList.remove('excluded');
                }
                filterAndSortScales();
            });
            
            const label = document.createElement('label');
            label.textContent = data.shortName;
            label.title = data.name; 
            
            filterItem.appendChild(label);
            intervalFilterListContainer.appendChild(filterItem);
        });
    }

    // Toggle Favorite Function
    function toggleFavorite(scaleId, buttonElement) {
        const wasSaved = !!favoriteScales[scaleId];
        if (wasSaved) delete favoriteScales[scaleId];
        else favoriteScales[scaleId] = true;
        try { localStorage.setItem('favoriteScales', JSON.stringify(favoriteScales)); }
        catch (error) {
            if (wasSaved) favoriteScales[scaleId] = true;
            else delete favoriteScales[scaleId];
            if (window.ST && ST.toast) ST.toast('Could not update Favorites. Check device storage.');
        }
        const saved = !!favoriteScales[scaleId];
        buttonElement.classList.toggle('favorited', saved);
        buttonElement.textContent = saved ? '★' : '☆';
        buttonElement.title = saved ? 'Remove scale from Favorites' : 'Save scale to Favorites';
        buttonElement.setAttribute('aria-label', buttonElement.title);
        buttonElement.setAttribute('aria-pressed', String(saved));
        filterAndSortScales();
    }

    // Filter Logic
    function filterAndSortScales() {
        const includeIntervals = Array.from(intervalFilterListContainer.querySelectorAll('.interval-filter-item.selected'))
                                       .map(item => item.dataset.id);
        const excludeIntervals = Array.from(intervalFilterListContainer.querySelectorAll('.interval-filter-item.excluded'))
                                       .map(item => item.dataset.id);
                                       
        const showOnlyFavorites = showFavoritesCheckbox.checked;
        const showNamedOnly = namedOnlyCheckbox.checked;
        const showModeIntervalsOnly = modeIntervalsOnlyCheckbox.checked;
        const searchText = (searchInput.value || '').toLowerCase().trim();
        const toneCount = toneCountSelect.value;

        let visibleCount = 0;

        allScaleData.forEach(item => {
            const matchesInclude = includeIntervals.length === 0 || 
                                   includeIntervals.every(int => item.semis.has(semisOf(int)));
            
            const matchesExclude = excludeIntervals.length === 0 ||
                                   !excludeIntervals.some(int => item.semis.has(semisOf(int)));

            const matchesFavorite = !showOnlyFavorites || favoriteScales[item.id];
            const matchesNamed = !showNamedOnly || item.named;
            const matchesModeIntervals = !showModeIntervalsOnly || item.modeIntervals;
            const matchesSearch = !searchText || item.search.includes(searchText);
            const matchesTones = !toneCount || item.data.intervals.length === parseInt(toneCount);
            
            if (matchesInclude && matchesExclude && matchesFavorite && matchesNamed && matchesModeIntervals && matchesSearch && matchesTones) {
                item.element.classList.remove('hidden');
                visibleCount++;
            } else {
                item.element.classList.add('hidden');
            }
        });

        // Update results display
        if (visibleCount === allScaleData.length) {
            resultsCountDisplay.textContent = `Showing all ${allScaleData.length} scales`;
        } else {
            resultsCountDisplay.textContent = `Found ${visibleCount} match${visibleCount === 1 ? '' : 'es'}`;
        }
    }

    // Clear Filters
    clearFiltersButton.addEventListener('click', () => {
        intervalFilterListContainer.querySelectorAll('.interval-filter-item').forEach(item => {
            item.dataset.state = 'none';
            item.classList.remove('selected', 'excluded');
        });
        showFavoritesCheckbox.checked = false;
        namedOnlyCheckbox.checked = false;
        modeIntervalsOnlyCheckbox.checked = false;
        searchInput.value = '';
        toneCountSelect.value = '';
        filterAndSortScales();
    });

    showFavoritesCheckbox.addEventListener('change', filterAndSortScales);
    namedOnlyCheckbox.addEventListener('change', filterAndSortScales);
    modeIntervalsOnlyCheckbox.addEventListener('change', filterAndSortScales);
    searchInput.addEventListener('input', filterAndSortScales);
    toneCountSelect.addEventListener('change', filterAndSortScales);

    // Initial load
    populateScales();
    populateIntervalFilters();
    filterAndSortScales();
});