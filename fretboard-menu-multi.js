/**
 * Multi-Note Menu Extension
 * Handles context menu for multiple selected notes
 */

FretboardMenu.showMultiNoteEditMenu = function(fretboard, markerGroups, x, y) {
    const existingMenu = document.querySelector('.note-edit-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'note-edit-menu';
    menu.style.position = 'absolute';
    menu.style.zIndex = '1000';
    menu.style.backgroundColor = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '5px';
    menu.style.padding = '10px';
    menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    const svgRect = fretboard.svg.getBoundingClientRect();
    menu.style.left = (svgRect.left + x) + 'px';
    menu.style.top = (svgRect.top + y + 30) + 'px';
    
    const title = document.createElement('div');
    title.textContent = `Edit ${markerGroups.length} Selected Notes`;
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    menu.appendChild(title);
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#3498db';
    colorPicker.style.width = '100%';
    colorPicker.style.marginBottom = '10px';
    menu.appendChild(colorPicker);
    
    const shapeSelect = document.createElement('select');
    shapeSelect.style.width = '100%';
    shapeSelect.style.marginBottom = '10px';
    fretboard.musicTheory.noteStyles.shapes.forEach(shape => {
        const option = document.createElement('option');
        option.value = shape;
        option.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
        if (shape === fretboard.settings.noteShape) option.selected = true;
        shapeSelect.appendChild(option);
    });
    menu.appendChild(shapeSelect);
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply to All';
    applyBtn.style.padding = '5px 10px';
    applyBtn.style.backgroundColor = '#3498db';
    applyBtn.style.color = 'white';
    applyBtn.style.border = 'none';
    applyBtn.style.borderRadius = '3px';
    applyBtn.style.cursor = 'pointer';
    applyBtn.addEventListener('click', () => {
        markerGroups.forEach(markerGroup => {
            const marker = markerGroup.querySelector('.note-marker');
            const text = marker.getAttribute('data-note');
            const noteX = parseFloat(marker.getAttribute('cx') || marker.getAttribute('x') || 0);
            const noteY = parseFloat(marker.getAttribute('cy') || marker.getAttribute('y') || 0);
            marker.setAttribute('fill', colorPicker.value);
            if (shapeSelect.value !== fretboard.settings.noteShape) {
                markerGroup.innerHTML = '';
                fretboard.drawNoteMarker(noteX, noteY, colorPicker.value, text);
            }
        });
        menu.remove();
        fretboard.clearSelectedMarkers();
    });
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove All';
    removeBtn.style.padding = '5px 10px';
    removeBtn.style.backgroundColor = '#e74c3c';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '3px';
    removeBtn.style.marginLeft = '10px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.addEventListener('click', () => {
        markerGroups.forEach(markerGroup => markerGroup.remove());
        menu.remove();
        fretboard.selectedMarkers = [];
    });
    
    const footer = document.createElement('div');
    footer.style.marginTop = '10px';
    footer.appendChild(applyBtn);
    footer.appendChild(removeBtn);
    menu.appendChild(footer);
    
    document.body.appendChild(menu);
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) menu.remove();
    }, { once: true });
};