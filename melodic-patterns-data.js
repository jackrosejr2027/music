const MELODIC_PATTERNS_DATA = [
    { value: "1", text: "1 (each note)" },
    { value: "1 2", text: "1 2 (scale step)" },
    { value: "1 3", text: "1 3 (skip one)" },
    { value: "1 2 3", text: "1 2 3 (three note)" },
    { value: "1 3 5", text: "1 3 5 (triad)" },
    { value: "1 3 5 7", text: "1 3 5 7 (seventh)" },
    { value: "1 2 3 2", text: "1 2 3 2 (forward-back)" },
    { value: "1 4 3 6", text: "1 4 3 6 (leapfrog)" },
    { value: "1 5 1 5", text: "1 5 1 5 (power chord)" },
    { value: "1 2 3 4 5 4 3 2", text: "1 2 3 4 5 4 3 2 (up-down)" },
    { value: "8 7 6 5 4 3 2 1", text: "8 7 6 5 4 3 2 1 (descending)" },
    { value: "1 3 5 8 5 3", text: "1 3 5 8 5 3 (arpeggio down)" },
    { value: "1 3 2 4 3 5", text: "1 3 2 4 3 5 (zigzag up)" },
    { value: "5 3 4 2 3 1", text: "5 3 4 2 3 1 (zigzag down)" },
    { value: "1 2 3 5 8 5 3 2", text: "1 2 3 5 8 5 3 2 (mountain)" },
    { value: "1 8 2 7 3 6 4 5", text: "1 8 2 7 3 6 4 5 (converging)" },
    { value: "1 3 5 7 2 4 6 8", text: "1 3 5 7 2 4 6 8 (odd-even)" },
    { value: "1 1 2 2 3 3", text: "1 1 2 2 3 3 (repeated notes)" },
    { value: "1 3 2 5 3 7 5 8", text: "1 3 2 5 3 7 5 8 (cascading)" },
    { value: "1 8 3 6 5 4 2 7", text: "1 8 3 6 5 4 2 7 (random walk)" },
    { value: "1 2 3 5 1 2 3 5", text: "1 2 3 5 1 2 3 5 (repeating motif)" },
    { value: "1 3 5 7 7 5 3 1", text: "1 3 5 7 7 5 3 1 (symmetrical)" },
    { value: "1 2 1 3 1 4 5 4 5", text: "1 2 1 3 1 4 5 4 5 (neighbor tones)" },
    { value: "8 5 3 1 3 5 8 5", text: "8 5 3 1 3 5 8 5 (fan pattern)" },
    { value: "1 5 2 4 3 7 6 8", text: "1 5 2 4 3 7 6 8 (scattered pattern)" },
    { value: "1 8 1 7 1 6 1 5", text: "1 8 1 7 1 6 1 5 (descending anchor)" },
    { value: "5 6 7 8 1 2 3 4", text: "5 6 7 8 1 2 3 4 (upper/lower)" },
    { value: "1 2 3 1 2 3 4 5", text: "1 2 3 1 2 3 4 5 (staggered ascent)" },
    { value: "8 7 6 8 7 6 5 4", text: "8 7 6 8 7 6 5 4 (staggered descent)" },
    { value: "1 3 2 1 2 4 3 2", text: "1 3 2 1 2 4 3 2 (wave pattern)" },
    { value: "1 8 2 7 4 5 6 3", text: "1 8 2 7 4 5 6 3 (crisscross)" },
    { value: "1 3 5 8 8 5 3 1", text: "1 3 5 8 8 5 3 1 (mirror image)" },
    { value: "1 2 3 1 3 5 3 1", text: "1 2 3 1 3 5 3 1 (pyramid pattern)" },
    { value: "1 5 3 1 5 9 7 5", text: "1 5 3 1 5 9 7 5 (alternating direction)" },
    { value: "1 5 9 5 1 5 9 13", text: "1 5 9 5 1 5 9 13 (expanding range)" },
    { value: "8 4 1 4 8 12 8 4", text: "8 4 1 4 8 12 8 4 (pendulum swing)" },
    { value: "1 2 3 2 4 3 5 4", text: "1 2 3 2 4 3 5 4 (advancing pairs)" },
    { value: "8 7 6 7 5 6 4 5", text: "8 7 6 7 5 6 4 5 (retreating pairs)" },
    { value: "1 4 2 5 3 6", text: "1 4 2 5 3 6 (intervallic expanding)" },
    { value: "1 5 8 5", text: "1 5 8 5 (open arpeggio)" },
    { value: "custom", text: "Custom Pattern" }
];

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('melodic-pattern-select');
    if (select) {
        MELODIC_PATTERNS_DATA.forEach(pattern => {
            const option = document.createElement('option');
            option.value = pattern.value;
            option.textContent = pattern.text;
            select.appendChild(option);
        });
    }
});