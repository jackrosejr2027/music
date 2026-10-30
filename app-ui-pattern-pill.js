/**
 * UI Pattern Pill Orchestrator
 */
if (typeof App !== 'undefined') {
    App.prototype.updateCurrentPatternDisplay = function(disp) {
        disp.innerHTML = '';
        if (!this._patternPillSyncBound) {
            const app = this;
            const sync = () => {
                const display = document.getElementById('current-pattern-display');
                const mainKey = document.getElementById('key-select');
                const mainType = document.getElementById('pattern-type');
                const mainPattern = document.getElementById('pattern-select');
                const inlineKey = display && display.querySelector('#current-pattern-key-select');
                const inlineType = display && display.querySelector('#current-pattern-type-select');
                const inlinePattern = display && display.querySelector('#current-pattern-select');
                if (inlineKey && mainKey) inlineKey.value = mainKey.value;
                if (inlineType && mainType) inlineType.value = mainType.value;
                if (inlinePattern && mainType && mainPattern) {
                    const exists = Array.from(inlinePattern.options).some(option => option.value === mainPattern.value);
                    if (!exists && app.populateInlinePatternSelect) app.populateInlinePatternSelect(inlinePattern, mainType.value, mainPattern.value);
                    else inlinePattern.value = mainPattern.value;
                }
                if (app._currentPatternFavoriteSync) app._currentPatternFavoriteSync();
            };
            ['key-select', 'pattern-type', 'pattern-select'].forEach(id => document.getElementById(id)?.addEventListener('change', sync));
            window.addEventListener('st:favoriteschange', () => {
                if (app._currentPatternFavoriteSync) app._currentPatternFavoriteSync();
            });
            this._patternPillSyncBound = true;
        }
        
        const keySelect = typeof this.createInlineKeySelect === 'function' ? this.createInlineKeySelect() : document.createElement('select');
        const patternTypeSelect = typeof this.createInlineTypeSelect === 'function' ? this.createInlineTypeSelect() : document.createElement('select');
        const patternSelectInline = typeof this.createInlinePatternSelect === 'function' ? this.createInlinePatternSelect() : document.createElement('select');
        
        const syncPatternSelect = (type, val) => {
            if(typeof this.populateInlinePatternSelect === 'function') {
                this.populateInlinePatternSelect(patternSelectInline, type, val);
            }
        };

        syncPatternSelect(patternTypeSelect.value, document.getElementById('pattern-select')?.value);
        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.className = 'current-pattern-favorite';
        favoriteButton.setAttribute('aria-pressed', 'false');
        function favoriteItem() {
            const key = keySelect.value || 'C';
            const type = patternTypeSelect.value;
            const id = patternSelectInline.value;
            const collection = type === 'scale' ? this.musicTheory.scales : type === 'chord' ? this.musicTheory.chords : type === 'interval' ? this.musicTheory.intervals : type === 'custom' ? this.musicTheory.customPatterns : type === 'lesson' ? this.lessons : type === 'chord_progression' ? this.chordProgressionPatterns : {};
            const data = Array.isArray(collection) ? collection[Number(id)] : collection && collection[id];
            const title = data && data.name || (type === 'lesson' ? data && data.title : '') || (type + ' ' + id);
            let notes = [];
            if (type === 'scale') notes = this.musicTheory.getScaleNotes(key, id);
            else if (type === 'chord') notes = this.musicTheory.getChordNotes(key, id);
            else if (type === 'interval') notes = [key, this.musicTheory.getNoteFromInterval(key, id)].filter(Boolean);
            else if (type === 'custom' && this.musicTheory.getCustomNotes) notes = this.musicTheory.getCustomNotes(key, id);
            const diagramData = {
                key, patternType: type, patternId: id,
                formula: data && data.intervals ? data.intervals.join(' - ') : '',
                notes, tuning: this.getCurrentTuning ? this.getCurrentTuning() : [],
                startFret: Number(this.settings && this.settings.startFret) || 0,
                endFret: Number(this.settings && this.settings.endFret) || 12,
                displayMode: this.settings && this.settings.displayMode || 'intervals',
                capo: Number(this.settings && this.settings.capo) || 0,
                capoEnabled: !!(this.settings && this.settings.capoEnabled),
                capoStyle: this.settings?.capoStyle || 'bar',
                fretNumbersShape: this.settings?.fretNumbersShape || 'none',
                visibleStrings: this.getVisibleStrings ? this.getVisibleStrings() : [],
                stringStartFrets: this.getStringStartFrets ? this.getStringStartFrets() : [],
                stringEndFrets: this.getStringEndFrets ? this.getStringEndFrets() : []
            };
            const signature = JSON.stringify([type, key, id, diagramData.tuning, diagramData.startFret, diagramData.endFret, diagramData.displayMode, diagramData.capo, diagramData.capoEnabled, diagramData.capoStyle, diagramData.fretNumbersShape, diagramData.visibleStrings, diagramData.stringStartFrets, diagramData.stringEndFrets]);
            let hash = 2166136261;
            for (let i = 0; i < signature.length; i++) hash = Math.imul(hash ^ signature.charCodeAt(i), 16777619);
            const favoriteId = type + '|' + key + '|' + id + '|' + (hash >>> 0).toString(36);
            const target = 'fretboard.html?key=' + encodeURIComponent(key) + '&patternType=' + encodeURIComponent(type) + '&pattern=' + encodeURIComponent(id) + '&favorite=' + encodeURIComponent(favoriteId);
            return { type: 'fretboard-diagram', id: favoriteId, title: key + ' ' + title, href: target, data: diagramData };
        }
        function syncFavorite() {
            const item = favoriteItem.call(this);
            const saved = !!(window.ST && ST.favorites && ST.favorites.has(item.type, item.id));
            favoriteButton.setAttribute('aria-pressed', String(saved));
            favoriteButton.textContent = saved ? '★' : '☆';
            favoriteButton.title = saved ? 'Remove current diagram from Favorites' : 'Save current diagram to Favorites';
            favoriteButton.setAttribute('aria-label', favoriteButton.title);
        }
        favoriteButton.addEventListener('click', () => {
            if (!window.ST || !ST.favorites) return;
            const item = favoriteItem.call(this);
            const result = ST.favorites.toggle(item);
            if (!result.ok && ST.toast) ST.toast('Could not update Favorites. Check device storage.');
            syncFavorite.call(this);
        });
        patternTypeSelect.addEventListener('change', e => { syncPatternSelect(e.target.value, null); syncFavorite.call(this); });
        patternSelectInline.addEventListener('change', () => syncFavorite.call(this));
        keySelect.addEventListener('change', () => syncFavorite.call(this));
        syncFavorite.call(this);
        this._currentPatternFavoriteSync = () => syncFavorite.call(this);

        const actionBtns = typeof this.createInlineActionButtons === 'function' ? this.createInlineActionButtons(disp) : [];
        const cycleBtns = typeof this.createInlineCycleControls === 'function' ? this.createInlineCycleControls(disp) : [];

        const container = document.createElement('div');
        container.className = 'consolidated-selector-pill';
        // The visible selectors now live in each diagram's controls below its SVG.
        container.style.display = 'none';
        container.hidden = true;
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '4px';
        container.style.background = 'var(--card-bg)';
        container.style.border = '1px solid var(--border-color)';
        container.style.borderRadius = '30px';
        container.style.padding = '4px 18px';
        container.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
        container.style.margin = '0 auto';

        const createSep = () => {
            const sep = document.createElement('span');
            sep.textContent = '·';
            sep.style.color = 'var(--border-color)';
            sep.style.fontWeight = '900';
            sep.style.fontSize = '1.4em';
            sep.style.padding = '0 4px';
            return sep;
        };

        container.appendChild(keySelect);
        container.appendChild(createSep());
        container.appendChild(patternTypeSelect);
        container.appendChild(createSep());
        container.appendChild(patternSelectInline);

        actionBtns.forEach(btn => container.appendChild(btn));
        cycleBtns.forEach(btn => container.appendChild(btn));

        const wrapper = document.createElement('div');
        wrapper.className = 'current-pattern-display-inner';
        wrapper.appendChild(container);
        wrapper.appendChild(favoriteButton);
        
        disp.appendChild(wrapper);
    };
}