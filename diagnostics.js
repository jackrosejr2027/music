/*
Diagnostics helper for Scales Thesaurus
- Adds detailed numbered automated checks (DOM, UI behavior, data integrity, audio, export libs)
- Shows a modal report with step number, test definition, result, details and probable fixes
*/

(function () {
    function createModal(html) {
        const existing = document.getElementById('diagnostics-modal');
        if (existing) existing.querySelector('[aria-label="Close diagnostics report"]')?.click();
        const returnFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const inertSiblings = Array.from(document.body.children).map(node => ({ node, inert: node.inert }));
        const modal = document.createElement('div');
        modal.id = 'diagnostics-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'diagnostics-heading');
        modal.tabIndex = -1;
        Object.assign(modal.style, {
            position: 'fixed', inset: '0', zIndex: '30000', display: 'flex',
            alignItems: 'center', justifyContent: 'center', overflow: 'auto',
            padding: 'max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom))',
            background: 'rgba(0,0,0,0.6)', boxSizing: 'border-box'
        });
        const card = document.createElement('div');
        Object.assign(card.style, {
            width: 'min(980px, 100%)', maxHeight: '86vh',
            minWidth: '0', overflow: 'auto', background: 'var(--card-bg, #fff)',
            color: 'var(--text-color, #111)', borderRadius: '8px', padding: '14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)', boxSizing: 'border-box'
        });
        if (window.CSS && CSS.supports('max-height', '86dvh')) card.style.maxHeight = '86dvh';
        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Close';
        close.setAttribute('aria-label', 'Close diagnostics report');
        Object.assign(close.style, {
            width: 'auto', minHeight: '40px', flex: '0 0 auto',
            background: '#e74c3c', color: '#fff', border: 'none',
            padding: '8px 12px', borderRadius: '6px', cursor: 'pointer'
        });
        const heading = document.createElement('h2');
        heading.id = 'diagnostics-heading';
        heading.textContent = 'Diagnostics Report';
        heading.style.margin = '0';
        const header = document.createElement('div');
        Object.assign(header.style, {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '12px'
        });
        header.append(heading, close);
        const content = document.createElement('div');
        content.innerHTML = html;
        card.append(header, content);
        modal.appendChild(card);

        let closed = false;
        function closeModal() {
            if (closed) return;
            closed = true;
            window.removeEventListener('keydown', onWindowKeyDown, true);
            inertSiblings.forEach(({ node, inert }) => { node.inert = inert; });
            document.body.style.overflow = previousOverflow;
            modal.remove();
            if (returnFocus && returnFocus.isConnected && typeof returnFocus.focus === 'function') returnFocus.focus();
        }
        function onWindowKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = Array.from(modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter(node => node.getClientRects().length);
            if (!focusable.length) { event.preventDefault(); modal.focus(); return; }
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
                event.preventDefault(); first.focus();
            }
        }
        close.addEventListener('click', closeModal);
        modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
        inertSiblings.forEach(({ node }) => { node.inert = true; });
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onWindowKeyDown, true);
        document.body.appendChild(modal);
        close.focus();
    }

    function passFailRow(stepNo, name, ok, detail, probableFix) {
        return `<div style="padding:10px;border-bottom:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="max-width:78%"><strong>${stepNo}. ${escapeHtml(name)}</strong>
                    <div style="color:var(--secondary-color);font-size:0.95em;margin-top:6px">${escapeHtml(detail || '')}</div>
                </div>
                <div style="font-size:1.05em">${ok ? '<span style="color:var(--accent-color);font-weight:700">PASS</span>' : '<span style="color:#e74c3c;font-weight:700">FAIL</span>'}</div>
            </div>
            ${probableFix ? `<div style="margin-top:8px;font-size:0.9em;color:#444"><em>Probable fix:</em> ${escapeHtml(probableFix)}</div>` : ''}
        </div>`;
    }

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>"']/g, function (m) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
        });
    }

    async function runChecks() {
        const results = [];
        console.group('Diagnostics run');

        // removed diagnostics tests array -> moved to diagnostics-tests.js
        const tests = window.DIAGNOSTICS_TESTS || [];

        // Execute tests sequentially and collect report rows
        for (const t of tests) {
            try {
                const res = await (typeof t.run === 'function' ? t.run() : { ok: false, detail: 'No runner' });
                const ok = !!res.ok;
                const detail = res.detail || t.definition;
                const probableFix = res.probableFix || '';
                results.push({ step: t.id, name: t.name, ok, detail, probableFix });
            } catch (err) {
                results.push({ step: t.id, name: t.name, ok: false, detail: 'Exception: ' + (err && err.message ? err.message : String(err)), probableFix: 'See console for stack trace' });
            }
        }

        // Build HTML with numbered steps, definitions, results and probable fixes
        const passed = results.filter(result => result.ok).length;
        let html = '<p><strong>' + passed + ' of ' + results.length + ' checks passed.</strong></p>';
        html += '<div style="border:1px solid var(--border-color);border-radius:6px;overflow:hidden;">';
        for (const r of results) {
            html += passFailRow(r.step, r.name, r.ok, r.detail, r.probableFix);
        }
        html += '</div>';

        createModal(html);
        console.groupEnd();
        return results;
    }

    // Attach event listener to button (delegated init safe)
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'run-diagnostics') {
            // Run checks and show loading state
            const btn = e.target;
            const prev = btn.textContent;
            btn.textContent = '⏳';
            btn.disabled = true;
            runChecks().finally(() => {
                btn.textContent = prev;
                btn.disabled = false;
            });
        }
    });

    // Expose to window for programmatic runs
    window.runAppDiagnostics = runChecks;
})();