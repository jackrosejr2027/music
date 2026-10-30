class FretboardStylesExtended {
    static applyStringStyle(style, lineElement, color, fretboard) {
        const margin = fretboard.dimensions.margin;
        const width = fretboard.dimensions.width;
        const y = parseFloat(lineElement.getAttribute('y1'));
        const strokeWidth = lineElement.getAttribute('stroke-width') || 1;

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

        const s = style.toString();

        switch (s) {
            case 'neon':
                appendLine(margin.left, y, width - margin.right, y, fretboard.lightenColor(color, 60), strokeWidth * 3);
                appendLine(margin.left, y, width - margin.right, y, color, Math.max(1, strokeWidth * 0.9));
                return true;

            case 'grain':
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    const jitter = (Math.random() - 0.5) * 2;
                    appendLine(x, y + jitter, x + 3, y - jitter, fretboard.lightenColor(color, 10), Math.max(0.6, strokeWidth * 0.6));
                }
                return true;

            case 'braided':
            case 'braided2':
                for (let x = margin.left + 6; x < width - margin.right; x += 10) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const k = 5;
                    const d = `M ${x-k} ${y} C ${x-k/2} ${y-k}, ${x+k/2} ${y+k}, ${x+k} ${y}`;
                    path.setAttribute('d', d);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', fretboard.lightenColor(color, (x % 20 === 0) ? 30 : 10));
                    path.setAttribute('stroke-width', Math.max(0.6, strokeWidth * 0.6));
                    fretboard.svg.appendChild(path);
                }
                return true;

            case 'rope':
            case 'twine':
                for (let x = margin.left; x < width - margin.right; x += 8) {
                    appendLine(x, y - 2, x + 4, y + 2, fretboard.lightenColor(color, 20), Math.max(0.6, strokeWidth * 0.6));
                    appendLine(x + 2, y + 2, x + 6, y - 2, fretboard.lightenColor(color, -10), Math.max(0.6, strokeWidth * 0.6));
                }
                return true;

            case 'plated':
                for (let x = margin.left; x < width - margin.right; x += 20) {
                    appendLine(x, y, Math.min(width - margin.right, x + 12), y, fretboard.lightenColor(color, 40), strokeWidth * 1.4);
                }
                appendLine(margin.left, y, width - margin.right, y, color, Math.max(0.8, strokeWidth * 0.9));
                return true;

            case 'etched':
                appendLine(margin.left, y, width - margin.right, y, fretboard.lightenColor(color, 30), 0.8, '2,4');
                appendLine(margin.left, y, width - margin.right, y, fretboard.lightenColor(color, -20), 0.6);
                return true;

            case 'hollow':
                appendLine(margin.left, y - 1.5, width - margin.right, y - 1.5, fretboard.lightenColor(color, 20), 1);
                appendLine(margin.left, y + 1.5, width - margin.right, y + 1.5, fretboard.lightenColor(color, -10), 1);
                return true;

            case 'split':
                const splitMid = margin.left + (width - margin.left - margin.right) / 2;
                appendLine(margin.left, y, splitMid, y, color, strokeWidth);
                appendLine(splitMid, y, width - margin.right, y, fretboard.lightenColor(color, 30), strokeWidth);
                return true;

            case 'beveled':
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    const shade = (x % 18 === 0) ? fretboard.lightenColor(color, 35) : fretboard.lightenColor(color, 10);
                    appendLine(x, y - 1, x + 3, y + 1, shade, Math.max(0.6, strokeWidth * 0.7));
                }
                return true;

            case 'fiberglass':
            case 'carbon':
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    appendLine(x, y - 2, x + 3, y + 2, fretboard.lightenColor(color, (x % 12) ? 20 : -10), 0.6);
                    appendLine(x + 1, y + 2, x + 4, y - 2, fretboard.lightenColor(color, -5), 0.6);
                }
                return true;

            case 'twill':
                for (let x = margin.left; x < width - margin.right; x += 8) {
                    appendLine(x, y - 3, x + 6, y + 3, fretboard.lightenColor(color, 10), 0.8);
                }
                return true;

            case 'serrated':
                for (let x = margin.left; x < width - margin.right; x += 6) {
                    appendLine(x, y - 3, x + 3, y, fretboard.lightenColor(color, -5), Math.max(0.6, strokeWidth * 0.6));
                    appendLine(x + 3, y, x + 6, y + 3, fretboard.lightenColor(color, 10), Math.max(0.6, strokeWidth * 0.6));
                }
                return true;

            case 'ridge':
                for (let x = margin.left; x < width - margin.right; x += 10) {
                    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const k = 3;
                    const d = `M ${x-k} ${y} Q ${x} ${y - k}, ${x+k} ${y}`;
                    p.setAttribute('d', d);
                    p.setAttribute('fill', 'none');
                    p.setAttribute('stroke', fretboard.lightenColor(color, 15));
                    p.setAttribute('stroke-width', Math.max(0.5, strokeWidth * 0.6));
                    fretboard.svg.appendChild(p);
                }
                return true;

            default:
                return false;
        }
    }
}