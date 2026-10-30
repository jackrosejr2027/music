/**
 * Fretboard Grid Drawing Methods
 */
if (typeof Fretboard !== 'undefined') {
    Fretboard.prototype.drawFretboard = function() {
        if (!this.dimensions || !this.settings) return;

        const { width, height, margin, fretSpacing, stringSpacing } = this.dimensions;
        const { startFret, endFret, tuning, stringHeight, fretWidth, fretNumbersPlacement, fretNumbersPosition, 
                fretNumbersSize, fretNumbersOffset, fretStyle } = this.settings;
        
        if (!tuning || !margin) return;
        const stringCount = tuning.length;
        
        // Get colors from theme
        const colors = this.getThemeColors();
        
        // Update string spacing from settings if available
        if (this.settings.stringSpacing) {
            this.dimensions.stringSpacing = this.settings.stringSpacing;
        }
        
        // Draw the fretboard background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', margin.left);
        background.setAttribute('y', margin.top);
        background.setAttribute('width', width - margin.left - margin.right);
        background.setAttribute('height', (stringCount - 1) * this.dimensions.stringSpacing);
        background.setAttribute('fill', colors.background);
        this.svg.appendChild(background);
        
        // Draw strings (always append tuning labels first so they appear regardless of string style)
        for (let i = 0; i < stringCount; i++) {
            const y = margin.top + (stringCount - 1 - i) * this.dimensions.stringSpacing;

            // Always create and append the tuning label before any string-style rendering,
            // so labels remain visible even when a custom string style replaces the default line.
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'string-label');
            label.setAttribute('x', margin.left - (fretSpacing / 2) - 20);
            label.setAttribute('y', y + 5);
            // Use same font as note markers for consistency
            try { label.setAttribute('font-family', this.settings.noteFont || 'Arial Narrow'); } catch (e) {}
            // Match note font size if available (slightly smaller fallback)
            try { label.setAttribute('font-size', `${Math.max(10, (this.settings.noteFontSize || 12) - 2)}px`); } catch (e) {}
            label.textContent = tuning[i];
            this.svg.appendChild(label);

            const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            string.setAttribute('class', 'string');
            string.setAttribute('x1', margin.left);
            string.setAttribute('y1', y);
            string.setAttribute('x2', width - margin.right);
            string.setAttribute('y2', y);

            const stringThickness = this.settings.stringHeight;

            if (this.settings.stringStyle && this.settings.stringStyle !== 'solid') {
                if (typeof FretboardStyles !== 'undefined' && typeof FretboardStyles.applyStringStyle === 'function') {
                    // applyStringStyle may render a custom representation for this specific string.
                    // If it returns true, skip appending the default 'string' element for THIS string only.
                    const skipOriginal = FretboardStyles.applyStringStyle(string, this.settings.stringStyle, colors, this, i);
                    if (skipOriginal) {
                        // label already appended above; skip appending the original string
                        continue;
                    }
                }
            }

            string.setAttribute('stroke', colors.strings);
            string.setAttribute('stroke-width', stringThickness);

            if (this.settings.stringEffect) {
                switch (this.settings.stringEffect) {
                    case 'glow': this.applyGlowEffect(string, colors.strings); break;
                    case 'shadow': this.applyShadowEffect(string); break;
                    case 'highlight':
                        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        highlight.setAttribute('x1', margin.left);
                        highlight.setAttribute('y1', y - 1);
                        highlight.setAttribute('x2', width - margin.right);
                        highlight.setAttribute('y2', y - 1);
                        highlight.setAttribute('stroke', this.lightenColor(colors.strings, 50));
                        highlight.setAttribute('stroke-width', 1);
                        highlight.setAttribute('stroke-opacity', 0.5);
                        this.svg.appendChild(highlight);
                        break;
                    case 'metallic': this.applyMetallicEffect(string, y, margin.left, width - margin.right, colors.strings); break;
                }
            }

            this.svg.appendChild(string);
        }
        
        // Draw frets
        for (let i = 0; i <= endFret - startFret; i++) {
            const x = margin.left + i * fretSpacing;
            const fret = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            fret.setAttribute('class', 'fret');
            fret.setAttribute('x1', x);
            fret.setAttribute('y1', margin.top);
            fret.setAttribute('x2', x);
            fret.setAttribute('y2', margin.top + (stringCount - 1) * this.dimensions.stringSpacing);
            fret.setAttribute('stroke', colors.frets);
            fret.setAttribute('stroke-width', fretWidth);
            
            if (fretStyle && fretStyle !== 'solid' && typeof FretboardStyles !== 'undefined') {
                FretboardStyles.applyFretStyle(fret, fretStyle, colors, this);
            }
            
            this.svg.appendChild(fret);
            
            const fretNumber = startFret + i;
            if (fretNumber > 0 && this.settings.showFretNumbers !== false) {
                const number = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                number.setAttribute('class', 'fret-number');
                let xPos = x - fretSpacing/2;
                if (fretNumbersPosition === 'left') xPos = x - fretSpacing + 10;
                else if (fretNumbersPosition === 'right') xPos = x - 10;
                
                let yPos = (fretNumbersPlacement === 'above') ? (margin.top - 10 + fretNumbersOffset) : (margin.top + stringCount * this.dimensions.stringSpacing + 20 + fretNumbersOffset);
                
                const align = fretNumbersPosition === 'center' ? 'middle' : fretNumbersPosition === 'left' ? 'start' : 'end';
                
                // Add a subtle background shape to improve readability over varied backgrounds
                const textStr = fretNumber.toString();
                const estWidth = textStr.length * fretNumbersSize * 0.7 + 8;
                const estHeight = fretNumbersSize + 6;
                const bgX = xPos - (align === 'middle' ? estWidth/2 : align === 'start' ? 4 : estWidth - 4);
                const bgY = yPos - fretNumbersSize + 2;
                
                if (this.settings.fretNumbersShape !== 'none') {
                    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    const shapeType = this.settings.fretNumbersShape || 'pill';
                    const useCustomShape = typeof FretNumberShapes !== 'undefined' && FretNumberShapes.has(shapeType);
                    let finalWidth = estWidth + 4;
                    let finalHeight = estHeight + 4;
                    let finalX = bgX - 2;
                    let finalY = bgY - 2;
                    let rx = '6';

                    if (shapeType === 'circle') {
                        const maxDim = Math.max(finalWidth, finalHeight);
                        finalX -= (maxDim - finalWidth) / 2;
                        finalY -= (maxDim - finalHeight) / 2;
                        finalWidth = maxDim;
                        finalHeight = maxDim;
                        rx = (maxDim / 2).toString();
                    } else if (shapeType === 'square') {
                        rx = '0';
                    }

                    bg.setAttribute('x', finalX);
                    bg.setAttribute('y', finalY);
                    bg.setAttribute('width', finalWidth);
                    bg.setAttribute('height', finalHeight);
                    bg.setAttribute('fill', colors.background);
                    bg.setAttribute('stroke', colors.frets);
                    bg.setAttribute('stroke-width', '1');
                    bg.setAttribute('opacity', '0.9');
                    bg.setAttribute('rx', rx);
                    if (useCustomShape) {
                        FretNumberShapes.render(this.svg, shapeType, { cx: finalX + finalWidth / 2, cy: finalY + finalHeight / 2, halfWidth: finalWidth / 2, halfHeight: finalHeight / 2, fill: colors.background, stroke: colors.frets });
                    } else {
                        this.svg.appendChild(bg);
                    }
                }
                
                number.setAttribute('text-anchor', align);
                number.setAttribute('x', xPos);
                number.setAttribute('y', yPos);
                number.setAttribute('font-size', `${fretNumbersSize}px`);
                // Use same font as note markers for readable consistency
                try { number.setAttribute('font-family', this.settings.noteFont || 'Arial Narrow'); } catch (e) {}
                number.textContent = textStr;
                this.svg.appendChild(number);
            }
        }

        // Draw capo if enabled
        try {
            if (this.settings && this.settings.capoEnabled && this.settings.capo && this.settings.capo > startFret && this.settings.capo <= endFret) {
                const capoFret = this.settings.capo;
                const capoPos = capoFret - startFret;
                const capoX = margin.left + capoPos * fretSpacing - fretSpacing/2;
                const capoRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                // draw a bar across strings slightly above nut line to visually represent capo
                const topY = margin.top - 6;
                const bottomY = margin.top + (stringCount - 1) * this.dimensions.stringSpacing + 6;
                capoRect.setAttribute('x', capoX - 6);
                capoRect.setAttribute('y', topY);
                capoRect.setAttribute('width', 12);
                capoRect.setAttribute('height', bottomY - topY);
                capoRect.setAttribute('fill', '#222');
                capoRect.setAttribute('opacity', '0.9');
                capoRect.setAttribute('rx', '3');
                capoRect.setAttribute('class', 'capo-marker');
                if (typeof FretboardCapoStyles !== 'undefined') {
                    FretboardCapoStyles.render(this.svg, this.settings.capoStyle || 'bar', { x: capoX - 6, y: topY, width: 12, height: bottomY - topY });
                } else {
                    this.svg.appendChild(capoRect);
                }
            }
        } catch (e) {
            // silently ignore capo draw errors
            console.warn('Capo draw error', e);
        }
        
        // Draw fret markers
        const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        for (let fret of markerFrets) {
            if (fret >= startFret && fret <= endFret) {
                const fretPosition = fret - startFret;
                const x = margin.left + fretPosition * fretSpacing - fretSpacing/2;
                let y;
                if (this.settings.fretMarkersPlacement === 'above') y = margin.top - 15;
                else if (this.settings.fretMarkersPlacement === 'below') y = margin.top + stringCount * this.dimensions.stringSpacing + 15;
                else y = margin.top + (stringCount - 1) * this.dimensions.stringSpacing / 2;
                
                if (fret === 12 || fret === 24) {
                    const spacing = stringCount > 3 ? this.dimensions.stringSpacing : 10;
                    y = margin.top + (stringCount - 1) * this.dimensions.stringSpacing / 2;
                    this.drawFretMarker(x, y - spacing/2, colors.markers);
                    this.drawFretMarker(x, y + spacing/2, colors.markers);
                } else {
                    this.drawFretMarker(x, y, colors.markers);
                }
            }
        }
    };

    Fretboard.prototype.drawFretMarker = function(x, y, color) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('class', 'fret-marker');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 5);
        marker.setAttribute('fill', color);
        this.svg.appendChild(marker);
    };
}