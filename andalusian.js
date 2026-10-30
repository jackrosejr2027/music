(function () {
  'use strict';

  const theory = window.TD && window.TD['theory.js'];
  const sourceCards = window.TD && window.TD['data/andalusian.js'] && window.TD['data/andalusian.js'].andalusianCards;
  if (!theory || !Array.isArray(sourceCards)) {
    console.error('The shared Andalusian progression deck did not load.');
    return;
  }

  const cards = uniqueCards(sourceCards);
  const keyNames = theory.ROOTS.map(function (root) { return root.name; });
  const fretNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const guitarOpenMidi = [64, 59, 55, 50, 45, 40];
  const modeData = {
    0: { name: 'Aeolian', intervals: [0, 2, 3, 5, 7, 8, 10], pentatonic: [0, 3, 5, 7, 10] },
    3: { name: 'Ionian', intervals: [0, 2, 4, 5, 7, 9, 11], pentatonic: [0, 2, 4, 7, 9] },
    5: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], pentatonic: [0, 3, 5, 7, 10] },
    7: { name: 'Phrygian dominant', intervals: [0, 1, 4, 5, 7, 8, 10], pentatonic: [0, 1, 4, 7, 10] },
    8: { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], pentatonic: [0, 2, 4, 7, 9] },
    10: { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], pentatonic: [0, 2, 4, 7, 10] }
  };
  const bluesIntervals = { minor: [0, 3, 5, 6, 7, 10], major: [0, 2, 3, 4, 7, 9] };
  const chordIntervals = {
    '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10],
    'maj7': [0, 4, 7, 11], 'add9': [0, 4, 7, 14], 'm(add9)': [0, 3, 7, 14],
    '7♭9': [0, 4, 7, 10, 13], 'maj7♯11': [0, 4, 7, 11, 18], '13': [0, 4, 7, 10, 14, 21]
  };
  const SCALE_DEFINITIONS = {
    natural: { title: 'Natural minor', formula: '1–2–♭3–4–5–♭6–♭7', fretboardId: 'natural_minor' },
    harmonic: { title: 'Harmonic minor', formula: '1–2–♭3–4–5–♭6–7', fretboardId: 'harmonic_minor' },
    phrygian: { title: 'Phrygian dominant', formula: '1–♭2–3–4–5–♭6–♭7', fretboardId: 'phrygian_dominant' }
  };
  const rootMidiNames = { C: 0 };
  let activeKey = 'A';
  let activeScale = 'harmonic';
  let activeChordIndex = 0;
  let activeCardIndex = cards.findIndex(function (card) { return card.title === 'Ascending Andalusian' && card.group === 'Original'; });
  let activeChords = [];
  let audioContext = null;
  let activeNodes = [];
  let playTimer = 0;
  let highlightTimers = [];
  let playbackGeneration = 0;

  const keySelect = document.getElementById('key-select');
  const progressionSelect = document.getElementById('progression-select');
  const loopToggle = document.getElementById('loop-progression');
  const tempoInput = document.getElementById('tempo-input');
  const row = document.getElementById('chord-row');
  const playButton = document.getElementById('play-progression');
  const playLabel = document.getElementById('play-label');
  const scaleList = document.getElementById('scale-list');
  const scaleHosts = {
    chord: document.getElementById('diagram-chord'),
    scale: document.getElementById('diagram-scale'),
    blues: document.getElementById('diagram-blues'),
    pentatonic: document.getElementById('diagram-pentatonic')
  };

  function uniqueCards(source) {
    const seen = new Set();
    return source.filter(function (card) {
      const signature = card.title + '|' + card.sub;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }
  function rowValue(card, label) {
    const item = card.rows.find(function (value) { return value[0] === label; });
    return item ? item[1] : '';
  }
  function activeCard() { return cards[activeCardIndex] || cards[0]; }
  function keyTonic() { return theory.noteToTonic(activeKey); }
  function wrap(value) { return ((value % 12) + 12) % 12; }
  function fillSelectors() {
    keyNames.forEach(function (key) { keySelect.add(new Option(key + ' minor', key)); });
    keySelect.value = activeKey;
    ['Original', '7th chords', 'Extended colour'].forEach(function (groupName) {
      const group = document.createElement('optgroup');
      group.label = groupName;
      cards.forEach(function (card, index) {
        if (card.group !== groupName) return;
        const option = new Option(card.title + ' · ' + card.sub, String(index));
        group.appendChild(option);
      });
      progressionSelect.appendChild(group);
    });
    if (activeCardIndex < 0) activeCardIndex = 0;
    progressionSelect.value = String(activeCardIndex);
    document.getElementById('progression-count').textContent = cards.length + ' DAW cards · 12 minor keys';
  }
  function progressionChords(card, key) {
    const transposed = card.transpose(theory.noteToTonic(key));
    const symbols = transposed.v.split('–');
    const numerals = rowValue(card, 'Numerals').split('–');
    return symbols.map(function (symbol, index) {
      return chordInfo(symbol, numerals[index] || '', index);
    });
  }
  function chordInfo(symbol, roman, index) {
    const match = String(symbol).match(/^([A-G](?:♭|♯)?)(.*)$/);
    if (!match) return null;
    const tonic = theory.noteToTonic(match[1]);
    const suffix = match[2];
    const intervals = chordIntervals[suffix] || chordIntervals[''];
    const pitchClasses = new Set(intervals.map(function (interval) { return wrap(tonic.pc + interval); }));
    return {
      symbol: symbol,
      roman: roman.trim(),
      index: index,
      root: tonic.name,
      rootPc: tonic.pc,
      suffix: suffix,
      intervals: intervals,
      pitchClasses: pitchClasses,
      noteNames: Array.from(pitchClasses).map(function (pc) { return fretNames[pc]; }),
      minor: intervals.includes(3) && !intervals.includes(4)
    };
  }
  function scaleInfo(id) {
    const def = SCALE_DEFINITIONS[id] || SCALE_DEFINITIONS.harmonic;
    const key = keyTonic();
    const rootName = id === 'phrygian' ? theory.spell(key, theory.parseDeg('5')) : key.name;
    const root = theory.noteToTonic(rootName);
    const degrees = theory.parseFormula(def.formula);
    const semitones = theory.ascending(degrees).map(function (value) { return wrap(value); });
    const notes = degrees.map(function (degree) { return theory.spell(root, degree); });
    return {
      id: id,
      title: def.title,
      name: root.name + ' ' + def.title,
      formula: def.formula,
      root: root,
      rootName: root.name,
      rootPc: root.pc,
      notes: notes,
      semitones: semitones,
      pitchClasses: new Set(semitones.map(function (value) { return wrap(root.pc + value); })),
      fretboardId: def.fretboardId
    };
  }
  function coverage(scale, chordList) {
    return chordList.filter(function (chord) {
      return Array.from(chord.pitchClasses).every(function (pc) { return scale.pitchClasses.has(pc); });
    }).length;
  }
  function renderChords() {
    const card = activeCard();
    if (!card) return;
    activeChords = progressionChords(card, activeKey).filter(Boolean);
    if (activeChordIndex >= activeChords.length) activeChordIndex = 0;
    const scale = scaleInfo(activeScale);
    row.replaceChildren();
    activeChords.forEach(function (chord, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chord-card' + (chord.roman.toUpperCase() === 'V' ? ' is-dominant' : '') + (index === activeChordIndex ? ' is-selected' : '');
      button.setAttribute('aria-label', 'Select and play ' + chord.symbol + ' chord');
      button.setAttribute('aria-pressed', String(index === activeChordIndex));
      button.innerHTML = '<span class="chord-number"></span><span class="chord-name"></span><span class="chord-meta"><span class="chord-notes"></span><span class="chord-tone"></span></span>';
      button.querySelector('.chord-number').textContent = String(index + 1).padStart(2, '0') + ' / ' + (chord.roman || 'chord');
      button.querySelector('.chord-name').textContent = chord.symbol;
      button.querySelector('.chord-notes').textContent = chord.noteNames.join(' · ');
      const outside = Array.from(chord.pitchClasses).filter(function (pc) { return !scale.pitchClasses.has(pc); });
      button.querySelector('.chord-tone').textContent = outside.length ? outside.map(function (pc) { return fretNames[pc]; }).join(' ') + ' outside' : 'in scale';
      button.addEventListener('click', function () {
        stopPlayback();
        activeChordIndex = index;
        renderChords();
        playChord(activeChords[index]);
      });
      row.appendChild(button);
    });
    const transposed = card.transpose(keyTonic());
    document.getElementById('progression-heading').textContent = card.title;
    document.getElementById('progression-note').textContent = card.desc + ' In ' + transposed.k + ': ' + activeChords.map(function (chord) { return chord.roman; }).join(' – ') + '.';
    document.getElementById('diagram-key-label').textContent = transposed.k;
    renderFretboards();
  }
  function renderScaleChoices() {
    scaleList.replaceChildren();
    const selectedCard = activeCard();
    const chordList = progressionChords(selectedCard, activeKey).filter(Boolean);
    Object.keys(SCALE_DEFINITIONS).forEach(function (id) {
      const scale = scaleInfo(id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'scale-choice' + (id === activeScale ? ' is-active' : '');
      button.setAttribute('aria-pressed', String(id === activeScale));
      const head = document.createElement('span');
      head.className = 'scale-choice-head';
      const title = document.createElement('strong');
      title.textContent = scale.name;
      const fit = document.createElement('span');
      fit.className = 'fit-small';
      fit.textContent = coverage(scale, chordList) + '/' + chordList.length + ' chords';
      head.append(title, fit);
      const notes = document.createElement('span');
      notes.className = 'scale-choice-notes';
      notes.textContent = scale.notes.join('   ');
      button.append(head, notes);
      button.addEventListener('click', function () {
        activeScale = id;
        renderScaleChoices();
        renderChords();
      });
      scaleList.appendChild(button);
    });
    renderScaleDetail();
  }
  function renderScaleDetail() {
    const scale = scaleInfo(activeScale);
    const chordList = progressionChords(activeCard(), activeKey).filter(Boolean);
    const fitCount = coverage(scale, chordList);
    document.getElementById('scale-name').textContent = scale.name;
    document.getElementById('scale-fit').textContent = fitCount + ' of ' + chordList.length + ' chords fully fit';
    const noteRow = document.getElementById('scale-notes');
    noteRow.replaceChildren();
    const leadingPc = wrap(keyTonic().pc + 11);
    scale.notes.forEach(function (note) {
      const chip = document.createElement('span');
      chip.className = 'note-chip' + (theory.noteToTonic(note).pc === leadingPc ? ' is-leading' : '');
      chip.textContent = note;
      noteRow.appendChild(chip);
    });
    const explanations = {
      natural: 'The home palette of ' + activeKey + ' natural minor. Its lowered seventh gives the classic descending color before the dominant chord.',
      harmonic: 'Raise scale degree 7 to create a leading tone. The dominant V chord gains a strong pull back to ' + activeKey + ' minor.',
      phrygian: 'The fifth mode of harmonic minor, rooted on the dominant of ' + activeKey + ' minor. Its half-step above the root gives the Spanish color.'
    };
    document.getElementById('scale-explanation').textContent = explanations[activeScale] + ' Formula: ' + scale.formula + '.';
    const link = document.getElementById('scale-fretboard-link');
    link.href = 'fretboard.html?key=' + encodeURIComponent(scale.root.name) + '&patternType=scale&pattern=' + encodeURIComponent(scale.fretboardId);
    link.firstChild.textContent = 'Map ' + scale.name + ' on fretboard ';
  }
  function renderFretboards() {
    const chord = activeChords[activeChordIndex];
    if (!chord) return;
    const mode = modeData[wrap(chord.rootPc - keyTonic().pc)];
    const selectedMode = mode || { name: 'Aeolian', intervals: [0, 2, 3, 5, 7, 8, 10], pentatonic: [0, 3, 5, 7, 10] };
    const scalePcs = new Set(selectedMode.intervals.map(function (interval) { return wrap(chord.rootPc + interval); }));
    const bluesName = chord.minor ? 'minor' : 'major';
    const bluesPcs = new Set(bluesIntervals[bluesName].map(function (interval) { return wrap(chord.rootPc + interval); }));
    const pentatonicPcs = new Set(selectedMode.pentatonic.map(function (interval) { return wrap(chord.rootPc + interval); }));
    const rootName = fretNames[chord.rootPc];
    const chordNotes = Array.from(chord.pitchClasses).map(function (pc) { return fretNames[pc]; }).join(' · ');
    document.getElementById('diagram-chord-caption').textContent = chord.symbol + (chord.roman ? ' (' + chord.roman + ')' : '') + ' · ' + chordNotes;
    document.getElementById('diagram-scale-caption').textContent = rootName + ' ' + selectedMode.name + ' · key ' + activeKey + ' minor';
    document.getElementById('diagram-blues-caption').textContent = rootName + ' ' + bluesName + ' blues · for ' + chord.symbol;
    document.getElementById('diagram-pentatonic-caption').textContent = rootName + ' ' + selectedMode.name + ' pentatonic';
    drawDawFretboard(scaleHosts.chord, chord.pitchClasses, chord.rootPc, chord.symbol + ' chord tones');
    drawDawFretboard(scaleHosts.scale, scalePcs, chord.rootPc, rootName + ' ' + selectedMode.name + ' scale');
    drawDawFretboard(scaleHosts.blues, bluesPcs, chord.rootPc, rootName + ' ' + bluesName + ' blues');
    drawDawFretboard(scaleHosts.pentatonic, pentatonicPcs, chord.rootPc, rootName + ' ' + selectedMode.name + ' pentatonic');
  }
  function drawDawFretboard(host, pitchClasses, rootPc, label) {
    if (!host) return;
    const ns = 'http://www.w3.org/2000/svg';
    const frets = 12, left = 34, top = 18, fretWidth = 31, stringGap = 21;
    const width = left + frets * fretWidth + 16;
    const height = top + stringGap * (guitarOpenMidi.length - 1) + 27;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label + ' on standard guitar, frets 0 to 12');
    svg.classList.add('daw-fretboard-svg');
    for (let fret = 0; fret <= frets; fret++) {
      const line = document.createElementNS(ns, 'line');
      const x = left + fret * fretWidth;
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      line.setAttribute('y1', top); line.setAttribute('y2', top + stringGap * (guitarOpenMidi.length - 1));
      line.setAttribute('class', 'daw-fret-fret' + (fret === 0 ? ' nut' : ''));
      svg.appendChild(line);
      if (fret > 0) {
        const number = document.createElementNS(ns, 'text');
        number.setAttribute('x', left + (fret - 0.5) * fretWidth);
        number.setAttribute('y', height - 3);
        number.setAttribute('class', 'daw-fret-label');
        number.textContent = String(fret);
        svg.appendChild(number);
      }
    }
    guitarOpenMidi.forEach(function (openMidi, stringIndex) {
      const y = top + stringIndex * stringGap;
      const string = document.createElementNS(ns, 'line');
      string.setAttribute('x1', left); string.setAttribute('x2', left + frets * fretWidth);
      string.setAttribute('y1', y); string.setAttribute('y2', y);
      string.setAttribute('class', 'daw-fret-string');
      svg.appendChild(string);
      const openLabel = document.createElementNS(ns, 'text');
      openLabel.setAttribute('x', left - 5); openLabel.setAttribute('y', y + 3);
      openLabel.setAttribute('class', 'daw-fret-open');
      openLabel.textContent = fretNames[openMidi % 12];
      svg.appendChild(openLabel);
      for (let fret = 0; fret <= frets; fret++) {
        const pc = (openMidi + fret) % 12;
        if (!pitchClasses.has(pc)) continue;
        const x = fret === 0 ? left - 12 : left + (fret - 0.5) * fretWidth;
        const group = document.createElementNS(ns, 'g');
        group.setAttribute('class', 'daw-fret-note' + (pc === rootPc ? ' is-root' : ''));
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 8);
        const note = document.createElementNS(ns, 'text');
        note.setAttribute('x', x); note.setAttribute('y', y + 3);
        note.textContent = fretNames[pc];
        group.append(dot, note);
        svg.appendChild(group);
      }
    });
    host.replaceChildren(svg);
  }
  function currentTempo() {
    const value = Number(tempoInput.value);
    const tempo = Math.max(40, Math.min(220, Number.isFinite(value) && value ? value : 84));
    tempoInput.value = String(tempo);
    return tempo;
  }
  function midiFrequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function playTones(midis, start, duration, velocity) {
    if (!audioContext) return;
    midis.forEach(function (midi) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(midiFrequency(midi), start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(velocity || 0.11, start + 0.025);
      gain.gain.setValueAtTime(velocity || 0.11, Math.max(start + 0.04, start + duration - 0.08));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
      activeNodes.push(oscillator);
      oscillator.addEventListener('ended', function () { activeNodes = activeNodes.filter(function (node) { return node !== oscillator; }); });
    });
  }
  function ensureAudio() {
    try {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      return audioContext;
    } catch (error) { return null; }
  }
  function chordMidis(chord, includeBass) {
    const rootMidi = 48 + chord.rootPc;
    return (includeBass ? [rootMidi - 12] : []).concat(chord.intervals.map(function (interval) { return rootMidi + interval; }));
  }
  function playChord(chord) {
    if (!chord) return;
    stopPlayback();
    const context = ensureAudio();
    if (!context) return;
    playTones(chordMidis(chord, false), context.currentTime + 0.03, 60 / currentTempo() * 0.92, 0.11);
  }
  function stopPlayback() {
    playbackGeneration++;
    window.clearTimeout(playTimer);
    highlightTimers.forEach(function (timer) { window.clearTimeout(timer); });
    highlightTimers = [];
    activeNodes.forEach(function (node) { try { node.stop(); } catch (error) {} });
    activeNodes = [];
    playButton.disabled = false;
    playButton.dataset.playing = 'false';
    playButton.classList.remove('is-playing');
    playButton.querySelector('span:first-child').textContent = '▶';
    playLabel.textContent = 'Play progression';
    row.querySelectorAll('.chord-card').forEach(function (card) { card.classList.remove('is-current'); });
  }
  function playProgression() {
    if (playButton.dataset.playing === 'true') { stopPlayback(); return; }
    stopPlayback();
    const context = ensureAudio();
    if (!context || !activeChords.length) return;
    const token = playbackGeneration;
    playButton.dataset.playing = 'true';
    playButton.classList.add('is-playing');
    playButton.querySelector('span:first-child').textContent = '■';
    playLabel.textContent = loopToggle.checked ? 'Looping · Stop' : 'Stop';
    function playCycle() {
      if (token !== playbackGeneration || playButton.dataset.playing !== 'true') return;
      highlightTimers = [];
      const beat = 60 / currentTempo();
      const start = audioContext.currentTime + 0.08;
      activeChords.forEach(function (chord, index) {
        playTones(chordMidis(chord, true), start + index * beat, beat * 0.92, 0.085);
        highlightTimers.push(window.setTimeout(function () {
          if (token !== playbackGeneration) return;
          activeChordIndex = index;
          row.querySelectorAll('.chord-card').forEach(function (card, cardIndex) {
            const selected = cardIndex === index;
            card.classList.toggle('is-current', selected);
            card.classList.toggle('is-selected', selected);
            card.setAttribute('aria-pressed', String(selected));
          });
          renderFretboards();
        }, Math.max(0, (start - audioContext.currentTime + index * beat) * 1000)));
      });
      const duration = Math.max(0, (start - audioContext.currentTime + activeChords.length * beat) * 1000 + 150);
      playTimer = window.setTimeout(function () {
        if (token !== playbackGeneration) return;
        if (loopToggle.checked) playCycle();
        else stopPlayback();
      }, duration);
    }
    playCycle();
  }

  window.addEventListener('pagehide', stopPlayback, { once: true });
  fillSelectors();
  keySelect.addEventListener('change', function () {
    stopPlayback();
    activeKey = keySelect.value;
    activeChordIndex = 0;
    renderScaleChoices();
    renderChords();
  });
  progressionSelect.addEventListener('change', function () {
    stopPlayback();
    activeCardIndex = Number(progressionSelect.value) || 0;
    activeChordIndex = 0;
    renderScaleChoices();
    renderChords();
  });
  playButton.addEventListener('click', playProgression);
  loopToggle.addEventListener('change', function () {
    if (playButton.dataset.playing === 'true') playLabel.textContent = loopToggle.checked ? 'Looping · Stop' : 'Stop';
  });
  tempoInput.addEventListener('change', currentTempo);
  renderScaleChoices();
  renderChords();
})();