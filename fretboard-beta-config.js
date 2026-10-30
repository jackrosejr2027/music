(() => {
    'use strict';
    const KEY = 'fretboard-word-beta-configurations-v1';
    const DEFAULT_KEY = KEY + '-default';
    const LIMIT = 100;
    const newId = () => 'cfg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    function validateConfiguration(value) {
        if (!value || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 60 || !Array.isArray(value.keys) || !value.patterns || typeof value.patterns !== 'object') throw new Error('Invalid configuration file.');
        const strings = list => {
            if (!Array.isArray(list) || list.length > 10000 || list.some(x => typeof x !== 'string' || x.length > 200)) throw new Error('Invalid configuration selections.');
            return [...new Set(list)];
        };
        return { id: newId(), name: value.name.trim(), keys: strings(value.keys),
            patterns: Object.fromEntries(['interval', 'chord', 'scale'].map(type => [type, strings(value.patterns[type] || [])])),
            ...(value.options ? { options: FretboardBetaOptions.validate(value.options) } : {}) };
    }
    function setup({ getSelection, applySelection, getOptions, applyOptions, resetOptions, setStatus }) {
        const $ = id => document.getElementById('beta-config-' + id);
        let restored = null;
        const read = () => {
            try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data.filter(x => x && typeof x.id === 'string' && typeof x.name === 'string').slice(0, LIMIT) : []; }
            catch (_) { return []; }
        };
        const defaultId = () => { try { return localStorage.getItem(DEFAULT_KEY) || ''; } catch (_) { return ''; } };
        const selected = () => read().find(x => x.id === $('select').value);
        const refresh = (id = $('select').value) => {
            const configs = read();
            $('count').textContent = configs.length + ' / ' + LIMIT;
            $('select').replaceChildren(new Option('Choose a saved configuration', ''));
            configs.forEach(config => $('select').append(new Option(config.name + (config.id === defaultId() ? ' (on open)' : ''), config.id)));
            $('select').value = configs.some(x => x.id === id) ? id : '';
            for (const name of ['load', 'delete', 'update', 'duplicate', 'rename', 'download', 'default']) $(name).disabled = !$('select').value;
            $('default').checked = !!$('select').value && $('select').value === defaultId();
            $('backup').disabled = $('clear').disabled = !configs.length;
            $('restore').disabled = !restored;
        };
        const write = (configs, id) => {
            localStorage.setItem(KEY, JSON.stringify(configs));
            if (!configs.some(x => x.id === defaultId())) localStorage.removeItem(DEFAULT_KEY);
            refresh(id);
        };
        const load = config => {
            if (config.options) applyOptions(config.options);
            applySelection(config);
            restored = JSON.parse(JSON.stringify(config));
            $('name').value = config.name;
            refresh(config.id); setStatus('Loaded ' + config.name + (config.options ? ', including export settings.' : ' (selection only).'));
        };
        const download = (data, name) => {
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            const link = document.createElement('a'); link.href = url;
            link.download = name.replace(/[^a-z0-9_-]+/gi, '_') + '.json';
            document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        const guard = action => async () => {
            try { await action(); }
            catch (error) { setStatus(error.message || 'Could not update configurations.'); }
        };
        const capture = () => {
            const selection = getSelection();
            if (!selection.keys.length || !Object.values(selection.patterns).some(x => x.length)) throw new Error('Choose at least one pattern and key.');
            return { ...selection, options: getOptions() };
        };
        const named = () => { const name = $('name').value.trim(); if (!name) throw new Error('Enter a configuration name.'); return name; };
        const room = configs => { if (configs.length >= LIMIT) throw new Error('All 100 slots are in use. Delete a configuration first.'); };
        const on = (name, action) => $(name).addEventListener('click', guard(action));
        $('select').addEventListener('change', () => { const config = selected(); if (config) $('name').value = config.name; refresh(); });
        on('save', () => {
            const configs = read(); room(configs);
            const config = { id: newId(), name: named(), ...capture() };
            write([...configs, config], config.id); setStatus('Saved selection, page layout, and export text.');
        });
        on('load', () => { const config = selected(); if (config) load(config); });
        on('delete', () => { const config = selected(); if (config) { write(read().filter(x => x.id !== config.id), ''); setStatus('Configuration deleted.'); } });
        on('update', () => { const config = selected(); if (config) { Object.assign(config, capture()); write(read().map(x => x.id === config.id ? config : x), config.id); setStatus('Saved configuration updated from the current export settings.'); } });
        on('duplicate', () => {
            const configs = read(), config = selected(); if (!config) return; room(configs);
            const copy = { ...config, id: newId(), name: (config.name.slice(0, 53) + ' (copy)').slice(0, 60) };
            write([...configs, copy], copy.id); $('name').value = copy.name; setStatus('Configuration duplicated.');
        });
        on('rename', () => { const config = selected(); if (config) { config.name = named(); write(read().map(x => x.id === config.id ? config : x), config.id); setStatus('Configuration renamed.'); } });
        on('download', () => { const config = selected(); if (config) { download({ version: 1, configurations: [config] }, config.name); setStatus('Configuration JSON downloaded.'); } });
        on('backup', () => { download({ version: 1, configurations: read() }, 'fretboard-export-configurations'); setStatus('All configurations backed up as JSON.'); });
        on('import', () => $('file').click());
        $('file').addEventListener('change', guard(async () => {
            const file = $('file').files[0]; if (!file) return;
            try {
                if (file.size > 20000000) throw new Error('Use a configuration file smaller than 20 MB.');
                const data = JSON.parse(await file.text());
                const incoming = Array.isArray(data.configurations) ? data.configurations : [data];
                if (!incoming.length || incoming.length > LIMIT) throw new Error('Import 1 to 100 configurations at once.');
                const configs = read();
                if (configs.length + incoming.length > LIMIT) throw new Error('Not enough configuration slots. Nothing was imported.');
                const validated = incoming.map(validateConfiguration);
                write([...configs, ...validated], validated[0].id);
                setStatus('Imported ' + validated.length + ' configurations. Select Load to apply one.');
            } finally { $('file').value = ''; }
        }));
        on('reset', () => { resetOptions(); setStatus('Export options reset. Pattern and key selections are unchanged.'); });
        on('restore', () => { if (restored) load(restored); });
        $('default').addEventListener('change', guard(() => {
            if ($('default').checked) localStorage.setItem(DEFAULT_KEY, $('select').value);
            else localStorage.removeItem(DEFAULT_KEY);
            refresh(); setStatus($('default').checked ? 'This configuration will load when the beta opens.' : 'Automatic loading turned off.');
        }));
        on('clear', () => { if (confirm('Delete all saved beta export configurations on this device? Download a backup first if needed.')) { write([], ''); setStatus('All saved configurations deleted.'); } });
        refresh();
        return { onOpen() { const config = read().find(x => x.id === defaultId()); if (config) { try { load(config); } catch (error) { setStatus(error.message); } } } };
    }
    globalThis.FretboardBetaConfig = { setup, validateConfiguration };
})();
