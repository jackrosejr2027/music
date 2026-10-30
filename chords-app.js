/**
 * Chords Page Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const musicTheory = new MusicTheory();
    const chordListContainer = document.getElementById('chord-list');
    const intervalFilterListContainer = document.getElementById('interval-filter-list');
    const scaleFilterSelect = document.getElementById('scale-filter-select');
    const clearFiltersButton = document.getElementById('clear-filters');
    const showFavoritesCheckbox = document.getElementById('show-favorites-only');
    const namedOnlyCheckbox = document.getElementById('named-only');
    const modeIntervalsOnlyCheckbox = document.getElementById('mode-intervals-only');
    const resultsCountDisplay = document.getElementById('results-count');

    // Dummy app instance for lesson integration
    const dummyApp = {
        musicTheory: musicTheory,
        openLessonPage: function(key, patternType, patternId) {
            if (typeof App !== 'undefined' && App.prototype.openLessonPage) {
                App.prototype.openLessonPage.call(this, key, patternType, patternId);
            }
        },
        populateLessonTheoryDetails: function(container, key, patternType, patternId) {
            if (typeof App !== 'undefined' && App.prototype.populateLessonTheoryDetails) {
                App.prototype.populateLessonTheoryDetails.call(this, container, key, patternType, patternId);
            }
        }
    };

    // Load favorites from localStorage
    let favoriteChords = {};
    try {
        const stored = JSON.parse(localStorage.getItem('favoriteChords') || '{}');
        favoriteChords = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch (e) { favoriteChords = {}; }
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

    // Get chords, intervals, and scales from MusicTheory class
    const chords = musicTheory.chords;
    const intervals = musicTheory.intervals;
    const scales = musicTheory.scales;
    const namedChordSignatures = new Set(Object.entries(chords)
        .filter(([id]) => !id.startsWith('more_chord_'))
        .map(([, chord]) => baseZero(chord.intervals)));

    // Store all created chord item elements and their associated data
    let allChordData = [];

    // Function to populate the chord list
    function populateChords() {
        chordListContainer.innerHTML = '';
        allChordData = [];
        
        const sortedChordEntries = Object.entries(chords).sort(([, a], [, b]) => a.name.localeCompare(b.name));

        sortedChordEntries.forEach(([id, data]) => {
            const named = namedChordSignatures.has(baseZero(data.intervals));
            const chordItemElement = document.createElement('div');
            chordItemElement.className = 'chord-item';
            
            const details = document.createElement('div');
            details.className = 'chord-details';

            // Chord Name Heading
            const nameHeading = document.createElement('h3');
            nameHeading.textContent = data.name;
            details.appendChild(nameHeading);

            const exampleNotes = musicTheory.getChordNotes('C', id);
            const base0 = baseZero(data.intervals);
            appendFact(details, 'Formula', data.intervals.join(' - '), 'chord-notes');
            appendFact(details, 'Example (C root)', exampleNotes.join(' - '), 'chord-notes');
            appendFact(details, 'Base 0 pitch classes', base0, 'chord-notes');

            const description = musicTheory.getChordDescription(id);
            const aboutText = description && description.indexOf('combination of three or more notes') === -1
                ? description + ' Formula: ' + data.intervals.join(' - ') + '. Base-0 pitch classes: ' + base0 + '.'
                : data.name + ' uses ' + data.intervals.length + ' tones: ' + data.intervals.join(' - ') + '. Base-0 pitch classes: ' + base0 + '.';
            appendFact(details, 'About', aboutText, '');

            // Buttons Container
            const buttonPairContainer = document.createElement('div');
            buttonPairContainer.className = 'button-pair-container';

            // Hear Chord Button
            const hearBtn = document.createElement('button');
            hearBtn.className = 'hear-chord-button';
            hearBtn.textContent = 'Hear Chord';
            hearBtn.addEventListener('click', async () => {
                try {
                    const started = await window.STAudioPreview.playTheoryItem('chord', 'C', id, musicTheory);
                    if (!started && window.ST) ST.toast('Audio playback is not available in this browser.');
                } catch (error) {
                    console.warn('Chord preview failed:', error);
                    if (window.ST) ST.toast('Could not play this chord. Tap to try again.');
                }
            });

            // View on Fretboard Button
            const showBtn = document.createElement('button');
            showBtn.className = 'view-diagram-button';
            showBtn.textContent = 'Fretboard';
            showBtn.addEventListener('click', () => {
                window.location.href = `fretboard.html?key=C&patternType=chord&pattern=${encodeURIComponent(id)}`;
            });

            // Learn Button
            const learnBtn = document.createElement('button');
            learnBtn.className = 'learn-button';
            learnBtn.textContent = 'Learn';
            learnBtn.addEventListener('click', () => {
                // v1.0 fix: the lesson viewer lives in the main app (App is not loaded on this page,
                // so this button previously did nothing). Open the chord there with its lesson.
                window.location.href = `fretboard.html?key=C&patternType=chord&pattern=${encodeURIComponent(id)}&action=learn`;
            });

            buttonPairContainer.appendChild(hearBtn);
            buttonPairContainer.appendChild(showBtn);
            buttonPairContainer.appendChild(learnBtn);
            details.appendChild(buttonPairContainer);

            chordItemElement.appendChild(details);

            // Favorite Star Toggle
            const favButton = document.createElement('button');
            favButton.type = 'button';
            favButton.className = 'favorite-button';
            favButton.textContent = favoriteChords[id] ? '★' : '☆';
            favButton.classList.toggle('favorited', !!favoriteChords[id]);
            favButton.title = favoriteChords[id] ? 'Remove chord from Favorites' : 'Save chord to Favorites';
            favButton.setAttribute('aria-label', favButton.title);
            favButton.setAttribute('aria-pressed', String(!!favoriteChords[id]));
            favButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(id, favButton, chordItemElement);
            });
            chordItemElement.appendChild(favButton);

            chordListContainer.appendChild(chordItemElement);
            allChordData.push({ id, data, element: chordItemElement, named });
        });
    }

    // Populate Interval Checkboxes
    function populateIntervalFilters() {
        intervalFilterListContainer.innerHTML = '';
        const sortedIntervals = Object.entries(intervals).sort(([, a], [, b]) => a.semitones - b.semitones);
        
        sortedIntervals.forEach(([id, data]) => {
            const filterItem = document.createElement('div');
            filterItem.className = 'interval-filter-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `filter-${id}`;
            checkbox.value = id;
            checkbox.addEventListener('change', filterAndSortChords);
            
            const label = document.createElement('label');
            label.htmlFor = `filter-${id}`;
            label.textContent = data.shortName;
            
            filterItem.appendChild(checkbox);
            filterItem.appendChild(label);
            intervalFilterListContainer.appendChild(filterItem);
        });
    }

    // Populate Scale Select
    function populateScaleSelect() {
        const sortedScales = Object.entries(scales).sort(([, a], [, b]) => a.name.localeCompare(b.name));
        sortedScales.forEach(([id, data]) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = data.name;
            scaleFilterSelect.appendChild(opt);
        });
        scaleFilterSelect.addEventListener('change', filterAndSortChords);
    }

    // Toggle Favorite Function
    function toggleFavorite(chordId, buttonElement) {
        const wasSaved = !!favoriteChords[chordId];
        if (wasSaved) delete favoriteChords[chordId];
        else favoriteChords[chordId] = true;
        try { localStorage.setItem('favoriteChords', JSON.stringify(favoriteChords)); }
        catch (error) {
            if (wasSaved) favoriteChords[chordId] = true;
            else delete favoriteChords[chordId];
            if (window.ST && ST.toast) ST.toast('Could not update Favorites. Check device storage.');
        }
        const saved = !!favoriteChords[chordId];
        buttonElement.classList.toggle('favorited', saved);
        buttonElement.textContent = saved ? '★' : '☆';
        buttonElement.title = saved ? 'Remove chord from Favorites' : 'Save chord to Favorites';
        buttonElement.setAttribute('aria-label', buttonElement.title);
        buttonElement.setAttribute('aria-pressed', String(saved));
        filterAndSortChords();
    }

    // Filter Logic
    function filterAndSortChords() {
        const selectedIntervals = Array.from(intervalFilterListContainer.querySelectorAll('input[type="checkbox"]:checked'))
                                       .map(cb => cb.value);
        const selectedScaleId = scaleFilterSelect.value;
        const showOnlyFavorites = showFavoritesCheckbox.checked;
        const showOnlyNamed = namedOnlyCheckbox.checked;
        const showModeIntervalsOnly = modeIntervalsOnlyCheckbox.checked;
        let visibleCount = 0;

        let scaleIntervals = null;
        if (selectedScaleId && scales[selectedScaleId]) {
            scaleIntervals = scales[selectedScaleId].intervals;
        }

        allChordData.forEach(item => {
            const chordIntervals = item.data.intervals;
            
            const chordSemis = new Set(chordIntervals.map(semisOf));
            const matchesIntervals = selectedIntervals.length === 0 || 
                                     selectedIntervals.every(int => chordSemis.has(semisOf(int)));
            
            // v1.0 fix: compare by pitch so 9ths/11ths/#5 etc. match their scale-degree equivalents
            const scaleSemis = scaleIntervals ? new Set(scaleIntervals.map(semisOf)) : null;
            const matchesScale = !scaleSemis || 
                                 chordIntervals.every(int => scaleSemis.has(semisOf(int)));
            
            const matchesFavorite = !showOnlyFavorites || favoriteChords[item.id];
            const matchesNamed = !showOnlyNamed || item.named;
            const matchesModeIntervals = !showModeIntervalsOnly || item.data.intervals.every(interval => window.STModeIntervals.has(interval));

            if (matchesIntervals && matchesScale && matchesFavorite && matchesNamed && matchesModeIntervals) {
                item.element.classList.remove('hidden');
                visibleCount++;
            } else {
                item.element.classList.add('hidden');
            }
        });
        resultsCountDisplay.textContent = visibleCount === allChordData.length
            ? 'Showing all ' + allChordData.length + ' chords'
            : 'Showing ' + visibleCount + ' of ' + allChordData.length + ' chords';
    }

    // Clear Filters
    clearFiltersButton.addEventListener('click', () => {
        intervalFilterListContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        scaleFilterSelect.value = '';
        showFavoritesCheckbox.checked = false;
        namedOnlyCheckbox.checked = false;
        modeIntervalsOnlyCheckbox.checked = false;
        filterAndSortChords();
    });

    showFavoritesCheckbox.addEventListener('change', filterAndSortChords);
    namedOnlyCheckbox.addEventListener('change', filterAndSortChords);
    modeIntervalsOnlyCheckbox.addEventListener('change', filterAndSortChords);

    // Initial load
    populateChords();
    populateIntervalFilters();
    populateScaleSelect();
    filterAndSortChords();
});