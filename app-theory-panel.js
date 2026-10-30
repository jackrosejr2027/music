/**
 * Theory Panel Display Extension for App
 */

if (typeof App !== 'undefined') {
    App.prototype.addScaleDescription = function(container, patternType, patternId, key) {
        const hideAboutCheckbox = document.getElementById('hide-about-section');
        if (hideAboutCheckbox && hideAboutCheckbox.checked) return;
        
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'scale-description';
        descriptionContainer.style.marginTop = '15px';
        descriptionContainer.style.padding = '10px';
        descriptionContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
        descriptionContainer.style.borderRadius = '5px';
        
        let title = '';
        let description = '';
        
        if (patternType === 'scale') {
            title = `About the ${key} ${this.musicTheory.scales[patternId].name} Scale`;
            description = this.musicTheory.getScaleDescription(patternId);
        } else if (patternType === 'chord') {
            title = `About the ${key} ${this.musicTheory.chords[patternId].name} Chord`;
            description = this.musicTheory.getChordDescription(patternId);
        } else if (patternType === 'interval') {
            const secondNote = this.musicTheory.getNoteFromInterval(key, patternId);
            title = `About the ${key} to ${secondNote} ${this.musicTheory.intervals[patternId].name} Interval`;
            description = `Quality: ${this.musicTheory.getIntervalQuality(patternId)}, Consonance: ${this.musicTheory.getIntervalConsonance(patternId)}`;
        }
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.marginTop = '0';
        
        const descriptionElement = document.createElement('p');
        descriptionElement.innerHTML = `<strong>What it is:</strong> ${description}`;
        
        descriptionContainer.appendChild(titleElement);
        descriptionContainer.appendChild(descriptionElement);
        container.appendChild(descriptionContainer);
    };

    App.prototype.addInfoItem = function(container, label, value, fullWidth = false) {
        const div = document.createElement('div');
        div.className = 'theory-info-item';
        if (fullWidth) div.style.gridColumn = '1 / -1';
        
        const labelSpan = document.createElement('div');
        labelSpan.className = 'theory-info-label';
        labelSpan.textContent = label + ':';
        
        const valueSpan = document.createElement('div');
        valueSpan.textContent = value;
        
        div.appendChild(labelSpan);
        div.appendChild(valueSpan);
        container.appendChild(div);
    };
}