/**
 * Progress dashboard (v1.0) - real, locally stored statistics (previously placeholder numbers).
 * Sources: st_activity (site.js), st_viewed (fretboard), st_quiz_results (quiz engine), favorites.
 */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('progress-sections');
    const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d) || JSON.parse(d); } catch (e) { return JSON.parse(d); } };
    const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const mt = (typeof MusicTheory !== 'undefined') ? new MusicTheory() : null;
    const dayKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    function render() {
        const act = object(read('st_activity', '{"days":{},"pages":{}}'));
        const viewed = object(read('st_viewed', '{}'));
        const storedResults = read('st_quiz_results', '[]');
        const results = Array.isArray(storedResults) ? storedResults.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [];
        const validResults = results.filter(item => typeof item.pct === 'number' && Number.isFinite(item.pct) && item.pct >= 0 && item.pct <= 100);
        const scoredResults = validResults.filter(item => item.kind === 'quiz' || item.kind === 'test');
        const fs = object(read('favoriteScales', '{}')), fc = object(read('favoriteChords', '{}'));
        const days = object(act.days);
        const secondsFor = key => typeof days[key] === 'number' && Number.isFinite(days[key]) && days[key] >= 0 ? days[key] : 0;
        const hasDay = key => Object.prototype.hasOwnProperty.call(days, key);

        // streak (today counts if visited; otherwise streak ending yesterday)
        let streak = 0;
        const d = new Date();
        if (!hasDay(dayKey(d))) d.setDate(d.getDate() - 1);
        while (hasDay(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }

        let weekSecs = 0;
        for (let i = 0; i < 7; i++) { const x = new Date(); x.setDate(x.getDate() - i); weekSecs += secondsFor(dayKey(x)); }
        const totalSecs = Object.keys(days).reduce((total, key) => total + secondsFor(key), 0);
        const fmt = (s) => s >= 3600 ? (s / 3600).toFixed(1) + ' h' : Math.round(s / 60) + ' min';

        const count = (t) => Object.keys(object(viewed[t])).length;
        const totalScales = mt ? Object.keys(mt.scales).length : 0;
        const totalChords = mt ? Object.keys(mt.chords).length : 0;
        const totalIntervals = mt ? Object.keys(mt.intervals).length : 0;
        const lessons = count('lesson');
        const avg = scoredResults.length ? Math.round(scoredResults.reduce((total, result) => total + result.pct, 0) / scoredResults.length) : null;
        const examsPassed = new Set(validResults.filter(result => result.kind === 'exam' && typeof result.id === 'string' && result.pct >= (result.id === 'e-grade3' ? 75 : 70)).map(result => result.id)).size;
        const favs = Object.keys(fs).filter(k => fs[k]).length + Object.keys(fc).filter(k => fc[k]).length;
        const level = (() => {
            const s = count('scale');
            if (s >= 200) return ['Expert', 100]; if (s >= 60) return ['Advanced', 75];
            if (s >= 20) return ['Intermediate', 50]; if (s >= 5) return ['Beginner+', 25]; return ['Getting started', Math.min(20, s * 4)];
        })();

        const cards = [
            ['Lessons Explored', lessons + ' / 50', 'Lessons opened in the app', Math.min(100, lessons * 2)],
            ['Quiz & Test Average', avg === null ? '-' : avg + '%', scoredResults.length + ' attempt' + (scoredResults.length === 1 ? '' : 's') + ' recorded', avg || 0, 'var(--accent-color)'],
            ['Exams Passed', examsPassed + ' / 50', 'Certificates available on the Exams page', Math.min(100, examsPassed * 2), '#27ae60'],
            ['Favorites Collection', String(favs), 'Scales and chords starred'],
            ['Practice Time (7 days)', fmt(weekSecs), 'Total all-time: ' + fmt(totalSecs), Math.min(100, weekSecs / 36), 'var(--secondary-color)'],
            ['Practice Streak', streak + (streak === 1 ? ' day' : ' days'), 'Consecutive days using the app'],
            ['Topic Mastery: Scales', level[0], 'Based on unique scales studied', level[1], '#f1c40f'],
            ['Scales Explored', count('scale') + ' / ' + totalScales, 'Unique scale diagrams viewed', totalScales ? 100 * count('scale') / totalScales : 0],
            ['Chords Explored', count('chord') + ' / ' + totalChords, 'Unique chord diagrams viewed', totalChords ? 100 * count('chord') / totalChords : 0],
            ['Intervals Explored', count('interval') + ' / ' + totalIntervals, 'Unique interval diagrams viewed', totalIntervals ? 100 * count('interval') / totalIntervals : 0]
        ];
        root.innerHTML = '';
        cards.forEach(([title, stat, sub, pct, color]) => {
            const c = document.createElement('div');
            c.className = 'progress-card';
            c.innerHTML = '<h3>' + title + '</h3><span class="progress-stat">' + ST.escape(stat) + '</span><p>' + ST.escape(sub) + '</p>' +
                (pct === undefined ? '' : '<div class="progress-bar-container"><div class="progress-bar" style="width:' + Math.max(0, Math.min(100, pct)).toFixed(1) + '%;' + (color ? 'background-color:' + color + ';' : '') + '"></div></div>');
            root.appendChild(c);
        });

        // 28-day activity grid
        const heat = document.getElementById('progress-heat');
        heat.innerHTML = '';
        for (let i = 27; i >= 0; i--) {
            const x = new Date(); x.setDate(x.getDate() - i);
            const key = dayKey(x);
            const s = hasDay(key) ? secondsFor(key) : undefined;
            const cell = document.createElement('div');
            cell.className = 'heat-cell';
            const lvl = s === undefined ? 0 : s < 300 ? 1 : s < 1200 ? 2 : s < 3600 ? 3 : 4;
            cell.dataset.l = lvl;
            cell.title = key + (s === undefined ? ': no activity' : ': ' + fmt(s));
            heat.appendChild(cell);
        }

        const tbody = document.getElementById('progress-results');
        tbody.innerHTML = '';
        results.slice(-15).reverse().forEach(result => {
            const tr = document.createElement('tr');
            const dateValue = typeof result.date === 'string' || typeof result.date === 'number' ? result.date : NaN;
            const date = new Date(dateValue);
            const dateText = Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString();
            const textValue = value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
            const numberText = value => typeof value === 'number' && Number.isFinite(value) ? String(value) : '-';
            [dateText, textValue(result.title), textValue(result.kind), numberText(result.score) + '/' + numberText(result.total) + ' (' + numberText(result.pct) + '%)'].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                tr.appendChild(cell);
            });
            tbody.appendChild(tr);
        });
        document.getElementById('progress-results-wrap').style.display = results.length ? '' : 'none';
    }

    document.getElementById('progress-reset').addEventListener('click', () => {
        if (!confirm('Reset all progress statistics (activity, viewed items and quiz results)? Favorites and settings are kept.')) return;
        try { ['st_activity', 'st_viewed', 'st_quiz_results'].forEach(key => localStorage.removeItem(key)); }
        catch (error) { alert('Could not reset progress because browser storage is unavailable.'); return; }
        render();
    });
    render();
});
