/**
 * Instrument Setup Refactored
 * Original methods moved to app-instrument-ui.js, app-instrument-tuning.js, and app-instrument-fretspan.js
 */
if (typeof App !== 'undefined') {
    // removed App.prototype.updateTuningInputs = function(tuning = null) {}
    // removed App.prototype.addInstrumentDropdowns = function() {}
    // removed App.prototype.applyTuningPreset = function(instrumentId, tuningId) {}
    // removed App.prototype.applyFretspanPreset = function(presetId) {}
    // removed App.prototype.flipStringOrder = function() {}
}