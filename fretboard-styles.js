class FretboardStyles {
    static applyFretStyle(fretElement, style, themeColors, fretboard) {
        // Access layout dimensions from fretboard to fix previous scope bugs
        const margin = fretboard.dimensions.margin;
        const width = fretboard.dimensions.width;
        const stringThickness = fretboard.settings.stringHeight;
        const y = parseFloat(fretElement.getAttribute('y1'));
        
        switch (style) {
            case 'dashed':
                fretElement.setAttribute('stroke-dasharray', '5,3');
                break;
            case 'dotted':
                fretElement.setAttribute('stroke-dasharray', '2,2');
                break;
            case 'double':
                fretElement.setAttribute('stroke-width', parseInt(fretElement.getAttribute('stroke-width')) * 1.5);
                const doubleString = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                doubleString.setAttribute('x1', margin.left);
                doubleString.setAttribute('y1', y + 2);
                doubleString.setAttribute('x2', width - margin.right);
                doubleString.setAttribute('y2', y + 2);
                doubleString.setAttribute('stroke', themeColors.strings);
                doubleString.setAttribute('stroke-width', stringThickness * 0.5);
                fretboard.svg.appendChild(doubleString);
                break;
            case 'longDash':
                fretElement.setAttribute('stroke-dasharray', '15,5');
                break;
            case 'shortDash':
                fretElement.setAttribute('stroke-dasharray', '5,3');
                break;
            case 'dashDot':
                fretElement.setAttribute('stroke-dasharray', '8,3,1,3');
                break;
            case 'dashDotDot':
                fretElement.setAttribute('stroke-dasharray', '8,3,1,3,1,3');
                break;
            case 'wave':
                const wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const amplitude = stringThickness * 2;
                const frequency = 20;
                let d = `M ${margin.left} ${y}`;
                
                for (let i = margin.left; i <= width - margin.right; i += 5) {
                    const yOffset = amplitude * Math.sin((i - margin.left) / frequency);
                    d += ` L ${i} ${y + yOffset}`;
                }
                
                wavePath.setAttribute('d', d);
                wavePath.setAttribute('fill', 'none');
                wavePath.setAttribute('stroke', themeColors.strings);
                wavePath.setAttribute('stroke-width', stringThickness);
                fretboard.svg.appendChild(wavePath);
                return;
            case 'zigzag':
                const zigzagPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const zHeight = stringThickness * 2;
                const zWidth = 10;
                let zd = `M ${margin.left} ${y}`;
                
                for (let i = margin.left + zWidth; i <= width - margin.right; i += zWidth * 2) {
                    zd += ` H ${i} V ${y + zHeight} H ${i + zWidth} V ${y}`;
                }
                
                zigzagPath.setAttribute('d', zd);
                zigzagPath.setAttribute('fill', 'none');
                zigzagPath.setAttribute('stroke', themeColors.strings);
                zigzagPath.setAttribute('stroke-width', stringThickness);
                fretboard.svg.appendChild(zigzagPath);
                return;
            case 'textured':
                fretboard.svg.appendChild(fretElement);
                const textureCount = 100;
                for (let i = 0; i < textureCount; i++) {
                    const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    const dashX = margin.left + (width - margin.left - margin.right) * (i / textureCount);
                    const dashOffset = (Math.random() - 0.5) * stringThickness * 2;
                    
                    dash.setAttribute('x1', dashX);
                    dash.setAttribute('y1', y + dashOffset);
                    dash.setAttribute('x2', dashX + 3);
                    dash.setAttribute('y2', y + dashOffset);
                    dash.setAttribute('stroke', themeColors.strings);
                    dash.setAttribute('stroke-width', stringThickness * 0.7);
                    
                    fretboard.svg.appendChild(dash);
                }
                return;
            case 'spiral':
                const spiralPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const spiralFreq = 12;
                const spiralAmp = stringThickness * 1.5;
                
                let spiralD = `M ${margin.left} ${y}`;
                for (let i = margin.left; i <= width - margin.right; i += 2) {
                    const phase = (i - margin.left) / spiralFreq;
                    const yOffset = spiralAmp * Math.sin(phase);
                    const xOffset = spiralAmp * Math.cos(phase) * 0.3;
                    
                    spiralD += ` L ${i + xOffset} ${y + yOffset}`;
                }
                
                spiralPath.setAttribute('d', spiralD);
                spiralPath.setAttribute('fill', 'none');
                spiralPath.setAttribute('stroke', themeColors.strings);
                spiralPath.setAttribute('stroke-width', stringThickness);
                fretboard.svg.appendChild(spiralPath);
                return;
            case 'dual-color':
                const dualColor1 = themeColors.strings;
                const dualColor2 = fretboard.lightenColor(themeColors.strings, 30);
                
                const dualString1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                dualString1.setAttribute('x1', margin.left);
                dualString1.setAttribute('y1', y);
                dualString1.setAttribute('x2', margin.left + (width - margin.left - margin.right) / 2);
                dualString1.setAttribute('y2', y);
                dualString1.setAttribute('stroke', dualColor1);
                dualString1.setAttribute('stroke-width', stringThickness);
                
                const dualString2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                dualString2.setAttribute('x1', margin.left + (width - margin.left - margin.right) / 2);
                dualString2.setAttribute('y1', y);
                dualString2.setAttribute('x2', width - margin.right);
                dualString2.setAttribute('y2', y);
                dualString2.setAttribute('stroke', dualColor2);
                dualString2.setAttribute('stroke-width', stringThickness);
                
                fretboard.svg.appendChild(dualString1);
                fretboard.svg.appendChild(dualString2);
                return;
            case 'celtic':
                const celticPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const knotSize = stringThickness * 3;
                const knotSpacing = knotSize * 5;
                
                let celticD = `M ${margin.left} ${y}`;
                
                for (let i = margin.left + knotSpacing; i < width - margin.right; i += knotSpacing) {
                    celticD += ` L ${i - knotSize} ${y}`;
                    celticD += ` C ${i - knotSize/2} ${y - knotSize}, ${i + knotSize/2} ${y - knotSize}, ${i + knotSize} ${y}`;
                    celticD += ` C ${i + knotSize/2} ${y + knotSize}, ${i - knotSize/2} ${y + knotSize}, ${i - knotSize} ${y}`;
                }
                
                celticD += ` L ${width - margin.right} ${y}`;
                
                celticPath.setAttribute('d', celticD);
                celticPath.setAttribute('fill', 'none');
                celticPath.setAttribute('stroke', themeColors.strings);
                celticPath.setAttribute('stroke-width', stringThickness * 0.7);
                fretboard.svg.appendChild(celticPath);
                return;
            case 'flame':
                const flamePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const flameFreq = 30;
                const flameAmp = stringThickness * 3;
                
                let flameD = `M ${margin.left} ${y}`;
                for (let i = margin.left; i <= width - margin.right; i += 2) {
                    const phase = (i - margin.left) / flameFreq;
                    const yOffset = flameAmp * Math.sin(phase);
                    const xOffset = flameAmp * Math.cos(phase) * 0.3;
                    
                    flameD += ` L ${i + xOffset} ${y + yOffset}`;
                }
                
                flamePath.setAttribute('d', flameD);
                flamePath.setAttribute('fill', 'none');
                flamePath.setAttribute('stroke', themeColors.strings);
                flamePath.setAttribute('stroke-width', stringThickness);
                
                const flameFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                const flameFilterId = `flame-filter-${Math.random().toString(36).substring(2, 9)}`;
                flameFilter.setAttribute('id', flameFilterId);
                
                const flameBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                flameBlur.setAttribute('stdDeviation', '1.5');
                flameBlur.setAttribute('result', 'blur');
                
                flameFilter.appendChild(flameBlur);
                
                const defsFl = fretboard.svg.querySelector('defs') || 
                                    fretboard.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), fretboard.svg.firstChild);
                defsFl.appendChild(flameFilter);
                
                flamePath.setAttribute('filter', `url(#${flameFilterId})`);
                fretboard.svg.appendChild(flamePath);
                return;
        }
    }

    /**
     * Apply a string style to a given line element instead of default solid string.
     * Returns true if the caller should skip appending the original (caller will then not re-append).
     */
    static applyStringStyle(lineElement, style, themeColors, fretboard, stringIndex) {
        const margin = fretboard.dimensions.margin;
        const width = fretboard.dimensions.width;
        const y = parseFloat(lineElement.getAttribute('y1'));
        const strokeWidth = lineElement.getAttribute('stroke-width') || 1;
        const color = themeColors.strings || '#888';

        // Helper to append a basic line
        const appendLine = (x1, y1, x2, y2, stroke = color, sw = strokeWidth, dash = null) => {
            const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ln.setAttribute('x1', x1);
            ln.setAttribute('y1', y1);
            ln.setAttribute('x2', x2);
            ln.setAttribute('y2', y2);
            ln.setAttribute('stroke', stroke);
            ln.setAttribute('stroke-width', sw);
            if (dash) ln.setAttribute('stroke-dasharray', dash);
            fretboard.svg.appendChild(ln);
        };

        // Normalize style names
        const s = (style || 'solid').toString();

        switch (s) {
            case 'solid':
            case 'default':
                // let caller append default solid (do not skip)
                return false;
            case 'dashed':
                appendLine(margin.left, y, width - margin.right, y, color, strokeWidth, '8,4');
                return true;
            case 'dotted':
                appendLine(margin.left, y, width - margin.right, y, color, strokeWidth, '2,6');
                return true;
            case 'double':
                appendLine(margin.left, y - 1.5, width - margin.right, y - 1.5, color, Math.max(1, strokeWidth - 0.5));
                appendLine(margin.left, y + 1.5, width - margin.right, y + 1.5, color, Math.max(1, strokeWidth - 0.5));
                return true;
            case 'longDash':
                appendLine(margin.left, y, width - margin.right, y, color, strokeWidth, '20,8');
                return true;
            case 'shortDash':
                appendLine(margin.left, y, width - margin.right, y, color, strokeWidth, '6,4');
                return true;
            case 'dashDot':
                appendLine(margin.left, y, width - margin.right, y, color, strokeWidth, '12,4,2,4');
                return true;
            case 'wave':
                // simple sinusoidal path approximated by many short lines
                const amp = 3;
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    const x2 = Math.min(width - margin.right, x + 6);
                    const yOffset = Math.sin((x - margin.left) / 20) * amp;
                    const yOffset2 = Math.sin((x2 - margin.left) / 20) * amp;
                    appendLine(x, y + yOffset, x2, y + yOffset2, color, strokeWidth);
                }
                return true;
            case 'zigzag':
                let step = 12;
                let dir = -1;
                for (let x = margin.left; x < width - margin.right; x += step) {
                    appendLine(x, y + (dir * 4), Math.min(width - margin.right, x + step), y - (dir * 4), color, strokeWidth);
                    dir = -dir;
                }
                return true;
            case 'textured':
                for (let i = margin.left; i < width - margin.right; i += 8) {
                    appendLine(i, y + (Math.random() * 4 - 2), i + 4, y + (Math.random() * 4 - 2), color, Math.max(0.5, strokeWidth * 0.6));
                }
                return true;
            case 'spiral':
                // subtle spiral-like wiggle
                for (let x = margin.left; x < width - margin.right; x += 4) {
                    const x2 = Math.min(width - margin.right, x + 4);
                    const offset = Math.cos((x - margin.left) / 12) * 3;
                    appendLine(x, y + offset, x2, y + Math.cos((x2 - margin.left) / 12) * 3, color, strokeWidth);
                }
                return true;
            case 'dual-color':
                // first half one color, second half lighter color
                const mid = margin.left + (width - margin.left - margin.right) / 2;
                appendLine(margin.left, y, mid, y, color, strokeWidth);
                appendLine(mid, y, width - margin.right, y, fretboard.lightenColor(color, 25), strokeWidth);
                return true;
            case 'celtic':
                // small decorative knots repeated across the length
                for (let x = margin.left + 10; x < width - margin.right; x += 30) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const k = 6;
                    const d = `M ${x - k} ${y} C ${x - k/2} ${y - k}, ${x + k/2} ${y - k}, ${x + k} ${y} C ${x + k/2} ${y + k}, ${x - k/2} ${y + k}, ${x - k} ${y}`;
                    path.setAttribute('d', d);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', color);
                    path.setAttribute('stroke-width', Math.max(1, strokeWidth * 0.6));
                    fretboard.svg.appendChild(path);
                }
                return true;
            case 'flame':
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    const h = Math.abs(Math.sin(x / 18)) * 6;
                    appendLine(x, y - h/2, x + 4, y + h/2, color, Math.max(0.8, strokeWidth * 0.9));
                }
                return true;

            // removed extended string styles -> moved to fretboard-styles-extended.js
            default:
                if (typeof FretboardStylesExtended !== 'undefined') {
                    return FretboardStylesExtended.applyStringStyle(s, lineElement, color, fretboard);
                }
                return false;
        }
    }
}