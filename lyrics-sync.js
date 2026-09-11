function parseSyncedLyrics(text = '') {
  return text.split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*\[(\d+):(\d{2}(?:\.\d+)?)\]\s*(.*)$/);
    if (!match) return null;
    return { timeMs: (Number(match[1]) * 60 + Number(match[2])) * 1000, text: match[3].trim() };
  }).filter(Boolean).sort((a, b) => a.timeMs - b.timeMs);
}
function activeLineIndex(lines, positionMs) {
  let active = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].timeMs <= positionMs) active = i;
    else break;
  }
  return active;
}
function formatTime(ms = 0) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
if (typeof module !== 'undefined') module.exports = { parseSyncedLyrics, activeLineIndex, formatTime };
