/**
 * Lessons (v1.0): every lesson now has full content on this page - explanation, formula,
 * spelling, step pattern, practice steps, related patterns and an interactive fretboard -
 * instead of only a link into the app. Works offline.
 */
(function () {
    'use strict';
    const lessons = (() => {
        try { return typeof window.createLessonsData === 'function' ? window.createLessonsData() : []; }
        catch (e) {
            console.warn('Could not load lesson curriculum:', e);
            return [];
        }
    })();
    const DEFAULT_KEY = { natural_minor: 'A', pentatonic_minor: 'A', blues: 'A', dorian: 'D', mixolydian: 'G', harmonic_minor: 'A', '5': 'E' };

    function stepPattern(mt, intervals) {
        const s = intervals.map(iv => mt.getIntervalSemitones(iv)).concat([12]);
        const names = { 1: 'H', 2: 'W', 3: 'W+H', 4: '2W' };
        return s.slice(1).map((v, i) => names[v - s[i]] || (v - s[i])).join(' ');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const mt = new MusicTheory();
        const list = document.getElementById('lesson-list');
        const detail = document.getElementById('lesson-detail');
        const viewed = () => (ST.getJSON('st_viewed', {}) || {}).lesson || {};

        // v1.1: printable lesson sheet (text, outcome, formula, facts and practice steps).
        function lessonPdf(lesson) {
            if (!window.StudyPdf) throw new Error('PDF helper failed to load.');
            const isScale = lesson.patternType === 'scale';
            const data = isScale ? mt.scales[lesson.patternId] : mt.chords[lesson.patternId];
            const key = DEFAULT_KEY[lesson.patternId] || 'C';
            const notes = isScale ? mt.getScaleNotes(key, lesson.patternId) : mt.getChordNotes(key, lesson.patternId);
            const desc = isScale ? mt.getScaleDescription(lesson.patternId) : mt.getChordDescription(lesson.patternId);
            const patternName = data ? data.name : lesson.patternId;
            const formula = data && Array.isArray(data.intervals) ? data.intervals.join(' - ') : 'not available';
            const facts = [['Formula', formula], ['In ' + key, notes.join(' ')]];
            if (isScale && data) facts.push(['Steps', stepPattern(mt, data.intervals)], ['Notes', String(data.intervals.length)]);
            if (!isScale) facts.push(['Inversions', mt.getChordInversions(notes).join(' · ') || '-']);
            const pdf = StudyPdf.create();
            pdf.title(lesson.title);
            pdf.text(lesson.text + (desc && lesson.text.indexOf(desc) === -1 ? ' ' + desc : ''));
            pdf.heading('Learning outcome');
            pdf.text('Play and spell ' + patternName + ' in ' + key + ', using its formula ' + formula + '.');
            pdf.heading('Apply it');
            pdf.text(isScale
                ? 'Play it once ascending and descending, then make a short phrase that lands on the tonic or a chord tone.'
                : 'Arpeggiate the chord, name each tone, then connect it to the nearest inversion or the next chord in a progression.');
            pdf.heading('Facts');
            pdf.list(facts.map(f => f[0] + ': ' + f[1]));
            pdf.heading('Practice steps');
            pdf.list(lesson.steps || [], true);
            pdf.save(lesson.title + ' (lesson)');
        }

        function card(lesson, i) {
            const item = document.createElement('div');
            item.className = 'lesson-item' + (viewed()[String(i)] ? ' seen' : '');
            item.innerHTML = '<div class="lesson-details"><h3></h3><p></p></div><div class="lesson-actions"><button class="lesson-pdf-button" type="button">Download PDF</button><button class="view-lesson-button" type="button">Open Lesson</button></div>';
            item.querySelector('h3').textContent = lesson.title;
            item.querySelector('p').textContent = lesson.description;
            item.querySelector('.lesson-pdf-button').addEventListener('click', e => {
                e.stopPropagation();
                try { lessonPdf(lesson); } catch (err) { window.alert('Could not create the PDF: ' + err.message); }
            });
            item.addEventListener('click', () => open(i));
            return item;
        }
        function renderList() { list.innerHTML = ''; lessons.forEach((l, i) => list.appendChild(card(l, i))); }

        function open(i, noScroll) {
            const lesson = lessons[i];
            if (!lesson) return;
            ST.recordView('lesson', String(i));
            if (location.hash !== '#lesson-' + i) history.replaceState(null, '', '#lesson-' + i);
            const isScale = lesson.patternType === 'scale';
            const data = isScale ? mt.scales[lesson.patternId] : mt.chords[lesson.patternId];
            const key = DEFAULT_KEY[lesson.patternId] || 'C';
            const notes = isScale ? mt.getScaleNotes(key, lesson.patternId) : mt.getChordNotes(key, lesson.patternId);
            const desc = isScale ? mt.getScaleDescription(lesson.patternId) : mt.getChordDescription(lesson.patternId);
            detail.hidden = false;
            detail.innerHTML = '<div class="ld-head"><h2></h2><button type="button" class="ld-close" aria-label="Close">×</button></div>' +
                '<p class="ld-text"></p><section class="ld-coach"><h3>Learning outcome</h3><p class="ld-outcome"></p><h3>Apply it</h3><p class="ld-application"></p></section>' +
                '<div class="ld-facts"></div><div class="ld-fb"></div>' +
                '<h3>Practice steps</h3><ol class="ld-steps"></ol><h3 class="ld-rel-h">Related patterns</h3><div class="ld-related"></div>' +
                '<div class="ld-nav"><button type="button" class="ld-prev">‹ Previous</button><a class="ld-app">Open full lesson in the app</a><button type="button" class="ld-next">Next ›</button></div>';
            detail.querySelector('h2').textContent = lesson.title;
            detail.querySelector('.ld-text').textContent = lesson.text + (desc && lesson.text.indexOf(desc) === -1 ? ' ' + desc : '');
            const patternName = data ? data.name : lesson.patternId;
            const formula = data && Array.isArray(data.intervals) ? data.intervals.join(' - ') : 'not available';
            detail.querySelector('.ld-outcome').textContent = 'Play and spell ' + patternName + ' in ' + key + ', using its formula ' + formula + '.';
            detail.querySelector('.ld-application').textContent = isScale
                ? 'Play it once ascending and descending, then make a short phrase that lands on the tonic or a chord tone.'
                : 'Arpeggiate the chord, name each tone, then connect it to the nearest inversion or the next chord in a progression.';
            const facts = [['Formula', formula], ['In ' + key, notes.join(' ')]];
            if (isScale && data) facts.push(['Steps', stepPattern(mt, data.intervals)], ['Notes', String(data.intervals.length)]);
            if (!isScale) facts.push(['Inversions', mt.getChordInversions(notes).join(' · ') || '-']);
            detail.querySelector('.ld-facts').innerHTML = facts.map(f => '<div><span>' + ST.escape(f[0]) + '</span><b>' + ST.escape(f[1]) + '</b></div>').join('');
            const fb = MiniFretboard.widget(detail.querySelector('.ld-fb'), { key, type: lesson.patternType, id: lesson.patternId, caption: data ? data.name : '' });
            const ol = detail.querySelector('.ld-steps');
            (lesson.steps || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; ol.appendChild(li); });
            const rel = detail.querySelector('.ld-related');
            const related = (lesson.relatedSlides || []).filter(id => mt.scales[id] || mt.chords[id]);
            detail.querySelector('.ld-rel-h').hidden = !related.length;
            [lesson.patternId].concat(related.filter(id => id !== lesson.patternId)).forEach(id => {
                const type = mt.scales[id] && lesson.patternType === 'scale' ? 'scale' : (mt.chords[id] ? 'chord' : 'scale');
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'ld-chip' + (id === lesson.patternId ? ' on' : '');
                b.textContent = (type === 'scale' ? mt.scales[id] : mt.chords[id]).name;
                b.addEventListener('click', () => {
                    rel.querySelectorAll('.ld-chip').forEach(c => c.classList.toggle('on', c === b));
                    fb.update({ type, id, caption: b.textContent });
                });
                rel.appendChild(b);
            });
            detail.querySelector('.ld-app').href = 'fretboard.html?patternType=' + encodeURIComponent(lesson.patternType) +
                '&pattern=' + encodeURIComponent(lesson.patternId) + '&key=' + encodeURIComponent(key);
            const prev = detail.querySelector('.ld-prev'), next = detail.querySelector('.ld-next');
            prev.disabled = i === 0; next.disabled = i === lessons.length - 1;
            prev.addEventListener('click', () => open(i - 1));
            next.addEventListener('click', () => open(i + 1));
            detail.querySelector('.ld-close').addEventListener('click', () => { detail.hidden = true; history.replaceState(null, '', location.pathname); renderList(); });
            renderList();
            if (!noScroll) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        window.addEventListener('pageshow', renderList);
        renderList();
        const m = location.hash.match(/^#lesson-(\d+)$/);
        if (m) open(parseInt(m[1], 10));
        window.addEventListener('hashchange', () => { const h = location.hash.match(/^#lesson-(\d+)$/); if (h) open(parseInt(h[1], 10)); });
    });
})();
