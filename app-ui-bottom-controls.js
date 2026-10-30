/**
 * UI Bottom Controls - Main Controls Section
 */
if (typeof App !== 'undefined') {
    App.prototype.getBottomControlsHtml = function() {
        const firstFretOptions = Array.from({length: 25}, (_, fret) => `<option value="${fret}"${fret === 0 ? ' selected' : ''}>${fret}</option>`).join('');
        const lastFretOptions = Array.from({length: 24}, (_, i) => { const fret = i + 1; return `<option value="${fret}"${fret === 12 ? ' selected' : ''}>${fret}</option>`; }).join('');
        return `
        <footer id="controls-bottom" class="bottom-footer" style="display: none;">
            <div class="control-group" style="display:none;">
                <label for="key-select">Key:</label>
                <select id="key-select">
                    <option value="C">C</option>
                    <option value="G">G</option>
                    <option value="D">D</option>
                    <option value="A">A</option>
                    <option value="E">E</option>
                    <option value="B">B</option>
                    <option value="F#">F#</option>
                    <option value="C#">C#</option>
                    <option value="F">F</option>
                    <option value="A#">A#</option>
                    <option value="D#">D#</option>
                    <option value="G#">G#</option>
                    <option value="Db">Db</option>
                    <option value="Eb">Eb</option>
                    <option value="Gb">Gb</option>
                    <option value="Ab">Ab</option>
                    <option value="Bb">Bb</option>
                </select>
            </div>

            <div class="control-group">
                <input type="checkbox" id="show-fret-numbers" checked>
                <label for="show-fret-numbers" id="show-fret-numbers-icon">Show fret numbers</label>
                <label for="fret-numbers-shape">Number background:</label>
                <select id="fret-numbers-shape">
                    <option value="none" selected>None (numbers only)</option>
                    <option value="pill">Pill</option>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                    <option value="triangle-down">Triangle down</option>
                    <option value="diamond">Diamond</option>
                    <option value="pentagon">Pentagon</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="octagon">Octagon</option>
                    <option value="star-5">Star (5 points)</option>
                    <option value="star-6">Star (6 points)</option>
                    <option value="burst">Burst</option>
                    <option value="sun">Sun</option>
                    <option value="heart">Heart</option>
                    <option value="leaf">Leaf</option>
                    <option value="teardrop">Teardrop</option>
                    <option value="ellipse">Ellipse</option>
                    <option value="rounded-square">Rounded square</option>
                    <option value="ring">Ring</option>
                    <option value="double-ring">Double ring</option>
                    <option value="dashed-ring">Dashed ring</option>
                    <option value="plus">Plus</option>
                    <option value="shield">Shield</option>
                    <option value="tag">Tag</option>
                    <option value="scallop">Scalloped</option>
                    <option value="corners">Corners</option>
                    <option value="ticket">Ticket</option>
                    <option value="cloud">Cloud</option>
                </select>
                <span id="fret-numbers-shape-display" hidden></span>
            </div>

            <div class="control-group" style="display:none;">
                <label for="pattern-type">Pattern Type:</label>
                <select id="pattern-type">
                    <option value="scale">Scale</option>
                    <option value="chord">Chord</option>
                    <option value="interval">Interval</option>
                    <option value="gamut">Gamut</option>
                    <option value="grid">Grid (3-Fret Spans)</option>
                    <option value="grid2">Grid (2-Fret Spans)</option>
                    <option value="custom">Custom</option>
                    <option value="layout-notes-1">1 note per string</option>
                    <option value="layout-notes-2">2 notes per string</option>
                    <option value="layout-notes-3">3 notes per string</option>
                    <option value="layout-notes-4">4 notes per string</option>
                    <option value="layout-span-3">3-fret span</option>
                    <option value="layout-span-4">4-fret span</option>
                    <option value="layout-span-5">5-fret span</option>
                    <option value="layout-span-6">6-fret span</option>
                    <option value="layout-octave-1">One octave</option>
                    <option value="layout-octave-2">Two octaves</option>
                    <option value="layout-low-3">Lowest 3 strings</option>
                    <option value="layout-high-3">Highest 3 strings</option>
                    <option value="layout-low-2">Lowest 2 strings</option>
                    <option value="layout-high-2">Highest 2 strings</option>
                    <option value="layout-middle">Middle strings</option>
                    <option value="layout-notes-5">5 notes per string</option>
                    <option value="layout-notes-6">6 notes per string</option>
                    <option value="layout-span-2">2-fret span</option>
                    <option value="layout-span-7">7-fret span</option>
                    <option value="layout-span-8">8-fret span</option>
                    <option value="layout-span-9">9-fret span</option>
                    <option value="layout-span-10">10-fret span</option>
                    <option value="layout-low-4">Lowest 4 strings</option>
                    <option value="layout-high-4">Highest 4 strings</option>
                    <option value="layout-low-1">Lowest string</option>
                    <option value="layout-high-1">Highest string</option>
                    <option value="layout-low-3-notes-2">Lowest 3 strings, 2 notes each</option>
                    <option value="layout-high-3-notes-2">Highest 3 strings, 2 notes each</option>
                    <option value="layout-low-3-notes-3">Lowest 3 strings, 3 notes each</option>
                    <option value="layout-high-3-notes-3">Highest 3 strings, 3 notes each</option>
                    <option value="layout-middle-notes-2">Middle strings, 2 notes each</option>
                    <option value="layout-low-3-octave">Octave on lowest 3 strings</option>
                    <option value="layout-high-3-octave">Octave on highest 3 strings</option>
                    <option value="layout-middle-octave">Octave on middle strings</option>
                    <option value="layout-low-2-notes-2">Lowest 2 strings, 2 notes each</option>
                    <option value="layout-notes-7">7 notes per string</option>
                    <option value="layout-span-11">11-fret span</option>
                    <option value="layout-span-13">13-fret span</option>
                    <option value="layout-span-14">14-fret span</option>
                    <option value="layout-span-15">15-fret span</option>
                    <option value="layout-span-16">16-fret span</option>
                    <option value="layout-span-18">18-fret span</option>
                    <option value="layout-low-5">Lowest 5 strings</option>
                    <option value="layout-high-5">Highest 5 strings</option>
                    <option value="layout-middle-span-6">Middle strings, 6-fret span</option>
                    <option value="layout-middle-span-3">Middle strings, 3-fret span</option>
                    <option value="layout-middle-notes-1">Middle strings, 1 note each</option>
                    <option value="layout-middle-notes-3">Middle strings, 3 notes each</option>
                    <option value="layout-middle-notes-4">Middle strings, 4 notes each</option>
                    <option value="layout-low-2-notes-1">Lowest 2 strings, 1 note each</option>
                    <option value="layout-high-2-notes-1">Highest 2 strings, 1 note each</option>
                    <option value="layout-low-2-notes-3">Lowest 2 strings, 3 notes each</option>
                    <option value="layout-high-2-notes-3">Highest 2 strings, 3 notes each</option>
                    <option value="layout-low-3-notes-1">Lowest 3 strings, 1 note each</option>
                    <option value="layout-high-3-notes-1">Highest 3 strings, 1 note each</option>
                    <option value="layout-low-3-notes-4">Lowest 3 strings, 4 notes each</option>
                    <option value="layout-high-3-notes-4">Highest 3 strings, 4 notes each</option>
                    <option value="layout-low-4-notes-2">Lowest 4 strings, 2 notes each</option>
                    <option value="layout-high-4-notes-2">Highest 4 strings, 2 notes each</option>
                    <option value="layout-low-4-notes-3">Lowest 4 strings, 3 notes each</option>
                    <option value="layout-high-4-notes-3">Highest 4 strings, 3 notes each</option>
                    <option value="layout-low-5-notes-2">Lowest 5 strings, 2 notes each</option>
                    <option value="layout-high-5-notes-2">Highest 5 strings, 2 notes each</option>
                    <option value="layout-low-2-octave">Octave on lowest 2 strings</option>
                    <option value="layout-high-2-octave">Octave on highest 2 strings</option>
                    <option value="layout-low-4-octave">Octave on lowest 4 strings</option>
                    <option value="layout-high-4-octave">Octave on highest 4 strings</option>
                    <option value="layout-low-5-octave">Octave on lowest 5 strings</option>
                    <option value="layout-low-3-two-octaves">Two octaves on lowest 3 strings</option>
                    <option value="layout-high-3-two-octaves">Two octaves on highest 3 strings</option>
                    <option value="layout-middle-two-octaves">Two octaves on middle strings</option>
                    <option value="layout-low-3-span-6">6-fret span on lowest 3 strings</option>
                    <option value="layout-high-3-span-6">6-fret span on highest 3 strings</option>
                    <option value="layout-low-2-span-6">6-fret span on lowest 2 strings</option>
                    <option value="layout-high-2-span-6">6-fret span on highest 2 strings</option>
                    <option value="layout-low-4-span-6">6-fret span on lowest 4 strings</option>
                    <option value="layout-high-4-span-6">6-fret span on highest 4 strings</option>
                    <option value="layout-low-3-span-3">3-fret span on lowest 3 strings</option>
                    <option value="layout-high-3-span-3">3-fret span on highest 3 strings</option>
                    <option value="layout-middle-span-8">8-fret span on middle strings</option>
                    <option value="none">No pattern</option>
                </select>
            </div>

            <div class="control-group" id="custom-pattern-import-group" style="display: none; flex-direction: column; gap: 5px;">
                <label for="custom-pattern-import">Import (Name | 0123456789AB):</label>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <input type="text" id="custom-pattern-import" placeholder="My Pattern | 024579B" style="flex: 1; min-width: 150px;">
                    <button id="btn-import-custom" style="width: auto;">Import</button>
                    <label for="import-custom-csv" style="margin: 0; padding: 0 12px; background: var(--secondary-color); color: #fff; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: normal; font-size: 14px; white-space: nowrap;" title="Import from CSV (Requires 'Name' and 'Pattern' columns)">CSV</label>
                    <input type="file" id="import-custom-csv" accept=".csv" style="display: none;">
                    <button id="btn-add-all-to-custom" style="width: auto; background-color: #f39c12; color: white; padding: 0 10px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center;" title="Add all built-in patterns to custom">All</button>
                    <button id="btn-delete-all-custom" style="width: auto; background-color: #e74c3c; color: white; padding: 0 10px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center;" title="Delete all custom patterns">🗑️</button>
                </div>
            </div>
            
            <div class="control-group" style="display:none;">
                <label for="pattern-select">Pattern:</label>
                <select id="pattern-select">
                    <!-- Options will be populated based on pattern type -->
                </select>
            </div>
            <div class="control-group" style="display:none;">
                <label for="layout-base-type">Base type:</label>
                <select id="layout-base-type">
                    <option value="scale">Scale</option>
                    <option value="chord">Chord</option>
                    <option value="interval">Interval</option>
                </select>
                <label for="layout-base-select">Base:</label>
                <select id="layout-base-select"></select>
            </div>
            <div class="control-group">
                <label for="start-fret">Start Fret:</label>
                <select id="start-fret" aria-label="First visible fret">${firstFretOptions}</select>
            </div>
            <div class="control-group">
                <label for="end-fret">End Fret:</label>
                <select id="end-fret" aria-label="Last visible fret">${lastFretOptions}</select>
            </div>

            <div class="control-group">
                <input type="checkbox" id="capo-enable">
                <label for="capo-enable" id="capo-enable-icon">Enable capo</label>
                <label for="capo-fret">Capo at fret:</label>
                <input type="number" id="capo-fret" min="0" max="24" value="0">
                <label for="capo-style">Capo style:</label>
                <select id="capo-style">
                    <option value="bar" selected>Bar</option>
                    <option value="thin">Thin</option>
                    <option value="double">Double</option>
                    <option value="chrome">Chrome</option>
                    <option value="gold">Gold</option>
                    <option value="wood">Wood</option>
                    <option value="rubber">Rubber</option>
                    <option value="clamp">Clamp</option>
                    <option value="pill">Pill</option>
                    <option value="notched">Notched</option>
                    <option value="shadow">Shadow</option>
                    <option value="blue">Blue</option>
                    <option value="red">Red</option>
                    <option value="striped">Striped</option>
                    <option value="dots">Dots</option>
                </select>
            </div>
            <div class="control-group">
                <label for="display-mode">Display Mode:</label>
                <select id="display-mode">
                    <option value="intervals">Intervals</option>
                    <option value="notes">Notes</option>
                    <option value="roman">Roman Numerals</option>
                    <option value="solfege">Solfège (Do Re Mi)</option>
                    <option value="none">No Text</option>
                </select>
            </div>
            <div class="control-group">
                <label for="color-theme">Color Theme:</label>
                <select id="color-theme">
                    <option value="default_ii">Default</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            <div class="control-group">
                <label for="page-theme">Page Theme:</label>
                <select id="page-theme">
                    <!-- Options populated dynamically in app-ui.js -->
                </select>
            </div>
            <div class="control-group">
                <label for="font-size">Base Font Size:</label>
                <select id="font-size">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                </select>
            </div>
            <div class="control-group">
                <label for="slideshow-bpm">Slideshow BPM:</label>
                <input type="number" id="slideshow-bpm" min="10" max="300" value="60" style="width: 60px;">
            </div>
            <div class="control-group">
                <label for="slideshow-loop">Loop:</label>
                <input type="checkbox" id="slideshow-loop" style="width: auto;">
            </div>
            <div class="control-group">
                <label for="slideshow-duration">Duration (measures):</label>
                <input type="number" id="slideshow-duration" min="0.1" step="0.1" value="1" style="width: 60px;">
            </div>
            <div class="control-group">
                 <button id="sidebar-add-to-slideshow">Add to Slideshow</button>
            </div>

            <!-- Moved slideshow export & CSV controls into bottom area -->
            <div class="control-group" style="display:flex;gap:8px;align-items:center;">
                <button id="export-all" title="Export All Slideshow Items" style="background:#000;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🗂️</button>
                <button id="export-diagrams-only" title="Export Slideshow Diagrams Only" style="background:#000;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🖼️</button>
                <button id="export-slideshow-pdf" title="Export Slideshow as PDF" style="background:#c0392b;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📄</button>
                <button id="set-filename" title="Set Filename" style="background:#f39c12;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">✏️</button>
                <button id="clear-slideshow" title="Clear Slideshow" style="background:#e74c3c;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🗑️</button>
            </div>
            <div class="control-group" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="download-slideshow-template" title="Download Full Template" style="background:#7f8c8d;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📋</button>
                <button id="export-slideshow-csv" title="Export Current to CSV" style="background:#34495e;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📤</button>
                <label for="import-slideshow-csv" title="Import CSV File" style="margin:0;width:32px;height:32px;min-width:32px;cursor:pointer;"><span style="background:var(--secondary-color);color:#fff;padding:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:16px;">📥</span></label>
                <input type="file" id="import-slideshow-csv" accept=".csv" style="display: none;">
            </div>
            <div class="control-group" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="play-slideshow" title="Play Slideshow" style="background:var(--primary-color);color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">▶️</button>
                <button id="pause-slideshow" title="Pause Slideshow" style="background:var(--secondary-color);color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:none;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">⏸️</button>
            </div>

            <div class="control-group" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <label for="cof-duration" style="margin:0;">Seconds per key:</label>
                <input id="cof-duration" type="number" min="0.5" max="30" step="0.5" value="2" style="width:84px;">
                <button id="play-cof-loop" type="button">Play Circle of Fifths</button>
                <button id="stop-cof-loop" type="button" style="display:none;">Stop Fifths</button>
                <button id="play-cof4-loop" type="button">Play Circle of Fourths</button>
                <button id="stop-cof4-loop" type="button" style="display:none;">Stop Fourths</button>
            </div>
            <div class="control-group" style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button id="chromatic-tuner-toggle" type="button">Show reference notes</button>
                <div id="chromatic-tuner-container" style="display:none;">
                    <div class="chromatic-tuner-buttons"></div>
                </div>
            </div>

            <!-- Melodic pattern quick controls moved to bottom -->
            <div class="control-group" style="display:flex;align-items:center;gap:8px;width:100%;">
                <label for="melodic-pattern-select" style="margin:0;font-weight:700;">Melodic Pattern:</label>
                <select id="melodic-pattern-select" style="min-width:160px;"></select>
                <div id="custom-pattern-container" style="display:none;min-width:140px;">
                    <label class="sr-only" for="custom-pattern">Custom degree sequence</label>
                    <input id="custom-pattern" type="text" placeholder="e.g. 1 3 5 3" inputmode="text" style="width:140px;">
                </div>
                <button id="play-melodic-pattern" type="button" style="padding:6px 10px;background:var(--primary-color);color:#fff;border-radius:6px;">Play</button>
                <button id="stop-melodic-pattern" type="button" style="display:none;padding:6px 10px;background:#b23b3b;color:#fff;border-radius:6px;">Stop</button>
                <button id="step-melodic-pattern" type="button" aria-label="Play the next note in the melodic pattern" style="padding:6px 10px;background:#777;color:#fff;border-radius:6px;">Step</button>
                <label for="melodic-tempo" style="margin-left:8px;font-weight:700;">BPM:</label>
                <input id="melodic-tempo" type="number" min="20" max="300" value="120" inputmode="numeric" style="width:70px;">
                <span id="melodic-pattern-status" role="status" aria-live="polite" style="flex-basis:100%;font-size:.82em;color:var(--secondary-color);"></span>
            </div>
            <div class="control-group">
                <label for="melodic-octave">Octave range:</label>
                <select id="melodic-octave">
                    <option value="1">1 octave</option>
                    <option value="2">2 octaves</option>
                    <option value="3" selected>3 octaves</option>
                </select>
            </div>
            <div class="control-group">
                <label for="melodic-chain-count">Chain length:</label>
                <input type="number" id="melodic-chain-count" min="1" max="20" value="1" inputmode="numeric" style="width:60px;">
                <div id="melodic-chain-container" style="display:flex;flex-direction:column;gap:6px;width:100%;"></div>
            </div>
            <div class="control-group" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="melodic-export-midi" type="button" style="padding:6px 10px;border-radius:6px;">Export MIDI</button>
                <button id="melodic-export-all-keys" type="button" style="padding:6px 10px;border-radius:6px;">Export all keys (ZIP)</button>
                <button id="melodic-export-family" type="button" style="padding:6px 10px;border-radius:6px;">Export family (ZIP)</button>
                <button id="melodic-export-family-midi" type="button" style="padding:6px 10px;border-radius:6px;">Export family (single MIDI)</button>
            </div>
            <div class="control-group">
                <input type="checkbox" id="melodic-animate">
                <label for="melodic-animate">Animate notes</label>
            </div>
        </footer>
        `;
    };

    App.prototype.organizeBoardControls = function() {
        const panel = document.getElementById('controls-bottom');
        if (!panel || panel.querySelector('.board-control-section')) return;
        const sections = [
            ['board-display', 'Diagram display', 'Choose the text on note markers and fret-number backgrounds. Capo shifts fretted diagrams only; keyboards and open-pitch maps ignore it. Fret window and tuning are in Instrument. Animate notes pulses markers during melodic exercises.', ['display-mode', 'show-fret-numbers', 'capo-enable', 'capo-style', 'melodic-animate']],
            ['board-melody', 'Melodic exercises', 'Plays a degree sequence on the notes selected in Diagram 1, starting from the key. Each full pass through those notes rises an octave, up to the Octave range. Chain length plays up to 20 presets back to back, each an octave higher than the last. A sequence override replaces the preset, except when the preset is Custom, and works only when chain length is 1. Play next note advances one note. Export MIDI saves this exercise; Export all keys saves all 12 keys as a ZIP; Export family saves every pattern in the Diagram 1 family as a ZIP, or as one MIDI.', ['melodic-pattern-select', 'melodic-octave', 'melodic-chain-count', 'melodic-chain-container', 'melodic-export-midi', 'melodic-export-all-keys', 'melodic-export-family', 'melodic-export-family-midi']],
            ['board-pattern-cycle', 'Cycle through patterns', 'Replaces the slideshow with every pattern of the selected Type in the current key, then loops. Seconds per pattern sets the slideshow tempo (one measure per slide) and turns Repeat on. Cycle runs in list order; Shuffle randomizes it. Stop or pause from Slideshow playback. Custom patterns cannot be cycled.', []],
            ['board-key-loops', 'Play through keys', 'Plays the selected pattern in 12 keys from C. Fifths go C, G, D...; fourths go C, F, Bb.... Seconds per key is a minimum; a longer pattern finishes its run first. Stopping returns the key to where it started.', ['cof-duration']],
            ['board-slideshow', 'Slideshow playback', 'Save diagrams with Add to Slideshow, then step through them on the metronome. Each measure is 4 beats, so at 60 BPM one measure lasts 4 seconds. Repeat loops back to the first slide. Melodic exercises are not played here.', ['sidebar-add-to-slideshow', 'slideshow-bpm', 'slideshow-duration', 'slideshow-loop', 'play-slideshow']],
            ['board-slideshow-files', 'Slideshow files', 'Export saved slides as images or PDF, or use CSV to save and import the slideshow list. CSV contains slide data, not rendered images. Clear removes the slideshow list, not your patterns.', ['export-all', 'download-slideshow-template']],
            ['board-reference', 'Reference pitches', 'Show the playable piano with pattern highlights, or listen to reference notes at a chosen octave to tune by ear. Reference notes do not use the microphone.', ['chromatic-tuner-toggle']],
            ['board-page-style', 'Colors and text size', 'Marker colors affect diagrams; the page theme and text size affect the interface. More drawing controls are in Appearance.', ['color-theme', 'page-theme', 'font-size']]
        ];
        for (const [id, title, description, controls] of sections) {
            const section = document.createElement('fieldset');
            section.id = id;
            section.className = 'board-control-section';
            const legend = document.createElement('legend');
            legend.textContent = title;
            const help = document.createElement('p');
            help.id = id + '-help';
            help.className = 'board-control-help';
            help.textContent = description;
            section.setAttribute('aria-describedby', help.id);
            section.append(legend, help);
            const moved = new Set();
            controls.forEach(controlId => {
                const control = document.getElementById(controlId);
                const group = control?.closest('.control-group');
                if (group && !moved.has(group)) { section.appendChild(group); moved.add(group); }
            });
            panel.appendChild(section);
        }
        const labels = {
            'display-mode': 'Note marker text:', 'slideshow-bpm': 'Metronome tempo (BPM):',
            'slideshow-duration': 'Measures per slide:', 'slideshow-loop': 'Repeat slideshow',
            'melodic-pattern-select': 'Degree sequence preset:', 'melodic-tempo': 'Exercise tempo (BPM):',
            'cof-duration': 'Minimum seconds per key:', 'color-theme': 'Marker color theme:',
            'page-theme': 'Interface theme:', 'font-size': 'Interface text size:',
            'custom-pattern-import': 'Pattern name | semitone code:'
        };
        Object.entries(labels).forEach(([id, text]) => {
            const label = panel.querySelector('label[for="' + id + '"]');
            if (label) label.textContent = text;
        });
        const buttons = {
            'export-all': 'Export slide JPGs', 'export-diagrams-only': 'Export diagram-only JPGs',
            'export-slideshow-pdf': 'Export slideshow PDF', 'set-filename': 'Set export filename',
            'clear-slideshow': 'Clear slideshow', 'download-slideshow-template': 'Download CSV template',
            'export-slideshow-csv': 'Save slideshow CSV', 'play-slideshow': 'Start slideshow',
            'pause-slideshow': 'Pause slideshow', 'play-melodic-pattern': 'Play exercise',
            'stop-melodic-pattern': 'Stop exercise', 'step-melodic-pattern': 'Play next note',
            'btn-import-custom': 'Import pattern', 'btn-add-all-to-custom': 'Copy all built-in patterns',
            'btn-delete-all-custom': 'Delete all custom patterns'
        };
        Object.entries(buttons).forEach(([id, text]) => {
            const button = document.getElementById(id);
            if (!button) return;
            button.textContent = text;
            button.setAttribute('aria-label', text);
            button.title = text;
            button.classList.add('board-text-button');
        });
        const importLabel = panel.querySelector('label[for="import-slideshow-csv"]');
        importLabel.textContent = 'Import slideshow CSV';
        importLabel.classList.add('board-file-button');
        const custom = document.getElementById('custom-pattern-import-group');
        const help = document.createElement('p');
        help.className = 'board-control-help';
        help.textContent = 'Custom patterns use pitch distances from the root: 0 = root, 1-9 = semitones, A = 10, B = 11. Example: Major triad | 047. CSV import reads name and pattern from each row. Copy adds built-ins to your saved custom library; Delete removes that library.';
        custom.appendChild(help);
    };

}