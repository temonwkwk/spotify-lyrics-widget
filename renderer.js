const $ = (id) => document.getElementById(id);
const settingsButton = $('settings');
const modal = $('modal');
const clientIdInput = $('client-id');
$('cancel-connect').addEventListener('click', () => modal.classList.remove('show'));
$('submit-connect').addEventListener('click', async () => {
  const clientId = clientIdInput.value.trim();
  if (!clientId) return clientIdInput.focus();
  modal.classList.remove('show');
  const btn = $('submit-connect'); btn.disabled = true; btn.textContent = 'MEMBUKA SPOTIFY...';
  try { await window.desktop.spotifyAuth(clientId); $('status').textContent = 'READY'; startPolling(); }
  catch (e) { window.alert(e?.message || 'Gagal menghubungkan Spotify'); }
  finally { btn.disabled = false; btn.textContent = 'LANJUT'; }
});
settingsButton.onclick = () => { modal.classList.add('show'); clientIdInput.focus(); };

async function fetchLyrics(artist, title) {
  const params = new URLSearchParams({artist_name: artist, track_name: title});
  const r = await fetch(`https://lrclib.net/api/get?${params}`);
  if (!r.ok) return null;
  return r.json();
}
let syncedLines = [];
let plainLyrics = false;
function renderLyrics(data) {
  const box = document.querySelector('.lyrics');
  syncedLines = [];
  plainLyrics = false;
  if (!data) { box.innerHTML = '<div class="line active">Lirik tidak ditemukan</div>'; return; }
  if (data.syncedLyrics) {
    syncedLines = parseSyncedLyrics(data.syncedLyrics);
  } else {
    plainLyrics = true;
  }
  const source = syncedLines.length ? syncedLines.map(x => x.text) : (data.plainLyrics || '').split(/\r?\n/).filter(Boolean);
  const lines = source.slice(0, 80);
  box.innerHTML = lines.length ? lines.map((line, i) => `<div class="line" data-line="${i}">${line.replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;')}</div>`).join('') : '<div class="line active">Lirik tidak tersedia</div>';
}
function updateLyrics(positionMs) {
  if (!syncedLines.length) return;
  const index = activeLineIndex(syncedLines, positionMs);
  // Tampilkan hanya tiga baris: satu sebelum, aktif, dan satu sesudah.
  // Ini menjaga widget kecil tetap terbaca tanpa memotong teks karena scroll.
  document.querySelectorAll('.lyrics .line').forEach((el, i) => {
    el.classList.toggle('active', i === index);
    el.classList.toggle('hidden', Math.abs(i - index) > 1);
  });
}
let lastTrack = '';
let playback = {positionMs: 0, durationMs: 0, receivedAt: 0, playing: false};
async function poll() {
  try {
    const state = await window.desktop.nowPlaying();
    if (!state?.item) { $('title').textContent = 'Belum ada lagu'; $('artist').textContent = 'Putar lagu di Spotify'; $('status').textContent = 'PAUSED'; return; }
    const item = state.item, artist = item.artists.map(a => a.name).join(', ');
    $('title').textContent = item.name; $('artist').textContent = artist; $('status').textContent = state.is_playing ? 'PLAYING' : 'PAUSED';
    const track = `${artist}::${item.name}`;
    if (track !== lastTrack) { lastTrack = track; renderLyrics(await fetchLyrics(artist, item.name)); }
    playback = {positionMs: state.progress_ms || 0, durationMs: item.duration_ms || 0, receivedAt: performance.now(), playing: Boolean(state.is_playing)};
    updatePlaybackUI();
  } catch (e) { $('status').textContent = 'NOT CONNECTED'; }
}
function updatePlaybackUI() {
  const elapsed = playback.playing ? performance.now() - playback.receivedAt : 0;
  const position = Math.min(playback.durationMs, playback.positionMs + elapsed);
  const progress = playback.durationMs ? position / playback.durationMs * 100 : 0;
  document.querySelector('.progress i').style.width = `${progress}%`;
  const spans = document.querySelectorAll('.time span');
  spans[0].textContent = formatTime(position); spans[2].textContent = formatTime(playback.durationMs);
  updateLyrics(position);
  requestAnimationFrame(updatePlaybackUI);
}
function startPolling() { poll(); setInterval(poll, 5000); }
window.addEventListener('DOMContentLoaded', async () => { if (await window.desktop.spotifyStatus()) { $('status').textContent = 'CONNECTED'; startPolling(); } else requestAnimationFrame(updatePlaybackUI); });
