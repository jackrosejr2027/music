/**
 * Export and Slideshow Event Listeners
 */
if (typeof App !== 'undefined') {
    App.prototype.setupExportEvents = function() {
        if (typeof this.setupExportEventsBasic === 'function') this.setupExportEventsBasic();
        if (typeof this.setupExportEventsBatch === 'function') this.setupExportEventsBatch();
        if (typeof this.setupExportEventsCustom === 'function') this.setupExportEventsCustom();
        
        // removed basic export events -> moved to app-events-export-basic.js
        // removed batch export events -> moved to app-events-export-batch.js
        // removed custom pattern export events -> moved to app-events-export-custom.js
    };
}