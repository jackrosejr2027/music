class FretboardEffects {
    static applyEffect(effectType, marker, markerGroup, x, y, size, fillValue, fretboard) {
        switch (effectType) {
            case 'glow':
                const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                const filterId = `glow-${Math.random().toString(36).substring(2, 9)}`;
                glowFilter.setAttribute('id', filterId);
                
                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                blur.setAttribute('stdDeviation', '2.5');
                blur.setAttribute('result', 'coloredBlur');
                
                const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                const merge1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                merge1.setAttribute('in', 'coloredBlur');
                
                const merge2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                merge2.setAttribute('in', 'SourceGraphic');
                
                merge.appendChild(merge1);
                merge.appendChild(merge2);
                glowFilter.appendChild(blur);
                glowFilter.appendChild(merge);
                
                const defs = fretboard.svg.querySelector('defs') || 
                             fretboard.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), fretboard.svg.firstChild);
                defs.appendChild(glowFilter);
                
                marker.setAttribute('filter', `url(#${filterId})`);
                break;
                
            case 'shadow':
                const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                const shadowId = `shadow-${Math.random().toString(36).substring(2, 9)}`;
                shadowFilter.setAttribute('id', shadowId);
                
                const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
                feOffset.setAttribute('dx', '2');
                feOffset.setAttribute('dy', '2');
                feOffset.setAttribute('result', 'offset');
                
                const feBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                feBlur.setAttribute('in', 'offset');
                feBlur.setAttribute('stdDeviation', '2');
                feBlur.setAttribute('result', 'blur');
                
                const feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
                feBlend.setAttribute('in', 'SourceGraphic');
                feBlend.setAttribute('in2', 'blur');
                feBlend.setAttribute('mode', 'normal');
                
                shadowFilter.appendChild(feOffset);
                shadowFilter.appendChild(feBlur);
                shadowFilter.appendChild(feBlend);
                
                const shadowDefs = fretboard.svg.querySelector('defs') || 
                                  fretboard.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), fretboard.svg.firstChild);
                shadowDefs.appendChild(shadowFilter);
                
                marker.setAttribute('filter', `url(#${shadowId})`);
                break;
                
            case 'outline':
                marker.setAttribute('stroke', '#fff');
                marker.setAttribute('stroke-width', 3);
                break;
                
            case 'highlight':
                const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                highlight.setAttribute('cx', x);
                highlight.setAttribute('cy', y);
                highlight.setAttribute('r', size + 4);
                highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
                highlight.setAttribute('stroke', 'none');
                markerGroup.appendChild(highlight);
                break;
                
            case 'pulsate':
                const pulsateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                pulsateAnim.setAttribute('attributeName', 'r');
                pulsateAnim.setAttribute('values', `${size};${size * 1.2};${size}`);
                pulsateAnim.setAttribute('dur', '2s');
                pulsateAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(pulsateAnim);
                break;
                
            case 'blink':
                const blinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                blinkAnim.setAttribute('attributeName', 'opacity');
                blinkAnim.setAttribute('values', '1;0.3;1');
                blinkAnim.setAttribute('dur', '1.5s');
                blinkAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(blinkAnim);
                break;
                
            case 'wobble':
                const wobbleAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                wobbleAnim.setAttribute('attributeName', 'transform');
                wobbleAnim.setAttribute('type', 'translate');
                wobbleAnim.setAttribute('values', '0,0;2,0;-2,0;0,0');
                wobbleAnim.setAttribute('dur', '0.5s');
                wobbleAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(wobbleAnim);
                break;
                
            case 'rotate':
                const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                rotateAnim.setAttribute('attributeName', 'transform');
                rotateAnim.setAttribute('type', 'rotate');
                rotateAnim.setAttribute('from', `0 ${x} ${y}`);
                rotateAnim.setAttribute('to', `360 ${x} ${y}`);
                rotateAnim.setAttribute('dur', '3s');
                rotateAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(rotateAnim);
                break;
                
            case 'bounce':
                const bounceAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                bounceAnim.setAttribute('attributeName', 'cy');
                bounceAnim.setAttribute('values', `${y};${y - 5};${y}`);
                bounceAnim.setAttribute('dur', '0.7s');
                bounceAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(bounceAnim);
                break;
                
            case 'flip':
                const flipAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                flipAnim.setAttribute('attributeName', 'transform');
                flipAnim.setAttribute('type', 'scale');
                flipAnim.setAttribute('values', '1,1;1,-1;1,1');
                flipAnim.setAttribute('dur', '2s');
                flipAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(flipAnim);
                break;
                
            case 'shake':
                const shakeAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                shakeAnim.setAttribute('attributeName', 'transform');
                shakeAnim.setAttribute('type', 'translate');
                shakeAnim.setAttribute('values', '0,0;1,0;-1,0;0.5,0;-0.5,0;0,0');
                shakeAnim.setAttribute('dur', '0.4s');
                shakeAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(shakeAnim);
                break;
                
            case 'jelly':
                const jellyAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                jellyAnim.setAttribute('attributeName', 'transform');
                jellyAnim.setAttribute('type', 'scale');
                jellyAnim.setAttribute('values', '1,1;1.2,0.8;0.8,1.2;1,1');
                jellyAnim.setAttribute('dur', '1.5s');
                jellyAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(jellyAnim);
                break;
                
            case 'fade':
                const fadeAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                fadeAnim.setAttribute('attributeName', 'opacity');
                fadeAnim.setAttribute('values', '1;0.4;1');
                fadeAnim.setAttribute('dur', '3s');
                fadeAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(fadeAnim);
                break;
                
            case 'grow':
                const growAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                growAnim.setAttribute('attributeName', 'r');
                growAnim.setAttribute('values', `${size};${size * 1.5};${size}`);
                growAnim.setAttribute('dur', '3s');
                growAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(growAnim);
                break;
                
            case 'shrink':
                const shrinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                shrinkAnim.setAttribute('attributeName', 'r');
                shrinkAnim.setAttribute('values', `${size};${size * 0.7};${size}`);
                shrinkAnim.setAttribute('dur', '3s');
                shrinkAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(shrinkAnim);
                break;
                
            case 'blur':
                const blurFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                const blurId = `blur-${Math.random().toString(36).substring(2, 9)}`;
                blurFilter.setAttribute('id', blurId);
                
                const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                feGaussianBlur.setAttribute('stdDeviation', '1');
                
                blurFilter.appendChild(feGaussianBlur);
                
                const blurDefs = fretboard.svg.querySelector('defs') || 
                               fretboard.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), fretboard.svg.firstChild);
                blurDefs.appendChild(blurFilter);
                
                marker.setAttribute('filter', `url(#${blurId})`);
                break;
                
            case 'vibrate':
                const vibrateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                vibrateAnim.setAttribute('attributeName', 'transform');
                vibrateAnim.setAttribute('type', 'translate');
                vibrateAnim.setAttribute('values', '0,0;1,0;-1,0;0.5,0;-0.5,0;0,0');
                vibrateAnim.setAttribute('dur', '0.2s');
                vibrateAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(vibrateAnim);
                break;
                
            case 'sparkle':
                for (let i = 0; i < 4; i++) {
                    const angle = i * Math.PI / 2;
                    const sparkle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    sparkle.setAttribute('cx', x + Math.cos(angle) * (size + 3));
                    sparkle.setAttribute('cy', y + Math.sin(angle) * (size + 3));
                    sparkle.setAttribute('r', 2);
                    sparkle.setAttribute('fill', 'white');
                    
                    const sparkleAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    sparkleAnim.setAttribute('attributeName', 'opacity');
                    sparkleAnim.setAttribute('values', '0;1;0');
                    sparkleAnim.setAttribute('dur', '1.5s');
                    sparkleAnim.setAttribute('repeatCount', 'indefinite');
                    sparkleAnim.setAttribute('begin', `${i * 0.2}s`);
                    
                    sparkle.appendChild(sparkleAnim);
                    markerGroup.appendChild(sparkle);
                }
                break;
            
            case 'shatter':
                marker.setAttribute('class', 'note-marker effect-shatter');
                break;
                
            case 'glitch':
                marker.setAttribute('class', 'note-marker effect-glitch');
                break;
                
            case 'rainbow':
                const rainbowId = `rainbow-${Math.random().toString(36).substring(2, 9)}`;
                const rainbowGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                rainbowGrad.setAttribute('id', rainbowId);
                
                const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'];
                rainbowColors.forEach((color, i) => {
                    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop.setAttribute('offset', `${i * 100 / (rainbowColors.length - 1)}%`);
                    stop.setAttribute('stop-color', color);
                    rainbowGrad.appendChild(stop);
                });
                
                const rainbowDefs = fretboard.svg.querySelector('defs') || 
                                  fretboard.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), fretboard.svg.firstChild);
                rainbowDefs.appendChild(rainbowGrad);
                
                marker.setAttribute('fill', `url(#${rainbowId})`);
                break;
                
            case 'zoom':
                const zoomAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                zoomAnim.setAttribute('attributeName', 'transform');
                zoomAnim.setAttribute('type', 'scale');
                zoomAnim.setAttribute('values', '0.7;1.3;1');
                zoomAnim.setAttribute('dur', '2s');
                zoomAnim.setAttribute('repeatCount', 'indefinite');
                marker.appendChild(zoomAnim);
                break;
                
            case 'twinkle':
            case 'splash':
            case 'heatwave':
            case 'chroma':
            case 'emboss':
            case 'metallic':
            case 'neumorphic':
            case 'holographic':
            case 'retro':
            case 'pixelate':
            case 'sketch':
            case 'paint':
            case 'grime':
            case 'distortion':
            case 'liquefy':
            case 'frosted':
            case 'carved':
            case 'vignette':
            case 'noise':
            case 'sticker':
            case 'psychedelic':
            case 'relief':
            case 'foil':
            case 'brushed':
            case 'glazed':
            case 'watercolor':
            case 'comic':
            case 'bubble':
            case 'gradient-pulse':
                marker.setAttribute('class', `note-marker effect-${effectType}`);
                break;
        }
    }
}