/**
 * Application Entry Point
 * Instantiates the App after DOM and all extensions are ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Ensure missing enharmonic equivalents are mapped in THEMES_DATA
    if (typeof THEMES_DATA !== 'undefined') {
        Object.keys(THEMES_DATA).forEach(themeName => {
            const theme = THEMES_DATA[themeName];
            if (theme && theme.intervals) {
                if (theme.intervals['#5'] && !theme.intervals['b6']) theme.intervals['b6'] = theme.intervals['#5'];
                if (theme.intervals['b6'] && !theme.intervals['#5']) theme.intervals['#5'] = theme.intervals['b6'];
                
                if (theme.intervals['b5'] && !theme.intervals['#4']) theme.intervals['#4'] = theme.intervals['b5'];
                if (theme.intervals['#4'] && !theme.intervals['b5']) theme.intervals['b5'] = theme.intervals['#4'];
                
                if (theme.intervals['b3'] && !theme.intervals['#2']) theme.intervals['#2'] = theme.intervals['b3'];
                if (theme.intervals['#2'] && !theme.intervals['b3']) theme.intervals['b3'] = theme.intervals['#2'];
                
                if (theme.intervals['b2'] && !theme.intervals['#1']) theme.intervals['#1'] = theme.intervals['b2'];
                if (theme.intervals['#1'] && !theme.intervals['b2']) theme.intervals['b2'] = theme.intervals['#1'];
            }
        });
    }

    // Ensure sidebar and other dynamic UI components are registered first
    // by being loaded before this script in index.html
    // Share one title choice across nested exporters and every file in a batch.
    for (const target of [Exporter, App.prototype, Fretboard.prototype]) {
        for (const name of Object.getOwnPropertyNames(target)) {
            if (!/^export/.test(name) || /Midi|CSV|InfoPages/i.test(name) || typeof target[name] !== 'function') continue;
            const original = target[name];
            target[name] = async function(...args) {
                if (Exporter.includeTitles !== undefined) return original.apply(this, args);
                Exporter.includeTitles = confirm('Include diagram titles in this export?\nOK: include titles. Cancel: export without titles.');
                try { return await original.apply(this, args); }
                finally { delete Exporter.includeTitles; }
            };
        }
    }
    const appInstance = new App();
    // Expose the running app instance for diagnostics and integrations
    try { 
        window.app = appInstance; 
    } catch (e) { 
        console.warn('Could not expose app instance to window.app');
    }
});