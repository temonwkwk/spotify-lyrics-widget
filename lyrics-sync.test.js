const assert = require('assert');
const { parseSyncedLyrics, activeLineIndex, formatTime } = require('./lyrics-sync');

const lyrics = '[00:01.00]First line\n[00:03.50]Second line\n[01:02.00]Last line';
assert.deepStrictEqual(parseSyncedLyrics(lyrics), [
  { timeMs: 1000, text: 'First line' },
  { timeMs: 3500, text: 'Second line' },
  { timeMs: 62000, text: 'Last line' }
]);
assert.strictEqual(activeLineIndex(parseSyncedLyrics(lyrics), 999), -1);
assert.strictEqual(activeLineIndex(parseSyncedLyrics(lyrics), 3500), 1);
assert.strictEqual(activeLineIndex(parseSyncedLyrics(lyrics), 5000), 1);
assert.strictEqual(activeLineIndex(parseSyncedLyrics(lyrics), 62000), 2);
assert.strictEqual(formatTime(65000), '1:05');
console.log('lyrics-sync tests passed');
