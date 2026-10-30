document.addEventListener('DOMContentLoaded', () => {
    const musicTheory = new MusicTheory();
    const intervalListContainer = document.getElementById('interval-list');
    const chordFilterSelect = document.getElementById('chord-filter-select');
    const scaleFilterSelect = document.getElementById('scale-filter-select');
    const clearFiltersButton = document.getElementById('clear-interval-filters');
    const modeIntervalsOnlyCheckbox = document.getElementById('mode-intervals-only');

    // Get intervals, chords, and scales from MusicTheory class
    const intervals = musicTheory.intervals;
    const chords = musicTheory.chords;
    const scales = musicTheory.scales;

    let allIntervalData = []; // Keep track of interval elements and their data

    function playInterval(semitones, harmonic, intervalId) {
        const preview = intervalId
            ? window.STAudioPreview.playTheoryItem('interval', 'C', intervalId, musicTheory, harmonic)
            : window.STAudioPreview.playInterval(semitones, harmonic);
        preview.then(started => {
            if (!started && window.ST) ST.toast('Audio playback is not available in this browser.');
        }).catch(error => {
            console.warn('Interval preview failed:', error);
            if (window.ST) ST.toast('Could not play this interval. Tap to try again.');
        });
    }

    // Sort intervals by semitone count for initial display logic
    const sortedIntervals = Object.entries(intervals).sort(([, a], [, b]) => a.semitones - b.semitones);

    // Populate the list
    sortedIntervals.forEach(([id, data]) => {
        const intervalItemElement = document.createElement('div');
        intervalItemElement.className = 'interval-item';
        intervalItemElement.dataset.intervalId = id;
        intervalItemElement.dataset.intervalName = data.name;
        const baseZero = ((data.semitones % 12) + 12) % 12;
        const base0Set = baseZero === 0 ? '0' : '0-' + baseZero;
        intervalItemElement.dataset.base0 = base0Set;

        // Main container for swatch and details
        const mainContentDiv = document.createElement('div');
        mainContentDiv.style.display = 'flex';
        mainContentDiv.style.alignItems = 'center';
        mainContentDiv.style.width = '100%'; // Ensure it takes full width for details

        // Color swatch
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'interval-color-swatch';
        const shade = Math.max(72, Math.round(238 - Math.min(24, data.semitones) * 6));
        colorSwatch.style.backgroundColor = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
        mainContentDiv.appendChild(colorSwatch);

        // Details
        const details = document.createElement('div');
        details.className = 'interval-details';

        const nameHeading = document.createElement('h3');
        nameHeading.textContent = `${data.name} (${data.shortName})`;
        // Example in C so the interval is concrete
        const example = document.createElement('p');
        const target = musicTheory.getNoteFromInterval('C', id);
        example.textContent = `Example: C → ${target}`;
        details.appendChild(nameHeading);

        const semitonesPara = document.createElement('p');
        semitonesPara.textContent = 'Semitones: ' + data.semitones;
        details.appendChild(semitonesPara);
        const base0Para = document.createElement('p');
        base0Para.textContent = 'Base 0 pitch classes: ' + base0Set;
        details.appendChild(base0Para);
        const aboutPara = document.createElement('p');
        const complement = data.semitones === 0 ? 'It repeats the root pitch class.' : 'Its octave complement spans ' + (12 - baseZero) + ' semitones.';
        aboutPara.textContent = 'About: ' + data.name + ' spans ' + data.semitones + ' equal-tempered semitones from the root. ' + complement;
        details.appendChild(aboutPara);
        details.appendChild(example);

        mainContentDiv.appendChild(details);
        intervalItemElement.appendChild(mainContentDiv);

        // --- v1.0: offline interval playback (Web Audio synth) ---
        // Replaces a placeholder <audio src="C:/dummy.mp3"> that could never play.
        const playRow = document.createElement('div');
        playRow.style.cssText = 'display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;';
        [['▶ Melodic', false], ['▶ Harmonic', true]].forEach(([label, harmonic]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'view-diagram-button';
            b.textContent = label;
            b.style.cssText = 'padding:6px 10px;font-size:0.85em;';
            b.addEventListener('click', () => playInterval(data.semitones, harmonic, id));
            playRow.appendChild(b);
        });
        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.className = 'view-diagram-button interval-favorite-button';
        const syncFavorite = () => {
            const saved = !!(window.ST && ST.favorites && ST.favorites.has('interval', id));
            const label = saved ? 'Remove ' + data.name + ' from Favorites' : 'Save ' + data.name + ' to Favorites';
            favoriteButton.textContent = saved ? '★ Saved' : '☆ Favorite';
            favoriteButton.setAttribute('aria-label', label);
            favoriteButton.setAttribute('aria-pressed', String(saved));
            favoriteButton.title = label;
        };
        favoriteButton.addEventListener('click', event => {
            event.stopPropagation();
            if (!window.ST || !ST.favorites) return;
            const result = ST.favorites.toggle({
                type: 'interval', id, title: data.name,
                href: 'fretboard.html?key=C&patternType=interval&pattern=' + encodeURIComponent(id),
                data: { formula: id, semitones: data.semitones, example: 'C to ' + target }
            });
            syncFavorite();
            if (!result.ok && window.ST.toast) ST.toast('Could not save this favorite. Check device storage.');
        });
        window.addEventListener('st:favoriteschange', syncFavorite);
        syncFavorite();
        playRow.appendChild(favoriteButton);
        intervalItemElement.appendChild(playRow);

        // --- Create Show on Fretboard Button ---
        const showLink = document.createElement('a');
        // default to key C; open main app with patternType=interval and the interval id
        showLink.href = `fretboard.html?key=C&patternType=interval&pattern=${encodeURIComponent(id)}`;
        showLink.className = 'view-diagram-button';
        showLink.textContent = 'Show on Fretboard';
        showLink.style.cssText = 'display:inline-flex;align-self:flex-start;align-items:center;justify-content:center;margin-top:8px;text-decoration:none;flex:0 0 auto;';
        intervalItemElement.appendChild(showLink);

        // Don't append yet, store data and element
        allIntervalData.push({ id, data, element: intervalItemElement });
    });

    // Populate Chord Filter Dropdown
    const sortedChords = Object.entries(chords).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    sortedChords.forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = data.name;
        chordFilterSelect.appendChild(option);
    });

    // Populate Scale Filter Dropdown
    const sortedScales = Object.entries(scales).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    sortedScales.forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = data.name;
        scaleFilterSelect.appendChild(option);
    });

    // Filter and Sort Function for Intervals
    function filterAndSortIntervals() {
        const selectedChordId = chordFilterSelect.value;
        const selectedScaleId = scaleFilterSelect.value;

        let allowedIntervals = null; // Set of intervals to show

        if (selectedChordId) {
            allowedIntervals = new Set(chords[selectedChordId]?.intervals || []);
        } else if (selectedScaleId) {
            allowedIntervals = new Set(scales[selectedScaleId]?.intervals || []);
        }

        // 1. Filter the interval data
        const showModeIntervalsOnly = modeIntervalsOnlyCheckbox.checked;
        const visibleIntervalsData = allIntervalData.filter(itemData => {
            const intervalId = itemData.id;
            if (showModeIntervalsOnly && !window.STModeIntervals.has(intervalId)) return false;
            // If a chord or scale filter is active, also match enharmonic spellings.
            if (allowedIntervals) {
                if (allowedIntervals.has(intervalId)) return true;
                // v1.0: also match enharmonic spellings (e.g. a chord's #5 shows the b6 card)
                const semis = itemData.data.semitones;
                const pitchClass = ((semis % 12) + 12) % 12;
                return Array.from(allowedIntervals).some(label => {
                    const value = musicTheory.getIntervalSemitones(label);
                    return value !== null && ((value % 12) + 12) % 12 === pitchClass;
                });
            }
            return true; // Otherwise, show all intervals
        });

        // 2. Sort the filtered data alphabetically by name
        // v1.0 fix: order by interval size (alphabetical put "Augmented 2nd" before "Minor 2nd")
        visibleIntervalsData.sort((a, b) => (a.data.semitones - b.data.semitones) || a.data.name.localeCompare(b.data.name));

        // 3. Update the DOM
        intervalListContainer.innerHTML = ''; // Clear the container
        visibleIntervalsData.forEach(itemData => {
            intervalListContainer.appendChild(itemData.element); // Append sorted visible items
            itemData.element.classList.remove('hidden'); // Ensure it's visible
        });

    }

    // Event Listeners
    chordFilterSelect.addEventListener('change', () => {
        if (chordFilterSelect.value) {
            scaleFilterSelect.value = ''; // Reset scale filter if chord is selected
        }
        filterAndSortIntervals(); // Call the updated function
    });

    scaleFilterSelect.addEventListener('change', () => {
        if (scaleFilterSelect.value) {
            chordFilterSelect.value = ''; // Reset chord filter if scale is selected
        }
        filterAndSortIntervals(); // Call the updated function
    });

    clearFiltersButton.addEventListener('click', () => {
        chordFilterSelect.value = '';
        scaleFilterSelect.value = '';
        modeIntervalsOnlyCheckbox.checked = false;
        filterAndSortIntervals();
    });

    modeIntervalsOnlyCheckbox.addEventListener('change', filterAndSortIntervals);

    // Initial population and sort/filter run (shows all initially, sorted)
    filterAndSortIntervals();
});