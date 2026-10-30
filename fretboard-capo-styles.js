/**
 * Capo styles. Each style draws into the same tall, narrow box the plain capo bar uses.
 * The main element keeps the capo-marker class so existing selectors still find it.
 */
(function () {
    'use strict';
    const NS = 'http://www.w3.org/2000/svg';
    let gradientCount = 0;

    function node(tag, attrs) {
        const element = document.createElementNS(NS, tag);
        Object.keys(attrs).forEach(key => element.setAttribute(key, String(attrs[key])));
        return element;
    }

    // Each entry returns the elements to draw for a box { x, y, width, height }.
    function bar(fill, stroke, extra = {}) {
        return (svg, box, add) => add(node('rect', {
            x: box.x, y: box.y, width: box.width, height: box.height, rx: 3,
            fill, stroke: stroke || 'none', 'stroke-width': stroke ? 0.6 : 0, opacity: 0.9, class: 'capo-marker', ...extra
        }));
    }

    function gradientBar(stops, stroke) {
        return (svg, box, add) => {
            const id = 'capo-grad-' + (++gradientCount);
            const defs = node('defs', {});
            const gradient = node('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 0 });
            stops.forEach(([offset, color]) => gradient.appendChild(node('stop', { offset, 'stop-color': color })));
            defs.appendChild(gradient);
            svg.appendChild(defs);
            add(node('rect', {
                x: box.x, y: box.y, width: box.width, height: box.height, rx: 3,
                fill: 'url(#' + id + ')', stroke: stroke || 'none', 'stroke-width': 0.6, class: 'capo-marker'
            }));
        };
    }

    const cx = box => box.x + box.width / 2;

    const STYLES = {
        bar: bar('#222'),
        thin: (svg, box, add) => add(node('rect', {
            x: cx(box) - 2.5, y: box.y, width: 5, height: box.height, rx: 2, fill: '#1a1a1a', class: 'capo-marker'
        })),
        double: (svg, box, add) => {
            add(node('rect', { x: cx(box) - 6, y: box.y, width: 4, height: box.height, rx: 1.5, fill: '#222', class: 'capo-marker' }));
            svg.appendChild(node('rect', { x: cx(box) + 2, y: box.y, width: 4, height: box.height, rx: 1.5, fill: '#222' }));
        },
        chrome: gradientBar([[0, '#f7f9fb'], [0.45, '#9aa3ad'], [0.55, '#e6eaef'], [1, '#6b7480']], '#4a525c'),
        gold: gradientBar([[0, '#fff3b0'], [0.5, '#d4a526'], [1, '#8a6412']], '#6e4f0c'),
        wood: gradientBar([[0, '#c9a27a'], [0.5, '#8b5a2b'], [1, '#c9a27a']], '#5a3a1a'),
        rubber: (svg, box, add) => add(node('rect', {
            x: box.x, y: box.y, width: box.width, height: box.height, rx: 6, fill: '#111', stroke: '#333', 'stroke-width': 1, class: 'capo-marker'
        })),
        clamp: (svg, box, add) => {
            add(node('rect', { x: box.x + 2, y: box.y, width: box.width - 4, height: box.height, rx: 2, fill: '#333', class: 'capo-marker' }));
            [box.y + 8, box.y + box.height - 8].forEach(y => {
                svg.appendChild(node('circle', { cx: cx(box), cy: y, r: 3, fill: '#8a8f96', stroke: '#222', 'stroke-width': 0.8 }));
            });
        },
        pill: (svg, box, add) => add(node('rect', {
            x: box.x - 1, y: box.y, width: box.width + 2, height: box.height, rx: (box.width + 2) / 2, fill: '#444', class: 'capo-marker'
        })),
        notched: (svg, box, add) => {
            add(node('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: 3, fill: '#222', class: 'capo-marker' }));
            for (let y = box.y + 6; y < box.y + box.height - 4; y += 9) {
                svg.appendChild(node('rect', { x: box.x + 2, y, width: box.width - 4, height: 1.5, fill: '#fff', opacity: 0.35 }));
            }
        },
        shadow: (svg, box, add) => {
            svg.appendChild(node('rect', { x: box.x + 2, y: box.y + 2, width: box.width, height: box.height, rx: 3, fill: '#000', opacity: 0.35 }));
            add(node('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: 3, fill: '#222', class: 'capo-marker' }));
        },
        blue: bar('#2d6cdf', '#1d4aa0'),
        red: bar('#c0392b', '#8e2a20'),
        striped: (svg, box, add) => {
            add(node('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: 3, fill: '#222', class: 'capo-marker' }));
            for (let y = box.y + 4; y < box.y + box.height - 2; y += 6) {
                svg.appendChild(node('rect', { x: box.x, y, width: box.width, height: 2, fill: '#c9c9c9', opacity: 0.7 }));
            }
        },
        dots: (svg, box, add) => {
            add(node('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: 3, fill: '#222', class: 'capo-marker' }));
            for (let y = box.y + 5; y < box.y + box.height - 3; y += 8) {
                [-2.5, 2.5].forEach(dx => svg.appendChild(node('circle', { cx: cx(box) + dx, cy: y, r: 1.2, fill: '#ddd' })));
            }
        }
    };

    const IDS = ['bar', 'thin', 'double', 'chrome', 'gold', 'wood', 'rubber', 'clamp', 'pill', 'notched', 'shadow', 'blue', 'red', 'striped', 'dots'];

    /**
     * Draw the capo for a given style into svg. Unknown styles fall back to the plain bar.
     * box: { x, y, width, height } in user units.
     */
    function render(svg, styleId, box) {
        const draw = STYLES[styleId] || STYLES.bar;
        draw(svg, box, element => svg.appendChild(element));
    }

    window.FretboardCapoStyles = { ids: IDS, render };
})();
