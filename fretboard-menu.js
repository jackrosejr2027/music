class FretboardMenu {
    static showNoteEditMenu(fretboard, markerGroup, marker, text, x, y, currentColor) {
        // Remove any existing menus
        const existingMenu = document.querySelector('.note-edit-menu');
        if (existingMenu) existingMenu.remove();
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'note-edit-menu';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        menu.style.backgroundColor = 'white';
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '5px';
        menu.style.padding = '10px';
        menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        // Get SVG position and calculate menu position
        const svgRect = fretboard.svg.getBoundingClientRect();
        menu.style.left = (svgRect.left + x) + 'px';
        menu.style.top = (svgRect.top + y + 30) + 'px';
        
        // Add menu title
        const title = document.createElement('div');
        title.textContent = `Edit Note: ${text}`;
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.borderBottom = '1px solid #eee';
        title.style.paddingBottom = '5px';
        menu.appendChild(title);
        
        // Color picker
        const colorLabel = document.createElement('div');
        colorLabel.textContent = 'Color:';
        colorLabel.style.marginBottom = '5px';
        menu.appendChild(colorLabel);
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = currentColor;
        colorPicker.style.width = '100%';
        colorPicker.style.marginBottom = '10px';
        menu.appendChild(colorPicker);
        
        // Shape selector
        const shapeLabel = document.createElement('div');
        shapeLabel.textContent = 'Shape:';
        shapeLabel.style.marginBottom = '5px';
        menu.appendChild(shapeLabel);
        
        const shapeSelect = document.createElement('select');
        shapeSelect.style.width = '100%';
        shapeSelect.style.marginBottom = '10px';
        
        fretboard.musicTheory.noteStyles.shapes.forEach(shape => {
            const option = document.createElement('option');
            option.value = shape;
            option.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
            if (shape === fretboard.settings.noteShape) {
                option.selected = true;
            }
            shapeSelect.appendChild(option);
        });
        menu.appendChild(shapeSelect);
        
        // Effect selector
        const effectLabel = document.createElement('div');
        effectLabel.textContent = 'Effect:';
        effectLabel.style.marginBottom = '5px';
        menu.appendChild(effectLabel);
        
        const effectSelect = document.createElement('select');
        effectSelect.style.width = '100%';
        effectSelect.style.marginBottom = '10px';
        
        fretboard.musicTheory.noteStyles.effects.forEach(effect => {
            const option = document.createElement('option');
            option.value = effect;
            option.textContent = effect.charAt(0).toUpperCase() + effect.slice(1);
            if (effect === fretboard.settings.noteEffect) {
                option.selected = true;
            }
            effectSelect.appendChild(option);
        });
        menu.appendChild(effectSelect);
        
        // Set as Root button
        const setAsRootBtn = document.createElement('button');
        setAsRootBtn.textContent = 'Set as Root';
        setAsRootBtn.style.width = '100%';
        setAsRootBtn.style.padding = '8px';
        setAsRootBtn.style.backgroundColor = '#27ae60';
        setAsRootBtn.style.color = 'white';
        setAsRootBtn.style.border = 'none';
        setAsRootBtn.style.borderRadius = '4px';
        setAsRootBtn.style.marginBottom = '10px';
        setAsRootBtn.style.cursor = 'pointer';
        setAsRootBtn.addEventListener('click', () => {
            // Get the actual note from displayed text
            let newRoot = text;
            
            if (fretboard.settings.displayMode === 'intervals') {
                if (text === '1' || text === 'R') {
                    newRoot = fretboard.currentKey;
                } else {
                    for (const note of fretboard.activeNotes) {
                        const interval = fretboard.musicTheory.getInterval(fretboard.currentKey, note);
                        if (interval && fretboard.musicTheory.intervals[interval] && 
                            fretboard.musicTheory.intervals[interval].shortName === text) {
                            newRoot = note;
                            break;
                        }
                    }
                }
            }
            
            if (newRoot && fretboard.musicTheory.toSharp) newRoot = fretboard.musicTheory.toSharp(newRoot);
            // Only proceed if we found a valid note
            if (newRoot && fretboard.musicTheory.notes.includes(newRoot)) {
                // Set the new key in the key selector
                const keySelect = document.getElementById('key-select');
                if (keySelect) {
                    keySelect.value = newRoot;
                    const event = new Event('change');
                    keySelect.dispatchEvent(event);
                }
                
                fretboard.currentKey = newRoot;
                fretboard.draw();
            }
            
            menu.remove();
            fretboard.clearSelectedMarkers();
        });
        menu.appendChild(setAsRootBtn);
        
        // Action buttons
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.justifyContent = 'space-between';
        buttonsDiv.style.marginTop = '10px';
        
        // Apply button
        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply';
        applyBtn.style.padding = '5px 10px';
        applyBtn.style.backgroundColor = '#3498db';
        applyBtn.style.color = 'white';
        applyBtn.style.border = 'none';
        applyBtn.style.borderRadius = '3px';
        applyBtn.style.cursor = 'pointer';
        applyBtn.addEventListener('click', () => {
            // Apply color change
            marker.setAttribute('fill', colorPicker.value);
            
            // Apply shape or effect change
            if (shapeSelect.value !== fretboard.settings.noteShape || 
                effectSelect.value !== fretboard.settings.noteEffect) {
                const tempSettings = {...fretboard.settings, 
                    noteShape: shapeSelect.value, 
                    noteEffect: effectSelect.value
                };
                fretboard.settings = tempSettings;
                // Redraw this specific note
                markerGroup.innerHTML = '';
                fretboard.drawNoteMarker(x, y, colorPicker.value, text);
            }
            
            menu.remove();
            fretboard.clearSelectedMarkers();
        });
        buttonsDiv.appendChild(applyBtn);
        
        // Remove note button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Note';
        removeBtn.style.padding = '5px 10px';
        removeBtn.style.backgroundColor = '#e74c3c';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '3px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.addEventListener('click', () => {
            const noteToRemove = text;
            fretboard.activeNotes = fretboard.activeNotes.filter(note => {
                if (fretboard.settings.displayMode === 'intervals') {
                    const interval = fretboard.musicTheory.getInterval(fretboard.currentKey, note);
                    return (interval && fretboard.musicTheory.intervals[interval]) ? fretboard.musicTheory.intervals[interval].shortName !== noteToRemove : true;
                }
                const ts = fretboard.musicTheory.toSharp ? (n) => fretboard.musicTheory.toSharp(n) : (n) => n;
                return ts(note) !== ts(noteToRemove);
            });
            
            markerGroup.remove();
            menu.remove();
            fretboard.clearSelectedMarkers();
        });
        buttonsDiv.appendChild(removeBtn);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cancel';
        closeBtn.style.padding = '5px 10px';
        closeBtn.style.backgroundColor = '#95a5a6';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '3px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            menu.remove();
            fretboard.clearSelectedMarkers();
        });
        buttonsDiv.appendChild(closeBtn);
        
        menu.appendChild(buttonsDiv);
        
        // Add menu to document
        document.body.appendChild(menu);
        
        // Adjust position if it goes off-screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = Math.max(10, window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = Math.max(10, window.innerHeight - rect.height - 10) + 'px';
        }
        
        // Click outside to close
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && 
                !marker.contains(e.target) && !markerGroup.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        }, { once: true });
    }

    // removed showMultiNoteEditMenu() {} -> moved to fretboard-menu-multi.js
}