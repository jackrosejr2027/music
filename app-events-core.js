/**
 * Core UI Event Listeners
 */
if (typeof App !== 'undefined') {
    App.prototype.setupCoreEvents = function() {
        document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebar-toggle').setAttribute('aria-expanded', this.sidebarVisible ? 'true' : 'false');

        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (!confirm('Reset all application settings and data? This will clear custom colors, favorites, defaults and collapsed/visibility state.')) return;
                try {
                    const keysToRemove = [
                        'manic_rules_custom_data', 'favoriteScales', 'defaultKey',
                        'defaultDisplayMode', 'defaultPatternType', 'defaultPattern',
                        'pageTheme', 'pageFontSize', 'collapsedSections', 'sidebarVisible', 'lessons'
                    ];
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                    Object.keys(localStorage).forEach(k => {
                        if (k && (k.startsWith('default') || k.endsWith('Theme') || k.includes('manic_rules') || k.includes('favorite') || k.includes('lessons') || k === 'sidebarVisible' || k === 'collapsedSections')) {
                            try { localStorage.removeItem(k); } catch (e) { }
                        }
                    });
                } catch (e) {
                    console.error('Error clearing storage:', e);
                }
                window.location.reload();
            });
        }
        
        const toggleBottomBtn = document.getElementById('toggle-bottom');
        if (toggleBottomBtn) {
            toggleBottomBtn.addEventListener('click', () => {
                const dock = document.getElementById('fretboard-controls-dock');
                if (!dock) return;
                const isHidden = dock.style.display === 'none' || window.getComputedStyle(dock).display === 'none';
                if (isHidden) {
                    dock.style.display = '';
                    const activePanel = dock.querySelector('[data-control-panel].is-active');
                    if (activePanel) activePanel.style.display = '';
                    toggleBottomBtn.textContent = 'Hide controls';
                    toggleBottomBtn.setAttribute('aria-label', 'Hide bottom controls');
                    toggleBottomBtn.setAttribute('aria-pressed', 'true');
                } else {
                    dock.style.display = 'none';
                    toggleBottomBtn.textContent = 'Show controls';
                    toggleBottomBtn.setAttribute('aria-label', 'Show bottom controls');
                    toggleBottomBtn.setAttribute('aria-pressed', 'false');
                }
            });
            toggleBottomBtn.setAttribute('aria-label', 'Show bottom controls');
        }
        
        document.getElementById('instrument-select')?.addEventListener('change', () => document.dispatchEvent(new Event('instrument-changed')));
        document.getElementById('tuning-preset')?.addEventListener('change', () => document.dispatchEvent(new Event('tuning-changed')));
        
        document.getElementById('string-count')?.addEventListener('change', e => {
            const count = parseInt(e.target.value);
            if (Number.isInteger(count) && count >= 1 && count <= Number(e.target.max || 20)) {
                this.updateTuningInputs();
                this.updateFretboard();
            }
        });
        
        const basicUpdaters = [
            'start-fret', 'end-fret', 'string-height', 'fret-width',
            'note-size', 'note-shape', 'note-font', 'note-font-size', 'note-effect', 'note-gradient', 'note-offset',
            'string-thickness', 'string-style', 'string-gradient', 'string-effect', 'string-spacing', 'string-opacity',
            'fret-style', 'fret-thickness', 'fret-numbers-placement', 'fret-numbers-position', 'fret-numbers-size', 
            'fret-numbers-offset', 'fret-markers-placement', 'show-fret-numbers', 'fret-numbers-shape', 'fret-markers-offset',
            'force-white-background', 'capo-enable', 'capo-fret', 'capo-style'
        ];
        
        basicUpdaters.forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateFretboard());
        });
        
        document.getElementById('key-select')?.addEventListener('change', () => {
            this.updateFretboard();
            this.updateTheoryInfo();
        });
        
        document.getElementById('display-mode')?.addEventListener('change', () => {
            this.updateFretboard();
            this.updateTheoryInfo();
        });
        
        document.getElementById('pattern-type')?.addEventListener('change', (e) => {
            const grp = document.getElementById('custom-pattern-import-group');
            if (grp) grp.style.display = (e.target.value === 'custom') ? 'flex' : 'none';
            // Switching from a scale, chord or interval to a layout type starts from that same pattern.
            const previous = this.fretboard && this.fretboard.currentPatternType;
            const previousPattern = this.fretboard && this.fretboard.currentPattern;
            this.updatePatternSelect();
            const isLayout = typeof FRETBOARD_LAYOUT_GROUPS !== 'undefined' && FRETBOARD_LAYOUT_GROUPS.some(group => group.id === e.target.value);
            if (isLayout && ['scale', 'chord', 'interval'].includes(previous)) this.setLayoutBase(previous, previousPattern);
            this.updateFretboard();
            this.updateTheoryInfo();
        });

        document.getElementById('pattern-select')?.addEventListener('change', () => {
            this.updateFretboard();
            this.updateTheoryInfo();
        });

        document.getElementById('layout-base-type')?.addEventListener('change', e => {
            this.setLayoutBase(e.target.value);
            this.updateFretboard();
            this.updateTheoryInfo();
        });

        document.getElementById('layout-base-select')?.addEventListener('change', () => {
            this.updateFretboard();
            this.updateTheoryInfo();
        });

        this.setLayoutBase('scale', 'major');
        
        document.getElementById('color-theme')?.addEventListener('change', e => {
            const cc = document.getElementById('custom-colors');
            if (cc) cc.style.display = e.target.value === 'custom' ? 'block' : 'none';
            this.updateFretboard();
        });

        document.addEventListener('change', e => {
            if (['export-simple-info', 'export-simple-info-sidebar', 'export-simple-info-pill'].includes(e.target.id)) {
                const isChecked = e.target.checked;
                ['export-simple-info', 'export-simple-info-sidebar', 'export-simple-info-pill'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el !== e.target) el.checked = isChecked;
                });
            }
        });
        
        document.querySelectorAll('.theory-info-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateTheoryInfo());
        });
        document.querySelector('#hide-about-section')?.addEventListener('change', () => this.updateTheoryInfo());

        document.getElementById('btn-delete-all-custom')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all custom patterns? This cannot be undone.')) {
                this.musicTheory.customPatterns = {};
                removeAppStorage('customPatterns');
                this.updatePatternSelect();
                this.updateFretboard();
                this.updateTheoryInfo();
                alert('All custom patterns have been deleted.');
            }
        });
    };
}