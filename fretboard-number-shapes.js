/**
 * Fret-number background shapes beyond the built-in pill, circle and square.
 * Each shape is defined in a 100 x 100 unit box centred on (50, 50) and scaled so the
 * fret-number text box fits inside it. Outline-only shapes are not filled.
 */
(function () {
    'use strict';
    const NS = 'http://www.w3.org/2000/svg';
    const TAU = Math.PI * 2;
    const UP = -Math.PI / 2;

    const fmt = value => Number(value).toFixed(2);

    function node(tag, attrs) {
        const element = document.createElementNS(NS, tag);
        Object.keys(attrs).forEach(key => element.setAttribute(key, String(attrs[key])));
        return element;
    }

    // Scale factors (multiples of the text half-diagonal, i.e. the shape diameter / (2 * half-diagonal)).
    // A regular polygon with n sides fits a box when its circumradius is at least halfDiagonal / cos(pi / n).
    const polygonFit = sides => 1.05 / Math.cos(Math.PI / sides);
    const starFit = (tips, inner) => 1.05 / (Math.cos(Math.PI / tips) * inner);

    function polygonPoints(sides, rotation = UP) {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = rotation + (TAU * i) / sides;
            points.push(fmt(50 + 50 * Math.cos(angle)) + ',' + fmt(50 + 50 * Math.sin(angle)));
        }
        return points.join(' ');
    }

    function starPoints(tips, inner, rotation = UP) {
        const points = [];
        for (let i = 0; i < tips * 2; i++) {
            const radius = i % 2 ? 50 * inner : 50;
            const angle = rotation + (Math.PI * i) / tips;
            points.push(fmt(50 + radius * Math.cos(angle)) + ',' + fmt(50 + radius * Math.sin(angle)));
        }
        return points.join(' ');
    }

    function wavyPoints(waves, depth, base) {
        const points = [];
        const steps = 120;
        for (let i = 0; i < steps; i++) {
            const angle = (TAU * i) / steps;
            const radius = base + depth * Math.cos(waves * angle);
            points.push(fmt(50 + radius * Math.cos(angle)) + ',' + fmt(50 + radius * Math.sin(angle)));
        }
        return points.join(' ');
    }

    const polygon = (sides, rotation) => paint => [node('polygon', { points: polygonPoints(sides, rotation), ...paint })];
    const star = (tips, inner) => paint => [node('polygon', { points: starPoints(tips, inner), ...paint })];
    const path = d => paint => [node('path', { d, ...paint })];

    const SHAPES = [
        { id: 'triangle', k: polygonFit(3), draw: polygon(3) },
        { id: 'triangle-down', k: polygonFit(3), draw: polygon(3, Math.PI / 2) },
        { id: 'diamond', k: polygonFit(4), draw: polygon(4) },
        { id: 'pentagon', k: polygonFit(5), draw: polygon(5) },
        { id: 'hexagon', k: polygonFit(6), draw: polygon(6) },
        { id: 'octagon', k: polygonFit(8), draw: polygon(8) },
        { id: 'star-5', k: starFit(5, 0.5), draw: star(5, 0.5) },
        { id: 'star-6', k: starFit(6, 0.6), draw: star(6, 0.6) },
        { id: 'burst', k: starFit(16, 0.72), draw: star(16, 0.72) },
        { id: 'sun', k: starFit(12, 0.82), draw: star(12, 0.82) },
        {
            id: 'heart', k: 1.9,
            draw: path('M50 88 C15 62 0 45 0 28 C0 10 14 0 28 0 C40 0 48 8 50 16 C52 8 60 0 72 0 C86 0 100 10 100 28 C100 45 85 62 50 88 Z')
        },
        { id: 'leaf', k: 1.5, draw: path('M50 0 C90 25 90 75 50 100 C10 75 10 25 50 0 Z') },
        {
            id: 'teardrop', k: 1.5,
            draw: path('M50 0 C60 25 100 45 100 70 C100 88 77 100 50 100 C23 100 0 88 0 70 C0 45 40 25 50 0 Z')
        },
        { id: 'ellipse', k: 1.3, draw: paint => [node('ellipse', { cx: 50, cy: 50, rx: 50, ry: 36, ...paint })] },
        { id: 'rounded-square', k: 1.1, draw: paint => [node('rect', { x: 0, y: 0, width: 100, height: 100, rx: 22, ...paint })] },
        { id: 'ring', k: 1.1, outline: true, draw: paint => [node('circle', { cx: 50, cy: 50, r: 48, ...paint })] },
        {
            id: 'double-ring', k: 1.2, outline: true,
            draw: paint => [node('circle', { cx: 50, cy: 50, r: 49, ...paint }), node('circle', { cx: 50, cy: 50, r: 40, ...paint })]
        },
        {
            id: 'dashed-ring', k: 1.1, outline: true,
            draw: paint => [node('circle', { cx: 50, cy: 50, r: 48, 'stroke-dasharray': '4 3', ...paint })]
        },
        {
            id: 'plus', k: 1.8,
            draw: path('M25 0 H75 V25 H100 V75 H75 V100 H25 V75 H0 V25 H25 Z')
        },
        { id: 'shield', k: 1.5, draw: path('M50 0 L100 14 V50 C100 75 75 92 50 100 C25 92 0 75 0 50 V14 Z') },
        { id: 'tag', k: 1.6, draw: path('M14 0 H100 V100 H14 L0 50 Z') },
        { id: 'scallop', k: 1.35, draw: paint => [node('polygon', { points: wavyPoints(12, 5, 44), ...paint })] },
        {
            id: 'corners', k: 2.4, outline: true,
            draw: path('M0 25 V0 H25 M75 0 H100 V25 M100 75 V100 H75 M25 100 H0 V75')
        },
        {
            id: 'ticket', k: 1.9,
            draw: path('M0 0 H100 V35 A15 15 0 0 0 100 65 V100 H0 V65 A15 15 0 0 0 0 35 Z')
        },
        {
            id: 'cloud', k: 2.0,
            draw: path('M25 80 A20 20 0 0 1 22 40 A26 26 0 0 1 60 22 A24 24 0 0 1 96 46 A18 18 0 0 1 82 80 Z')
        }
    ];

    const byId = new Map(SHAPES.map(shape => [shape.id, shape]));

    /**
     * Draw a shape behind a fret number.
     * box: { cx, cy, halfWidth, halfHeight, fill, stroke } in SVG user units.
     */
    function render(svg, id, box) {
        const shape = byId.get(id);
        if (!shape || !svg) return null;
        const halfDiagonal = Math.hypot(box.halfWidth, box.halfHeight);
        const size = 2 * halfDiagonal * shape.k;
        const group = node('g', {
            class: 'fret-number-shape',
            'data-shape': id,
            transform: 'translate(' + fmt(box.cx - size / 2) + ' ' + fmt(box.cy - size / 2) + ') scale(' + fmt(size / 100) + ')'
        });
        const paint = {
            fill: shape.outline ? 'none' : box.fill,
            stroke: box.stroke,
            'stroke-width': shape.outline ? 1.5 : 1,
            'stroke-linejoin': 'round',
            'vector-effect': 'non-scaling-stroke'
        };
        shape.draw(paint).forEach(element => group.appendChild(element));
        svg.appendChild(group);
        return group;
    }

    window.FretNumberShapes = {
        ids: SHAPES.map(shape => shape.id),
        has: id => byId.has(id),
        render
    };
})();
