/**
 * Dynamic Sidebar Generator for index.html
 */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const sections = [
        {
            heading: 'Show / Hide Elements',
            class: 'show-hide-elements',
            content: `
                <div class="control-group" style="display:flex; align-items:center; gap:8px;">
                    <!-- Moved: Show Fret Numbers & Fret Number Shape to bottom controls -->
                    <div style="font-size:0.9em;color:var(--secondary-color);">Fret number visibility and shape moved to bottom controls.</div>
                </div>
            `
        },

        {
            heading: 'Chromatic Tuner',
            class: 'chromatic-tuner-controls',
            content: `
                <div class="control-group">
                    <!-- Moved: Chromatic tuner toggle to bottom controls -->
                    <div style="font-size:0.9em;color:var(--secondary-color);">Chromatic tuner toggle moved to bottom controls.</div>
                </div>
            `
        },
        {
            heading: 'Slideshow',
            class: 'slideshow-options',
            content: `
                <div class="slideshow-controls">
                    <!-- Moved export and CSV controls to bottom controls area -->
                    <div style="font-size:0.9em;color:var(--secondary-color);">Slideshow export, CSV import/export and filename controls moved to bottom controls.</div>
                    <div id="current-custom-filename" style="font-size: 0.85em; color: var(--secondary-color); text-align: center; margin-bottom: 5px;"></div>
                </div>
            `
        },
        {
            heading: 'Melodic Patterns',
            class: 'melodic-patterns',
            content: `
                <div class="control-group">
                    <div style="font-size:0.9em;color:var(--secondary-color);">Choose a melodic pattern and control playback in the bottom panel.</div>
                </div>
                <div id="custom-pattern-container" style="display: none;">
                    <div class="control-group">
                        <label for="custom-pattern">Custom Pattern:</label>
                        <div style="display:flex;gap:5px;">
                            <input type="text" id="custom-pattern" placeholder="e.g., 1 2 3 5" style="flex:1;">
                            <button id="random-custom-pattern-btn" style="width:auto;padding:0 8px;" title="Randomize">🎲</button>
                        </div>
                    </div>
                </div>
                <script>
                    setTimeout(() => {
                        const randBtn = document.getElementById('random-custom-pattern-btn');
                        const customInput = document.getElementById('custom-pattern');
                        if (randBtn && customInput) {
                            randBtn.addEventListener('click', () => {
                                const len = Math.floor(Math.random() * 5) + 3;
                                const seq = [];
                                for(let i=0; i<len; i++) seq.push(Math.floor(Math.random() * 8) + 1);
                                customInput.value = seq.join(' ');
                            });
                        }
                    }, 500);
                </script>
            `
        },
        {
            heading: 'Quick Actions',
            class: 'quick-actions',
            content: `
                <div class="control-group" style="display:flex;flex-direction:column;gap:8px;">
                    <label style="margin-bottom:4px;font-weight:700;">Slideshow</label>
                    <button id="sidebar-add-slideshow-btn" style="padding:8px 12px;background:var(--primary-color);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">
                        + Slideshow
                    </button>
                    <button id="run-diagnostics" type="button" aria-label="Run application diagnostics" style="padding:8px 12px;background:var(--secondary-color);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">
                        Run App Checks
                    </button>
                </div>
                <script>
                    // Lightweight binding: call app.addToSlideshow() if available
                    (function(){
                        const btn = document.getElementById('sidebar-add-slideshow-btn');
                        if (!btn) return;
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (window.app && typeof window.app.addToSlideshow === 'function') {
                                window.app.addToSlideshow();
                                const orig = btn.textContent;
                                btn.textContent = 'Added!';
                                btn.style.background = 'var(--accent-color)';
                                setTimeout(() => { btn.textContent = orig; btn.style.background = 'var(--primary-color)'; }, 900);
                            } else {
                                // fallback: dispatch a custom event for the app to listen to
                                const evt = new CustomEvent('request-add-to-slideshow');
                                document.dispatchEvent(evt);
                            }
                        });
                    })();
                </script>
            `
        },
        {
            heading: 'Export (moved)',
            class: 'export-section',
            content: `
                <div class="control-group">
                    <div style="font-size:0.9em;color:var(--secondary-color);">Export controls moved to the bottom controls area for streamlined workflow.</div>
                </div>
            `
        },
        {
            heading: 'Pattern Generator (moved)',
            class: 'pattern-generator-controls',
            content: `
                <div class="control-group">
                    <div style="font-size:0.9em;color:var(--secondary-color);">Pattern-generator batch controls moved to the bottom controls area.</div>
                </div>
            `
        }
    ];

    sections.forEach(s => {
        const section = document.createElement('section');
        section.innerHTML = `<h2 class="sidebar-heading">${s.heading}</h2><div class="${s.class}">${s.content}</div>`;
        sidebar.appendChild(section);
    });
});