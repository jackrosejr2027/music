(() => {
    'use strict';
    const INTERVALS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    function pitch(interval) {
        if (typeof interval === 'number') return ((interval % 12) + 12) % 12;
        const text = String(interval).trim().replaceAll('♭', 'b').replaceAll('♯', '#');
        if (text.toUpperCase() === 'R') return 0;
        const match = /^([b#]*)([1-9][0-9]*)$/.exec(text);
        if (!match) return null;
        const base = [0, 2, 4, 5, 7, 9, 11][(Number(match[2]) - 1) % 7];
        const change = [...match[1]].reduce((sum, c) => sum + (c === '#' ? 1 : -1), 0);
        return ((base + change) % 12 + 12) % 12;
    }
    function pitches(type, id, data) {
        const intervals = type === 'interval' ? [data?.semitones ?? id] : data?.intervals || [];
        return [...new Set(intervals.map(pitch).filter(value => value !== null))].sort((a, b) => a - b);
    }
    function matches(item, query, required, mode) {
        const haystack = (item.name + ' ' + item.id + ' ' + (item.formula || '')).toLocaleLowerCase().replaceAll('♭', 'b').replaceAll('♯', '#');
        const words = query.trim().toLocaleLowerCase().replaceAll('♭', 'b').replaceAll('♯', '#').split(/\s+/).filter(Boolean);
        if (!words.every(word => haystack.includes(word))) return false;
        if (!required.length) return true;
        const actual = new Set(item.pitches);
        if (mode === 'any') return required.some(value => actual.has(value));
        return required.every(value => actual.has(value)) && (mode !== 'exact' || actual.size === required.length);
    }
    function compare(a, b, mode, order = []) {
        if (mode === 'name-asc') return a.name.localeCompare(b.name) || a.index - b.index;
        if (mode === 'name-desc') return b.name.localeCompare(a.name) || a.index - b.index;
        if (mode === 'interval-count') return a.pitches.length - b.pitches.length || a.name.localeCompare(b.name) || a.index - b.index;
        if (mode === 'custom') {
            const rank = item => { const key = item.type + ':' + item.id; if (typeof order.get === 'function') return order.get(key) ?? Infinity; const i = order.indexOf(key); return i < 0 ? Infinity : i; };
            const ra = rank(a), rb = rank(b);
            if (ra !== rb) return ra - rb;
        }
        return a.index - b.index;
    }
    // A practical teaching/repertoire order, not a statistical popularity claim.
    const COMMON = {
        chord: ['major', 'minor', 'dominant7', 'major7', 'minor7', 'sus4', 'sus2', 'add9', '6', 'm6', 'diminished', 'diminished7', 'half_diminished', 'augmented', 'dom9', 'maj9', 'min9', 'dom13', 'min11', 'maj13', 'dom11', 'maj11', 'min13', 'augmented7'],
        interval: ['1', '5', '3', 'b3', '4', '2', 'b7', '7', '6', 'b6', 'b2', 'b5', '#4', '#2'],
        scale: ['major', 'natural_minor', 'pentatonic_minor', 'pentatonic_major', 'blues', 'harmonic_minor', 'melodic_minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian', 'whole_tone', 'diminished', 'altered', 'bebop_dominant', 'bebop_major', 'lydian_dominant', 'phrygian_dominant', 'bebop_minor', 'bebop_dorian', 'half_diminished', 'super_locrian', 'lydian_augmented', 'augmented', 'double_harmonic', 'hungarian_minor', 'harmonic_major']
    };
    function commonEntries(type, catalog) {
        const ranks = new Map((COMMON[type] || []).map((id, index) => [id, index]));
        return Object.entries(catalog).sort(([a, x], [b, y]) => {
            const rankA = ranks.get(a) ?? Infinity, rankB = ranks.get(b) ?? Infinity;
            return (rankA === rankB ? 0 : rankA - rankB) || String(x?.name || a).localeCompare(String(y?.name || b));
        });
    }
    globalThis.FretboardBetaCatalog = { INTERVALS, pitch, pitches, matches, compare, commonEntries };
})();
