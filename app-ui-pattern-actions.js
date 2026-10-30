/**
 * UI Pattern Actions & Cycle Controls
 */
if (typeof App !== 'undefined') {
    App.prototype.createInlineActionBtn = function(text, onClick, isPrimary = false) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.marginLeft = '6px';
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '20px';
        btn.style.background = isPrimary ? 'var(--accent-color)' : 'rgba(0,0,0,0.05)';
        btn.style.color = isPrimary ? '#fff' : 'var(--text-color)';
        btn.style.border = isPrimary ? 'none' : '1px solid var(--border-color)';
        btn.style.fontSize = '0.8em';
        btn.style.fontWeight = '700';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s ease';
        btn.style.whiteSpace = 'nowrap';
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseenter', () => btn.style.background = isPrimary ? 'var(--secondary-color)' : 'rgba(0,0,0,0.1)');
        btn.addEventListener('mouseleave', () => btn.style.background = isPrimary ? 'var(--accent-color)' : 'rgba(0,0,0,0.05)');
        return btn;
    };

    App.prototype.createInlineActionButtons = function() {
        // Inline pill no longer contains slideshow add button.
        // Slideshow add moved to dedicated sidebar quick actions section.
        return [];
    };

    App.prototype.createInlineCycleControls = function(disp) {
        // Move the cycle controls into the bottom controls area (#controls-bottom).
        // Build a compact control block and inject it into the bottom footer (if present).
        // Return an empty array so nothing is added inline in the pill.

        // preserve previously entered seconds value between creations
        const preservedSeconds = this._preservedCycleSeconds || '4';

        // Create wrapper for bottom controls
        const bottomWrapperId = 'bottom-cycle-controls-wrapper';
        let bottomWrapper = document.getElementById(bottomWrapperId);
        if (!bottomWrapper) {
            bottomWrapper = document.createElement('div');
            bottomWrapper.id = bottomWrapperId;
            bottomWrapper.style.display = 'flex';
            bottomWrapper.style.alignItems = 'center';
            bottomWrapper.style.gap = '8px';
            bottomWrapper.style.minWidth = '260px';
            bottomWrapper.style.marginLeft = '8px';
            bottomWrapper.style.flexWrap = 'wrap';

            // Inner expandable area
            const autoPlayInner = document.createElement('div');
            autoPlayInner.style.display = 'inline-flex';
            autoPlayInner.style.alignItems = 'center';
            autoPlayInner.style.gap = '6px';

            const secondsInput = document.createElement('input');
            secondsInput.id = 'bottom-cycle-seconds-input';
            secondsInput.type = 'number';
            secondsInput.min = '0.5';
            secondsInput.step = '0.5';
            secondsInput.value = preservedSeconds;
            secondsInput.style.width = '56px';
            secondsInput.style.padding = '4px 6px';
            secondsInput.style.borderRadius = '6px';
            secondsInput.style.border = '1px solid var(--input-border)';
            secondsInput.style.background = 'transparent';
            secondsInput.style.fontWeight = '700';
            secondsInput.style.color = 'var(--text-color)';
            secondsInput.style.textAlign = 'center';

            const secLabel = document.createElement('label');
            secLabel.textContent = 'Target seconds per pattern';
            secLabel.htmlFor = secondsInput.id;
            secondsInput.setAttribute('aria-label', 'Target seconds per pattern');
            secLabel.style.fontSize = '0.9em';
            secLabel.style.color = 'var(--secondary-color)';

            const cycleBtn = this.createInlineActionBtn('Cycle patterns', (e) => {
                e.stopPropagation();
                const val = parseFloat(secondsInput.value) || 4;
                this._preservedCycleSeconds = secondsInput.value;
                if (typeof this.playPatternTypeCycle === 'function') this.playPatternTypeCycle(false, val);
            }, true);

            const shuffleBtn = this.createInlineActionBtn('Shuffle patterns', (e) => {
                e.stopPropagation();
                const val = parseFloat(secondsInput.value) || 4;
                this._preservedCycleSeconds = secondsInput.value;
                if (typeof this.playPatternTypeCycle === 'function') this.playPatternTypeCycle(true, val);
            }, false);

            autoPlayInner.appendChild(secondsInput);
            autoPlayInner.appendChild(secLabel);
            autoPlayInner.appendChild(cycleBtn);
            autoPlayInner.appendChild(shuffleBtn);

            bottomWrapper.appendChild(autoPlayInner);

            // store reference for later toggling
            this._bottomCycleInner = autoPlayInner;
            this._bottomCycleSeconds = secondsInput;
        } else {
            // if already exists, update seconds input with preserved value
            const si = bottomWrapper.querySelector('#bottom-cycle-seconds-input');
            if (si) si.value = preservedSeconds;
        }

        // Insert into bottom controls if present
        const bottomControls = document.getElementById('board-pattern-cycle') || document.getElementById('controls-bottom');
        if (bottomControls) {
            // try to place near the left side of bottom controls, avoid duplicating
            if (!bottomControls.querySelector('#' + bottomWrapper.id)) {
                // wrap to a small container so layout matches other bottom items
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.gap = '6px';
                container.style.minWidth = '260px';
                container.id = 'bottom-cycle-container';
                container.appendChild(bottomWrapper);
                bottomControls.appendChild(container);
            }
        }

        // Return nothing for inline placement (we moved controls to bottom)
        return [];
    };
}