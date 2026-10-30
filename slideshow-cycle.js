/**
 * Slideshow Auto-Cycle Extension
 */
if (typeof App !== 'undefined') {
    /**
     * Automate populating the slideshow with all items of the current pattern type
     * and start playing through them.
     */
    App.prototype.playPatternTypeCycle = function(isShuffle = false, secondsPerSlide = 4) {
        const type = document.getElementById('pattern-type').value;
        const key = document.getElementById('key-select').value;
        let patterns = {};
        
        // Support all pattern types including custom grids
        if (type === 'scale') patterns = this.musicTheory.scales;
        else if (type === 'chord') patterns = this.musicTheory.chords;
        else if (type === 'interval') patterns = this.musicTheory.intervals;
        else if (type === 'gamut') patterns = this.musicTheory.gamuts;
        else if (type === 'grid' || type === 'grid2') {
            const count = (type === 'grid') ? 13 : 14;
            for (let i = 0; i <= count; i++) patterns[i] = { name: `Position ${i}` };
        } else {
            alert('Cannot auto-cycle this pattern type.');
            return;
        }

        let items = Object.keys(patterns);
        if (isShuffle) {
            // Standard Fisher-Yates shuffle
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
        }

        this.slideshowItems = items.map(id => ({
            info: { 
                key: key, 
                patternType: type, 
                pattern: id, 
                tuning: this.fretboard.settings.tuning.join('-') 
            },
            filename: `cycle_${id}.jpg`,
            element: { innerHTML: '' }
        }));

        this.updateSlideshowDisplay();

        // Set slideshow settings to achieve target seconds per slide and enable looping
        const bpmInput = document.getElementById('slideshow-bpm');
        if (bpmInput) {
            // formula: bpm = 240 / secondsPerSlide (assuming 1 measure of 4 beats)
            const targetBpm = Math.max(10, Math.min(300, Math.round(240 / secondsPerSlide)));
            bpmInput.value = targetBpm;
        }
        
        const durationInput = document.getElementById('slideshow-duration');
        if (durationInput) durationInput.value = 1;
        
        const loopCheck = document.getElementById('slideshow-loop');
        if (loopCheck) loopCheck.checked = true;

        // Trigger playback
        if (!this.isPlayingSlideshow) {
            this.playSlideshow();
        }
        
        // Provide visual feedback
        const fbContainer = this.fretboard.container;
        if (fbContainer) {
            fbContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
}