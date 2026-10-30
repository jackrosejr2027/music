/**
 * Playback Event Listeners
 */
if (typeof App !== 'undefined') {
    App.prototype.setupPlaybackEvents = function() {
        document.getElementById('tempo-range')?.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            const tv = document.getElementById('tempo-value');
            if (tv) tv.textContent = this.tempo;
        });

        ['play-pattern', 'header-play-pattern'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => this.playCurrentPattern());
        });
        document.getElementById('header-stop-pattern')?.addEventListener('click', () => this.stopCurrentPattern());
        
        document.getElementById('melodic-pattern-select')?.addEventListener('change', e => {
            const cpc = document.getElementById('custom-pattern-container');
            if (cpc) cpc.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
        
        document.getElementById('play-melodic-pattern')?.addEventListener('click', () => this.playMelodicPattern());
        document.getElementById('stop-melodic-pattern')?.addEventListener('click', () => this.stopMelodicPattern());
        document.getElementById('step-melodic-pattern')?.addEventListener('click', () => this.stepMelodicPattern());
        document.getElementById('melodic-export-midi')?.addEventListener('click', () => this.exportMelodicMidi());
        document.getElementById('melodic-export-all-keys')?.addEventListener('click', () => this.exportMelodicAllKeysZip());
        document.getElementById('melodic-export-family')?.addEventListener('click', () => this.exportMelodicFamilyZip());
        document.getElementById('melodic-export-family-midi')?.addEventListener('click', () => this.exportMelodicFamilyMidi());
        document.getElementById('melodic-tempo')?.addEventListener('change', event => {
            const bpm = Math.max(20, Math.min(300, Number(event.target.value) || 120));
            event.target.value = String(bpm);
            this._melodicBeatDurationSec = 60 / bpm;
            const status = document.getElementById('melodic-pattern-status');
            if (status) status.textContent = this.isPlayingPattern ? 'Tempo updated to ' + bpm + ' BPM.' : 'Melodic tempo set to ' + bpm + ' BPM.';
        });

        const cofDurationInput = document.getElementById('cof-duration');
        const playCofBtn = document.getElementById('play-cof-loop');
        const stopCofBtn = document.getElementById('stop-cof-loop');
        if (playCofBtn) {
            playCofBtn.addEventListener('click', () => {
                const durationSec = parseFloat(cofDurationInput?.value) || 2;
                playCofBtn.style.display = 'none';
                if (stopCofBtn) stopCofBtn.style.display = 'inline-block';
                this.playCircleOfFifthsLoop(durationSec).catch(err => {
                    console.warn('Play Cof Loop failed:', err);
                    playCofBtn.style.display = 'inline-block';
                    if (stopCofBtn) stopCofBtn.style.display = 'none';
                });
            });
        }
        if (stopCofBtn) {
            stopCofBtn.addEventListener('click', () => {
                this.stopCircleOfFifthsLoop();
                stopCofBtn.style.display = 'none';
                if (playCofBtn) playCofBtn.style.display = 'inline-block';
            });
        }

        const playCof4Btn = document.getElementById('play-cof4-loop');
        const stopCof4Btn = document.getElementById('stop-cof4-loop');
        if (playCof4Btn) {
            playCof4Btn.addEventListener('click', () => {
                const durationSec = parseFloat(cofDurationInput?.value) || 2;
                playCof4Btn.style.display = 'none';
                if (stopCof4Btn) stopCof4Btn.style.display = 'inline-block';
                this.playCircleOfFourthsLoop(durationSec).catch(err => {
                    console.warn('Play Cof4ths Loop failed:', err);
                    playCof4Btn.style.display = 'inline-block';
                    if (stopCof4Btn) stopCof4Btn.style.display = 'none';
                });
            });
        }
        if (stopCof4Btn) {
            stopCof4Btn.addEventListener('click', () => {
                this.stopCircleOfFourthsLoop();
                stopCof4Btn.style.display = 'none';
                if (playCof4Btn) playCof4Btn.style.display = 'inline-block';
            });
        }
    };
}