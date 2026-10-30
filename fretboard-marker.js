class FretboardMarker {
    static createShape(shapeType, x, y, size, fillValue, fretboard) {
        let marker;
        switch (shapeType) {
            case 'square':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                marker.setAttribute('x', x - size);
                marker.setAttribute('y', y - size);
                marker.setAttribute('width', size * 2);
                marker.setAttribute('height', size * 2);
                break;
                
            case 'diamond':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', 
                    `${x},${y-size} ${x+size},${y} ${x},${y+size} ${x-size},${y}`);
                break;
                
            case 'triangle':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', 
                    `${x},${y-size} ${x+size},${y+size} ${x-size},${y+size}`);
                break;
                
            case 'hexagon':
                const hexPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 60) * Math.PI / 180;
                    hexPoints.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', hexPoints.join(' '));
                break;
                
            case 'star':
                const starPoints = [];
                for (let i = 0; i < 10; i++) {
                    const angle = (i * 36) * Math.PI / 180;
                    const radius = i % 2 === 0 ? size : size / 2;
                    starPoints.push(`${x + radius * Math.sin(angle)},${y - radius * Math.cos(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', starPoints.join(' '));
                break;
                
            case 'pentagon':
                const pentPoints = [];
                for (let i = 0; i < 5; i++) {
                    const angle = ((i * 72) - 90) * Math.PI / 180;
                    pentPoints.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', pentPoints.join(' '));
                break;
                
            case 'octagon':
                const octPoints = [];
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 45) * Math.PI / 180;
                    octPoints.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', octPoints.join(' '));
                break;
                
            case 'parallelogram':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', 
                    `${x-size},${y-size*0.7} ${x+size*1.5},${y-size*0.7} ${x+size},${y+size*0.7} ${x-size*1.5},${y+size*0.7}`);
                break;
                
            case 'trapezoid':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', 
                    `${x-size*1.2},${y+size*0.8} ${x+size*1.2},${y+size*0.8} ${x+size*0.8},${y-size*0.8} ${x-size*0.8},${y-size*0.8}`);
                break;
                
            case 'semicircle':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y} A ${size} ${size} 0 0 1 ${x+size} ${y} L ${x} ${y+size} Z`);
                break;
                
            case 'crescent':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x} ${y-size} A ${size} ${size} 0 0 1 ${x} ${y+size} A ${size*0.6} ${size} 0 0 0 ${x} ${y-size} Z`);
                break;
                
            case 'ring':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y} A ${size} ${size} 0 1 0 ${x+size} ${y} A ${size} ${size} 0 1 0 ${x-size} ${y} Z 
                                         M ${x-size/2} ${y} A ${size/2} ${size/2} 0 1 0 ${x+size/2} ${y} A ${size/2} ${size/2} 0 1 0 ${x-size/2} ${y} Z`);
                break;
                
            case 'crosshair':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', size);
                circle.setAttribute('fill', fillValue);
                
                const lines = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                lines.setAttribute('d', `M ${x-size} ${y} H ${x+size} M ${x} ${y-size} V ${y+size}`);
                lines.setAttribute('stroke', fretboard.getContrastColor(fillValue));
                lines.setAttribute('stroke-width', size/6);
                
                marker.appendChild(circle);
                marker.appendChild(lines);
                break;
                
            case 'donut':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y} A ${size} ${size} 0 0 1 ${x+size} ${y} A ${size*0.6} ${size} 0 0 0 ${x} ${y-size} Z 
                                         M ${x-size/2} ${y} A ${size/2} ${size/2} 0 1 1 ${x+size/2} ${y} A ${size/2} ${size/2} 0 1 1 ${x-size/2} ${y} Z`);
                break;
                
            case 'clover':
                const cloverPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const r = size * 0.6;
                cloverPath.setAttribute('d', `M ${x} ${y-r} A ${r} ${r} 0 0 1 ${x} ${y+r} A ${r*0.6} ${r} 0 0 0 ${x} ${y-r} Z`);
                return cloverPath;
                
            case 'flower':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const petalSize = size * 0.7;
                marker.setAttribute('d', `M ${x} ${y-size} 
                                         C ${x+petalSize} ${y-petalSize}, ${x+petalSize} ${y-petalSize}, ${x+size} ${y}`);
                break;
                
            case 'shield':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x} ${y+size*1.2} C ${x-size*1.2} ${y+size*0.5}, ${x-size*1.2} ${y-size*0.8}, ${x} ${y-size}
                                         C ${x+size*1.2} ${y-size*0.8}, ${x+size*1.2} ${y+size*0.5}, ${x} ${y+size*1.2} Z`);
                break;
                
            case 'crown':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y-size} L ${x-size*0.5} ${y} L ${x} ${y} L ${x+size*0.5} ${y} L ${x+size} ${y-size} Z`);
                break;
                
            case 'droplet':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x} ${y+size} C ${x+size} ${y}, ${x+size} ${y-size*0.5}, ${x} ${y-size}
                                         C ${x-size} ${y-size*0.5}, ${x-size} ${y}, ${x} ${y+size} Z`);
                break;
                
            case 'cloud':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size*0.2} ${y+size*0.5} 
                                         C ${x-size} ${y+size*0.5}, ${x-size} ${y}, ${x-size*0.5} ${y}
                                         C ${x-size*0.5} ${y-size*0.8}, ${x+size*0.2} ${y-size*0.8}, ${x+size*0.3} ${y-size*0.3}
                                         C ${x+size} ${y-size*0.3}, ${x+size} ${y+size*0.3}, ${x+size*0.3} ${y+size*0.3}
                                         C ${x+size*0.3} ${y+size*0.5}, ${x-size*0.2} ${y+size*0.5}, ${x-size*0.2} ${y+size*0.5} Z`);
                break;
                
            case 'starburst':
                const burstPoints = [];
                for (let i = 0; i < 16; i++) {
                    const angle = (i * 22.5) * Math.PI / 180;
                    const radius = i % 2 === 0 ? size : size * 0.4;
                    burstPoints.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', burstPoints.join(' '));
                break;
                
            case 'gear':
                const gearPoints = [];
                const gearCount = 10;
                for (let i = 0; i < gearCount * 2; i++) {
                    const angle = ((i * 180) / gearCount) * Math.PI / 180;
                    const radius = i % 2 === 0 ? size : size * 0.7;
                    gearPoints.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);
                }
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                marker.setAttribute('points', gearPoints.join(' '));
                break;
                
            case 'cube':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const cubeSize = size * 0.7;
                const cubeD = `M ${x-cubeSize} ${y-cubeSize/2} L ${x+cubeSize} ${y-cubeSize/2} L ${x+cubeSize} ${y+cubeSize} L ${x-cubeSize} ${y+cubeSize} Z 
                                         M ${x+cubeSize} ${y-cubeSize/2} L ${x+cubeSize*1.5} ${y-cubeSize} L ${x+cubeSize*1.5} ${y+cubeSize/2} L ${x+cubeSize} ${y+cubeSize} Z
                                         M ${x-cubeSize} ${y-cubeSize/2} L ${x-cubeSize+cubeSize/2} ${y-cubeSize} L ${x+cubeSize*1.5} ${y-cubeSize} L ${x+cubeSize} ${y-cubeSize/2} Z`;
                marker.setAttribute('d', cubeD);
                break;
                
            case 'moon':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x} ${y-size} A ${size} ${size} 0 0 1 ${x} ${y+size} A ${size*0.6} ${size} 0 0 0 ${x} ${y-size} Z`);
                break;
                
            case 'sun':
                const sunGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const sunCenter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                sunCenter.setAttribute('cx', x);
                sunCenter.setAttribute('cy', y);
                sunCenter.setAttribute('r', size*0.6);
                sunCenter.setAttribute('fill', fillValue);
                
                const rays = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 45) * Math.PI / 180;
                    const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    ray.setAttribute('x1', x + (size*0.7) * Math.cos(angle));
                    ray.setAttribute('y1', y + (size*0.7) * Math.sin(angle));
                    ray.setAttribute('x2', x + size * Math.cos(angle));
                    ray.setAttribute('y2', y + size * Math.sin(angle));
                    ray.setAttribute('stroke', fillValue);
                    ray.setAttribute('stroke-width', size/4);
                    
                    rays.appendChild(ray);
                }
                
                sunGroup.appendChild(rays);
                sunGroup.appendChild(sunCenter);
                return sunGroup;
                
            case 'flag':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y-size} V ${y+size} M ${x-size} ${y-size} L ${x+size} ${y} L ${x-size} ${y} Z`);
                marker.setAttribute('stroke', fillValue);
                marker.setAttribute('stroke-width', size/6);
                marker.setAttribute('fill', fillValue);
                break;
                
            case 'ribbon':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size} ${y-size} H ${x+size*0.7} L ${x+size} ${y} L ${x+size*0.7} ${y+size} H ${x-size} Z 
                                         M ${x-size*0.4} ${y} A ${size*0.3} ${size*0.3} 0 1 0 ${x-size*0.4} ${y+size*0.01} Z`);
                break;
                
            case 'bookmark':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size*0.7} ${y-size} H ${x+size*0.7} V ${y+size} L ${x} ${y+size*0.5} L ${x-size*0.7} ${y+size} Z`);
                break;
                
            case 'lightning':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x} ${y-size} L ${x-size*0.5} ${y} H ${x-size*0.2} L ${x} ${y+size} L ${x+size*0.5} ${y} H ${x+size*0.2} Z`);
                break;
                
            case 'key':
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', `M ${x-size*0.8} ${y} A ${size*0.8} ${size*0.8} 0 1 0 ${x} ${y+size*0.8} L ${x} ${y-size*0.4} H ${x+size*0.3} V ${y-size*0.2} H ${x} L ${x} ${y-size*0.4} V ${y+size*0.8} Z`);
                break;
                
            case 'circle':
            default:
                marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                marker.setAttribute('cx', x);
                marker.setAttribute('cy', y);
                marker.setAttribute('r', size);
                break;
        }
        return marker;
    }
    
    static applyEffect(effectType, marker, markerGroup, x, y, size, fillValue, fretboard) {
        // removed applyEffect logic -> moved to FretboardEffects.applyEffect in fretboard-effects.js
        if (typeof FretboardEffects !== 'undefined') {
            FretboardEffects.applyEffect(effectType, marker, markerGroup, x, y, size, fillValue, fretboard);
        }
    }
}