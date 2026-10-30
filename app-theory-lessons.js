/**
 * Theory Lessons Extension for App
 */
if (typeof App !== 'undefined') {
    /**
     * Show the Lesson Editor button for lesson patterns.
     */
    App.prototype.showLessonEditorButton = function() {
        if (!document.getElementById('edit-lesson')) {
            const btn = document.createElement('button');
            btn.id = 'edit-lesson';
            btn.textContent = 'Edit Lesson';
            btn.style.marginLeft = '10px';
            btn.addEventListener('click', () => this.openLessonEditor());
            const container = document.querySelector('.fretboard-controls');
            if (container) container.appendChild(btn);
        }
    };

    /**
     * Remove the Lesson Editor button if it exists.
     */
    App.prototype.removeLessonEditorButton = function() {
        const btn = document.getElementById('edit-lesson');
        if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
    };

    /**
     * Open the Lesson Editor modal.
     */
    App.prototype.openLessonEditor = function() {
        // v1.0: previously an alert ("coming soon"). Opens Ideas & Notes with a draft for this lesson.
        const fb = this.fretboard || {};
        const lesson = (this.lessons || [])[parseInt(fb.currentPattern, 10)];
        const title = lesson ? lesson.title : 'Lesson notes';
        window.location.href = 'coursesideas.html?draft=' + encodeURIComponent(title + '\n\n');
    };

    /**
     * Open a dedicated lesson overlay with curated text content
     */
    App.prototype.openLessonPage = function(key, patternType, patternId, lessonData = null) {
        const overlay = document.createElement('div');
        overlay.className = 'lesson-overlay';
        document.body.appendChild(overlay);
        
        const lessonContainer = document.createElement('div');
        lessonContainer.className = 'lesson-container';
        
        let title = '';
        let content = '';
        let stepsHtml = '';
        let slideshowBtnHtml = '';

        if (lessonData) {
            title = lessonData.title;
            content = lessonData.text;
            if (lessonData.steps) {
                stepsHtml = lessonData.steps.map(step => `<li>${step}</li>`).join('');
            }
            if (lessonData.relatedSlides && lessonData.relatedSlides.length > 0) {
                slideshowBtnHtml = `<button class="lesson-slideshow-btn" style="background: var(--accent-color); margin-right: 10px;">Related Scales</button>`;
            }
            // Add key cycle button
            slideshowBtnHtml += `<button class="lesson-key-cycle-btn" style="background: var(--secondary-color); margin-right: 10px;">Cycle 12 Keys</button>`;
        } else {
            let patternName = (patternType === 'scale') ? this.musicTheory.scales[patternId]?.name : 
                             (patternType === 'chord') ? this.musicTheory.chords[patternId]?.name : 
                             this.musicTheory.intervals[patternId]?.name;
            title = `${key} ${patternName || 'Musical'} ${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Lesson`;
            content = `This interactive session focuses on the ${patternName} structure in the key of ${key}. Study the diagram to master the fingerings and melodic character.`;
            stepsHtml = `
                <li>Play the pattern slowly up and down the fretboard.</li>
                <li>Identify the root notes to stay anchored.</li>
                <li>Use a metronome to build rhythmic stability.</li>
                <li>Experiment with the "Melodic Patterns" tool in the sidebar.</li>
            `;
        }
        
        lessonContainer.innerHTML = `
            <div class="lesson-header">
                <h2>${title}</h2>
                <button class="close-lesson">×</button>
            </div>
            <div class="lesson-content">
                <div class="lesson-section">
                    <h3>Musical Concept</h3>
                    <p style="font-size: 1.1em; line-height: 1.6;">${content}</p>
                </div>
                <div class="lesson-section">
                    <h3>Theoretical Details</h3>
                    <div class="theory-details"></div>
                </div>
                <div class="lesson-section">
                    <h3>Practice Routine</h3>
                    <ul style="padding-left: 20px; line-height: 1.6;">
                        ${stepsHtml}
                    </ul>
                </div>
            </div>
            <div style="padding: 20px; display: flex; justify-content: flex-end;">
                ${slideshowBtnHtml}
                <button class="close-lesson-btn" style="width: auto; padding: 10px 25px; background: var(--primary-color);">Got it!</button>
            </div>
        `;
        overlay.appendChild(lessonContainer);
        
        const theoryDetails = lessonContainer.querySelector('.theory-details');
        this.populateLessonTheoryDetails(theoryDetails, key, patternType, patternId);
        
        const close = () => document.body.removeChild(overlay);
        lessonContainer.querySelector('.close-lesson').addEventListener('click', close);
        lessonContainer.querySelector('.close-lesson-btn').addEventListener('click', close);
        
        const slideBtn = lessonContainer.querySelector('.lesson-slideshow-btn');
        if (slideBtn && lessonData) {
            slideBtn.addEventListener('click', () => {
                close();
                this.startLessonSlideshow(lessonData);
            });
        }
        
        const cycleBtn = lessonContainer.querySelector('.lesson-key-cycle-btn');
        if (cycleBtn && lessonData) {
            cycleBtn.addEventListener('click', () => {
                close();
                this.startLessonKeyCycleSlideshow(lessonData);
            });
        }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    };

    /**
     * Start a slideshow for a specific lesson's related scales
     */
    App.prototype.startLessonSlideshow = function(lesson) {
        if (!lesson.relatedSlides || lesson.relatedSlides.length === 0) return;
        
        this.slideshowItems = [];
        const key = document.getElementById('key-select')?.value || 'C';
        
        lesson.relatedSlides.forEach(slideId => {
            const patternData = this.musicTheory.scales[slideId] || this.musicTheory.chords[slideId];
            if (patternData) {
                const type = this.musicTheory.scales[slideId] ? 'scale' : 'chord';
                this.slideshowItems.push({
                    info: { key: key, patternType: type, pattern: slideId },
                    filename: `lesson_${slideId}.jpg`,
                    element: { innerHTML: `<div style="padding:10px;text-align:center;font-size:10px;">${slideId}</div>` }
                });
            }
        });
        
        this.updateSlideshowDisplay();
        this.playSlideshow();
        document.getElementById('fretboard').scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Start a slideshow cycling through all 12 keys for the current lesson's scale/chord
     */
    App.prototype.startLessonKeyCycleSlideshow = function(lesson) {
        if (!lesson.patternId || !lesson.patternType) return;
        
        this.slideshowItems = [];
        
        // Use Circle of Fifths order for the cycle
        const cycleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
        
        cycleKeys.forEach(key => {
            this.slideshowItems.push({
                info: {
                    key: key,
                    patternType: lesson.patternType,
                    pattern: lesson.patternId
                },
                filename: `cycle_${key}_${lesson.patternId}.jpg`,
                // Placeholder for thumbnail since we're generating this dynamically
                element: { innerHTML: `<div style="padding:10px;text-align:center;font-size:10px;">${key}</div>` }
            });
        });
        
        this.updateSlideshowDisplay();
        this.playSlideshow();
        document.getElementById('fretboard').scrollIntoView({ behavior: 'smooth' });
    };

    App.prototype.populateLessonTheoryDetails = function(container, key, patternType, patternId) {
        container.innerHTML = '';
        if (patternType === 'scale') {
            const scale = this.musicTheory.scales[patternId];
            const notes = this.musicTheory.getScaleNotes(key, patternId);
            container.innerHTML = `<p><strong>Formula:</strong> ${scale.intervals.join(' - ')}</p><p><strong>Notes:</strong> ${notes.join(' - ')}</p>`;
        } else if (patternType === 'chord') {
            const chord = this.musicTheory.chords[patternId];
            const notes = this.musicTheory.getChordNotes(key, patternId);
            container.innerHTML = `<p><strong>Formula:</strong> ${chord.intervals.join(' - ')}</p><p><strong>Notes:</strong> ${notes.join(' - ')}</p>`;
        } else if (patternType === 'interval') {
            const interval = this.musicTheory.intervals[patternId];
            const targetNote = this.musicTheory.getNoteFromInterval(key, patternId);
            container.innerHTML = `<p><strong>Notes:</strong> ${key} - ${targetNote}</p><p><strong>Semitones:</strong> ${interval.semitones}</p>`;
        }
    };
}