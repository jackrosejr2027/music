/**
 * Slideshow Extension for App
 */

App.prototype.addToSlideshow = function() {
    // Create a clone of the fretboard container
    const clone = this.fretboard.container.cloneNode(true);
    // v1.0 fix: the cloned container duplicated the #fretboard id
    clone.removeAttribute('id');
    
    // Get current info for naming
    const info = this.fretboard.getCurrentInfo();
    
    // Create a slideshow item object
    const item = {
        element: clone,
        info: info,
        filename: `${info.tuning}-${info.key}-${info.patternType}-${info.pattern}.jpg`
    };
    
    this.slideshowItems.push(item);
    this.updateSlideshowDisplay();
};

App.prototype.updateSlideshowDisplay = function() {
    const container = document.getElementById('slideshow-items');
    if (!container) return;
    container.innerHTML = '';
    
    this.slideshowItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'slideshow-item';
        
        // Add a thumbnail of the fretboard
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        // Support items created dynamically without a full DOM clone
        if (item.element && item.element.innerHTML) {
            thumb.innerHTML = item.element.innerHTML;
        } else {
            thumb.innerHTML = `<div style="background:var(--secondary-color); color:white; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px;">CYCLE</div>`;
        }
        itemDiv.appendChild(thumb);
        
        // Add the info
        const info = document.createElement('div');
        info.className = 'item-info';
        info.textContent = `${item.info.key} ${item.info.patternType} ${item.info.pattern}`;
        itemDiv.appendChild(info);
        
        // Add a delete button
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-item';
        deleteBtn.setAttribute('role', 'button');
        deleteBtn.setAttribute('title', 'Remove from slideshow');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            this.slideshowItems.splice(index, 1);
            this.updateSlideshowDisplay();
        });
        itemDiv.appendChild(deleteBtn);
        
        container.appendChild(itemDiv);
    });
};

/**
 * v1.0 fix: clearSlideshow() was referenced by the Clear button but never defined.
 */
App.prototype.clearSlideshow = function() {
    if (!this.slideshowItems || this.slideshowItems.length === 0) return;
    if (!confirm('Remove all ' + this.slideshowItems.length + ' slideshow items?')) return;
    if (this.isPlayingSlideshow) {
        this.stopSlideshow = true;
        this.isPlayingSlideshow = false;
    }
    this.slideshowItems = [];
    this.updateSlideshowDisplay();
};

// removed App.prototype.playSlideshow() {} -> moved to slideshow-player.js
// removed App.prototype.downloadSlideshowTemplate() {} -> moved to slideshow-csv.js
// removed App.prototype.exportSlideshowCSV() {} -> moved to slideshow-csv.js
// removed App.prototype.importSlideshowFromCSV() {} -> moved to slideshow-csv.js
// removed App.prototype.playPatternTypeCycle() {} -> moved to slideshow-cycle.js