/**
 * Main Event Listeners Orchestrator
 */
if (typeof App !== 'undefined') {
    App.prototype.setupEventListeners = function() {
        // removed core event listeners -> moved to app-events-core.js
        if (typeof this.setupCoreEvents === 'function') this.setupCoreEvents();
        
        // removed playback event listeners -> moved to app-events-playback.js
        if (typeof this.setupPlaybackEvents === 'function') this.setupPlaybackEvents();
        
        // removed export event listeners -> moved to app-events-export.js
        if (typeof this.setupExportEvents === 'function') this.setupExportEvents();
    };
}