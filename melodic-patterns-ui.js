/**
 * Melodic Pattern UI Extension
 */
function initializeMelodicPatternUI() {
    const selects = Array.from(document.querySelectorAll('#melodic-pattern-select'));
    if (typeof MELODIC_PATTERNS_DATA !== 'undefined') {
        selects.forEach(select => {
            if (select && select.options.length === 0) {
                MELODIC_PATTERNS_DATA.forEach(pattern => {
                    const option = new Option(pattern.text, pattern.value);
                    select.appendChild(option);
                });
            }
        });
    }

    const container = document.getElementById('custom-pattern-container');
    selects.forEach(select => {
        if (!select) return;
        select.addEventListener('change', (e) => {
            if (container) container.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
        if (select.value === 'custom' && container) container.style.display = 'block';
    });

    const primarySelect = selects[0] || document.getElementById('melodic-pattern-select');
    const melodicWrapper = primarySelect ? primarySelect.parentElement : null;
    if (melodicWrapper && !document.getElementById('melodic-pattern-length')) {
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'control-group';
        lengthDiv.style.marginTop = '8px';
        lengthDiv.innerHTML = `<label for="melodic-pattern-length">Sequence override:</label>`;
        const lengthSelect = document.createElement('select');
        lengthSelect.id = 'melodic-pattern-length';
        [{v:'12',t:'1 2 (Pair)'},{v:'123',t:'1 2 3 (Three)'},{v:'1234',t:'1 2 3 4 (Four)'},{v:'12345',t:'1 2 3 4 5 (Five)'},{v:'preset',t:'Use Selected Preset'},{v:'custom',t:'Custom Sequence'}]
        .forEach(o => lengthSelect.appendChild(new Option(o.t, o.v)));
        lengthSelect.value = 'preset';
        lengthDiv.appendChild(lengthSelect);
        const customLen = document.createElement('div');
        customLen.id = 'melodic-custom-length-container';
        customLen.style.display = 'none';
        customLen.style.marginTop = '6px';
        customLen.innerHTML = `<label for="melodic-custom-length">Custom degree sequence:</label><div style="display:flex;gap:5px;"><input type="text" id="melodic-custom-length" placeholder="e.g., 1 2 3 4" style="flex:1;"><button id="melodic-randomize-btn" style="width:auto;padding:0 8px;" title="Generate a random degree sequence">Random sequence</button></div>`;
        lengthDiv.appendChild(customLen);
        
        const randBtn = customLen.querySelector('#melodic-randomize-btn');
        if (randBtn) {
            randBtn.addEventListener('click', () => {
                const len = Math.floor(Math.random() * 5) + 3; // 3 to 7 notes
                const seq = [];
                for(let i=0; i<len; i++) seq.push(Math.floor(Math.random() * 8) + 1);
                document.getElementById('melodic-custom-length').value = seq.join(' ');
            });
        }
        melodicWrapper.appendChild(lengthDiv);
        lengthSelect.addEventListener('change', (e) => {
            customLen.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }
}

const MELODIC_CHAIN_MAX = 20;

/**
 * Chain length input and the preset selects for chain items 2..20. Items beyond the chain length are hidden.
 */
function initializeMelodicChainControls() {
    const countInput = document.getElementById('melodic-chain-count');
    const container = document.getElementById('melodic-chain-container');
    const primary = document.getElementById('melodic-pattern-select');
    if (!countInput || !container || !primary || typeof MELODIC_PATTERNS_DATA === 'undefined') return;

    const presets = MELODIC_PATTERNS_DATA.filter(pattern => pattern.value !== 'custom');
    if (!container.dataset.ready) {
        container.dataset.ready = 'true';
        const defaultValue = presets.some(pattern => pattern.value === primary.value) ? primary.value : (presets[0]?.value || '');
        for (let index = 2; index <= MELODIC_CHAIN_MAX; index++) {
            const item = document.createElement('div');
            item.className = 'melodic-chain-item';
            item.dataset.index = String(index);
            item.style.display = 'none';
            item.style.alignItems = 'center';
            item.style.gap = '6px';
            const label = document.createElement('label');
            label.htmlFor = 'melodic-chain-preset-' + index;
            label.textContent = 'Preset ' + index + ':';
            const select = document.createElement('select');
            select.id = 'melodic-chain-preset-' + index;
            presets.forEach(pattern => select.appendChild(new Option(pattern.text, pattern.value)));
            select.value = defaultValue;
            item.append(label, select);
            container.appendChild(item);
        }
        countInput.addEventListener('change', () => syncMelodicChainVisibility());
    }

    function syncMelodicChainVisibility() {
        const count = Math.max(1, Math.min(MELODIC_CHAIN_MAX, Math.floor(Number(countInput.value)) || 1));
        countInput.value = String(count);
        container.querySelectorAll('.melodic-chain-item').forEach(item => {
            item.style.display = Number(item.dataset.index) <= count ? 'flex' : 'none';
        });
    }
    syncMelodicChainVisibility();
}

if (typeof App !== 'undefined') {
    App.prototype.setupMelodicPatternControls = function() {
        initializeMelodicPatternUI();
        initializeMelodicChainControls();
        const playBtn = document.getElementById('play-melodic-pattern');
        const stopBtn = document.getElementById('stop-melodic-pattern');
        const customCont = document.getElementById('custom-pattern-container');
        if (stopBtn) stopBtn.style.display = 'none';
        if (playBtn) playBtn.style.display = 'inline-block';
        if (customCont) customCont.style.display = 'none';
    };
}