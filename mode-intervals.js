(function (global) {
    'use strict';
    const scaleIds = ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian'];
    const intervalIds = new Set();
    function normalize(interval) {
        const token = String(interval || '').trim();
        let index = 0;
        while (token[index] === 'b' || token[index] === '#') index++;
        const degree = Number(token.slice(index));
        if (!Number.isInteger(degree) || degree < 1) return '';
        return token.slice(0, index) + ((degree - 1) % 7 + 1);
    }
    scaleIds.forEach(function (id) {
        const scale = global.SCALES_DATA_LIST && global.SCALES_DATA_LIST[id];
        if (scale && Array.isArray(scale.intervals)) scale.intervals.forEach(function (interval) { intervalIds.add(normalize(interval)); });
    });
    global.STModeIntervals = { has: function (interval) { return intervalIds.has(normalize(interval)); }, values: Array.from(intervalIds) };
})(window);