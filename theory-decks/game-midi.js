(function (TD) {
'use strict';
const PPQ = 480;
const encodeText = value => Array.from(unescape(encodeURIComponent(String(value))), char => char.charCodeAt(0));
const vlq = value => {
  let n = Math.max(0, Math.round(value));
  const bytes = [n & 0x7f];
  while ((n >>= 7)) bytes.unshift((n & 0x7f) | 0x80);
  return bytes;
};
const u16 = value => [(value >> 8) & 255, value & 255];
const u32 = value => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const meta = (type, data) => [0xff, type, ...vlq(data.length), ...data];

function makeDrawMidi(events, title) {
  const playable = (events || []).map(notes => [...new Set(notes.filter(note => Number.isInteger(note) && note >= 0 && note <= 127))]).filter(notes => notes.length);
  if (!playable.length) return null;
  const name = String(title || 'Game draw').slice(0, 180);
  const track = [
    { tick: 0, order: 0, bytes: meta(0x03, encodeText(name)) },
    { tick: 0, order: 0, bytes: meta(0x51, [0x07, 0xa1, 0x20]) },
    { tick: 0, order: 0, bytes: meta(0x58, [4, 2, 24, 8]) },
  ];
  let tick = 0;
  playable.forEach(notes => {
    notes.forEach(note => {
      track.push({ tick, order: 2, bytes: [0x90, note, 88] });
      track.push({ tick: tick + 210, order: 1, bytes: [0x80, note, 0] });
      tick += 240;
    });
    tick += 120;
  });
  track.sort((a, b) => a.tick - b.tick || a.order - b.order);
  let previous = 0;
  const data = [];
  track.forEach(event => { data.push(...vlq(event.tick - previous), ...event.bytes); previous = event.tick; });
  data.push(...vlq(Math.max(0, tick - previous)), 0xff, 0x2f, 0x00);
  const header = [0x4d,0x54,0x68,0x64, ...u32(6), ...u16(0), ...u16(1), ...u16(PPQ)];
  const trackHeader = [0x4d,0x54,0x72,0x6b, ...u32(data.length)];
  return new Uint8Array([...header, ...trackHeader, ...data]);
}

function downloadDraw(events, selectedCards) {
  const title = Array.isArray(selectedCards) ? selectedCards.join(' - ') : String(selectedCards || 'Game draw');
  const bytes = makeDrawMidi(events, title);
  if (!bytes) return false;
  const safe = title.normalize('NFKC').replace(/[^A-Za-z0-9 ._-]+/g, ' ').replace(/ +/g, ' ').trim().slice(0, 150) || 'Game draw';
  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = safe + '.mid';
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

TD['game-midi.js'] = { makeDrawMidi, downloadDraw };
})(window.TD = window.TD || {});
