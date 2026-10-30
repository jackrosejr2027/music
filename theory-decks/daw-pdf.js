(function (TD) {
'use strict';
// Draw the score with browser fonts (including accidentals), then embed each page as JPEG in a local PDF.
const C = TD['daw-core.js'];
const W = 595, H = 842, M = 38, RIGHT = W - M, BOTTOM = H - 45;
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const pitch = n => NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
const beat = (m, t) => {
  const unit = C.TPW / m.den, b = Math.floor(t / unit) + 1, remainder = t % unit;
  return remainder ? b + '+' + +(remainder / unit).toFixed(3) : String(b);
};
const length = d => {
  const labels = { 96: 'whole', 72: 'dotted half', 48: 'half', 36: 'dotted quarter', 24: 'quarter', 18: 'dotted eighth', 12: 'eighth', 8: 'eighth triplet', 6: 'sixteenth', 4: 'sixteenth triplet', 3: '32nd', 2: '32nd triplet' };
  return labels[d] || d + '/96';
};

function songToPdf(song, options = {}) {
  const order = options.scope === 'section' ? [options.section] : song.arrangement;
  const sections = order.map(i => song.sections[i]).filter(Boolean);
  const bars = sections.reduce((n, s) => n + s.measures.length, 0);
  if (!bars) return { blob: null, bars: 0, pages: 0 };
  const images = [];
  let canvas, ctx, y, page = 0;
  const font = (size, bold = false) => { ctx.font = (bold ? '600 ' : '') + size + 'px "Arial Narrow", Arial, sans-serif'; };
  function newPage() {
    canvas = document.createElement('canvas'); canvas.width = W * 2; canvas.height = H * 2;
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.scale(2, 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#234638'; ctx.fillRect(0, 0, W, 8);
    font(9); ctx.fillStyle = '#64756c';
    ctx.fillText(song.title || 'Untitled song', M, 29);
    ctx.fillText('Page ' + (++page), RIGHT - ctx.measureText('Page ' + page).width, H - 22);
    ctx.strokeStyle = '#d7e1d8'; ctx.beginPath(); ctx.moveTo(M, 37); ctx.lineTo(RIGHT, 37); ctx.stroke();
    y = 57;
  }
  function finishPage() {
    const data = canvas.toDataURL('image/jpeg', 0.88);
    if (!data.startsWith('data:image/jpeg;base64,')) throw new Error('JPEG encoding is unavailable.');
    const binary = atob(data.slice(data.indexOf(',') + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    images.push(bytes);
  }
  function space(height) {
    if (y + height <= BOTTOM) return;
    finishPage(); newPage();
  }
  function line(text, opts = {}) {
    const size = opts.size || 9, step = opts.step || size + 5;
    font(size, !!opts.bold);
    const x = M + (opts.indent || 0), max = RIGHT - x;
    const words = String(text).split(/s+/);
    let row = '';
    const draw = value => {
      space(step);
      font(size, !!opts.bold);
      ctx.fillStyle = opts.color || '#293a31';
      ctx.fillText(value, x, y);
      y += step;
    };
    for (const word of words) {
      const candidate = row ? row + ' ' + word : word;
      if (ctx.measureText(candidate).width <= max) { row = candidate; continue; }
      if (row) { draw(row); row = ''; }
      // Long unbroken titles and imported chord labels must not run off the page.
      for (const char of word) {
        if (ctx.measureText(row + char).width > max && row) { draw(row); row = ''; }
        row += char;
      }
    }
    if (row) draw(row);
  }
  newPage();
  line(song.title || 'Untitled song', { size: 20, step: 28, bold: true, color: '#183b2b' });
  line('Tempo: ' + song.tempo + ' bpm   ·   Swing: ' + Math.round(song.swing * 100) + '%   ·   Drums: ' + (C.DRUM_PATTERNS[song.drums] || 'Off'), { size: 10, step: 18 });
  line(options.scope === 'section' ? 'Section: ' + sections[0].name : 'Arrangement: ' + sections.map(s => s.name).join(' → '), { size: 10, step: 19 });
  y += 9;
  let barNumber = 0;
  sections.forEach((section, si) => {
    space(60);
    line('Section ' + section.name + (options.scope === 'section' ? '' : '  ·  ' + (si + 1) + ' of ' + sections.length), { size: 13, step: 24, bold: true, color: '#234638' });
    section.measures.forEach((m, mi) => {
      space(62);
      const barCtx = C.measureCtx(m);
      const id = options.scope === 'section' ? mi + 1 : ++barNumber;
      line('Bar ' + id + '  ·  ' + m.num + '/' + m.den + (m.groups ? ' (' + m.groups.join('+') + ')' : '') + '  ·  ' + m.key + ' ' + barCtx.scale.name + '  ·  ' + (m.tempo || song.tempo) + ' bpm', { size: 10, step: 18, bold: true });
      line('Chords: ' + (m.chords.length ? m.chords.map(c => beat(m, c.t) + ': ' + C.chordName(c.chord, barCtx) + ' (' + C.chordRoman(c.chord, barCtx) + ')').join('   ·   ') : 'None'), { indent: 12 });
      if (m.mel.length) line('Melody: ' + m.mel.map(n => beat(m, n.t) + ': ' + pitch(C.melodyMidi(n, barCtx)) + ' ' + length(n.d)).join('   ·   '), { indent: 12 });
      if (m.chd.length) line('Chord hits: ' + m.chd.map(n => beat(m, n.t) + ': ' + length(n.d)).join('   ·   '), { indent: 12 });
      if (m.bas.length) line('Bass: ' + m.bas.map(n => {
        const midi = C.bassMidi(C.chordAt(m, n.t), barCtx);
        return beat(m, n.t) + ': ' + (midi === null ? 'rest' : pitch(midi)) + ' ' + length(n.d);
      }).join('   ·   '), { indent: 12 });
      y += 10;
    });
    y += 6;
  });
  finishPage();

  const enc = new TextEncoder(), parts = [], offsets = [0];
  let total = 0;
  const add = value => { const bytes = typeof value === 'string' ? enc.encode(value) : value; parts.push(bytes); total += bytes.length; };
  const object = (id, content) => { offsets[id] = total; add(id + ' 0 obj\n'); content(); add('\nendobj\n'); };
  add('%PDF-1.4\n');
  object(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
  object(2, () => add('<< /Type /Pages /Kids [' + images.map((_, i) => (3 + i * 3) + ' 0 R').join(' ') + '] /Count ' + images.length + ' >>'));
  images.forEach((jpeg, i) => {
    const id = 3 + i * 3, content = enc.encode('q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im Do Q\n');
    object(id, () => add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im ' + (id + 1) + ' 0 R >> >> /Contents ' + (id + 2) + ' 0 R >>'));
    object(id + 1, () => { add('<< /Type /XObject /Subtype /Image /Width ' + W * 2 + ' /Height ' + H * 2 + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n'); add(jpeg); add('\nendstream'); });
    object(id + 2, () => { add('<< /Length ' + content.length + ' >>\nstream\n'); add(content); add('endstream'); });
  });
  const xref = total;
  add('xref\n0 ' + offsets.length + '\n0000000000 65535 f \n');
  for (let i = 1; i < offsets.length; i++) add(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
  add('trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
  return { blob: new Blob(parts, { type: 'application/pdf' }), bars, pages: images.length };
}
TD['daw-pdf.js'] = { songToPdf };
})(window.TD = window.TD || {});
