/**
 * UI Bottom Controls Extension for App
 */
if (typeof App !== 'undefined') {
    // removed static HTML string template -> moved to app-ui-bottom-controls.js, app-ui-bottom-instrument.js, app-ui-bottom-appearance.js, app-ui-bottom-export.js

    App.prototype.injectBottomControls = function() {
        let controlsHtml = '';

        // Inject Export footer first so export actions appear at the top of the bottom area
        if (typeof this.getExportFooterHtml === 'function') controlsHtml += this.getExportFooterHtml();

        // Then inject primary controls and other bottom sections
        if (typeof this.getBottomControlsHtml === 'function') controlsHtml += this.getBottomControlsHtml();
        if (typeof this.getInstrumentFooterHtml === 'function') controlsHtml += this.getInstrumentFooterHtml();
        if (typeof this.getAppearanceFooterHtml === 'function') controlsHtml += this.getAppearanceFooterHtml();
        controlsHtml += '<footer id="new-ui-footer" class="bottom-footer" style="display: none;"></footer>';

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', 
                '<section id="fretboard-controls-dock" class="fretboard-controls-dock" aria-label="Fretboard controls" style="display:none;">' +
                    '<div class="fretboard-controls-heading"><div><p>WORKSPACE CONTROLS</p><h2>Shape your view</h2></div><span>Adjust the board, instrument, and output.</span></div>' +
                    '<div class="fretboard-control-tabs" role="tablist" aria-label="Control categories">' +
                        '<button id="fretboard-tab-board" type="button" role="tab" aria-selected="true" aria-controls="controls-bottom" tabindex="0">Board &amp; Playback</button>' +
                        '<button id="fretboard-tab-instrument" type="button" role="tab" aria-selected="false" aria-controls="instrument-footer" tabindex="-1">Instrument</button>' +
                        '<button id="fretboard-tab-appearance" type="button" role="tab" aria-selected="false" aria-controls="appearance-footer" tabindex="-1">Appearance</button>' +
                        '<button id="fretboard-tab-export" type="button" role="tab" aria-selected="false" aria-controls="export-footer" tabindex="-1">Export</button>' +
                        '<button id="fretboard-tab-new-ui" type="button" role="tab" aria-selected="false" aria-controls="new-ui-footer" tabindex="-1">New UI</button>' +
                    '</div>' + controlsHtml +
                '</section>'
            );

            this.organizeBoardControls();

            const panels = [
                ['controls-bottom', 'fretboard-tab-board'],
                ['instrument-footer', 'fretboard-tab-instrument'],
                ['appearance-footer', 'fretboard-tab-appearance'],
                ['export-footer', 'fretboard-tab-export'],
                ['new-ui-footer', 'fretboard-tab-new-ui']
            ].map(([panelId, tabId]) => {
                const panel = document.getElementById(panelId);
                const tab = document.getElementById(tabId);
                if (!panel || !tab) return null;
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tabId);
                panel.setAttribute('tabindex', '0');
                panel.dataset.controlPanel = '';
                return { panel, tab };
            }).filter(Boolean);
            const dock = document.getElementById('fretboard-controls-dock');
            const tabs = panels.map(item => item.tab);
            function activateControlTab(index) {
                panels.forEach((item, i) => {
                    const active = i === index;
                    item.tab.setAttribute('aria-selected', String(active));
                    item.tab.tabIndex = active ? 0 : -1;
                    item.panel.classList.toggle('is-active', active);
                    item.panel.style.display = active && dock.style.display !== 'none' ? '' : 'none';
                });
            }
            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => activateControlTab(index));
                tab.addEventListener('keydown', event => {
                    let next = index;
                    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                    else if (event.key === 'Home') next = 0;
                    else if (event.key === 'End') next = tabs.length - 1;
                    else return;
                    event.preventDefault();
                    activateControlTab(next);
                    tabs[next].focus();
                });
            });
            activateControlTab(0);
        }
    };
}