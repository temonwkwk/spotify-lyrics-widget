const $ = (id) => document.getElementById(id);
$('close').onclick = () => window.desktop.close();
$('min').onclick = () => window.desktop.minimize();
$('connect').onclick = async () => {
  const clientId = prompt('Masukkan Spotify Client ID:\nBuat di developer.spotify.com/dashboard\nRedirect URI: http://127.0.0.1:43821/callback');
  if (!clientId) return;
  const btn = $('connect'); btn.disabled = true; btn.textContent = 'OPENING SPOTIFY...';
  try { await window.desktop.spotifyAuth(clientId.trim()); btn.textContent = 'SPOTIFY CONNECTED'; $('status').textContent = 'READY'; startPolling(); }
  catch (e) { alert(e.message); btn.textContent = 'CONNECT SPOTIFY'; }
  finally { btn.disabled = false; }
};
$('settings').onclick = () => alert('Spotify Client ID bisa dimasukkan lewat tombol CONNECT SPOTIFY.');

async function fetchLyrics(artist, title) {
  const params = new URLSearchParams({artist_name: artist, track_name: title});
  const r = await fetch(`https://lrclib.net/api/get?${params}`);
  if (!r.ok) return null;
  return r.json();
}
function renderLyrics(data) {
  const box = document.querySelector('.lyrics');
  if (!data) { box.innerHTML = '<div class="line active">Lirik tidak ditemukan</div>'; return; }
  const lines = (data.syncedLyrics || data.plainLyrics || '').split('\n').filter(Boolean).slice(0, 7);
  box.innerHTML = lines.length ? lines.map((line, i) => `<div class="line ${i === 1 ? 'active' : ''}">${line.replace(/</g,'&lt;')}</div>`).join('') : '<div class="line active">Lirik tidak tersedia</div>';
}
let lastTrack = '';
async function poll() {
  try {
    const state = await window.desktop.nowPlaying();
    if (!state?.item) { $('title').textContent = 'Belum ada lagu'; $('artist').textContent = 'Putar lagu di Spotify'; $('status').textContent = 'PAUSED'; return; }
    const item = state.item, artist = item.artists.map(a => a.name).join(', ');
    $('title').textContent = item.name; $('artist').textContent = artist; $('status').textContent = state.is_playing ? 'PLAYING' : 'PAUSED';
    const track = `${artist}::${item.name}`;
    if (track !== lastTrack) { lastTrack = track; renderLyrics(await fetchLyrics(artist, item.name)); }
    const progress = item.duration_ms ? Math.round(state.progress_ms / item.duration_ms * 100) : 0;
    document.querySelector('.progress i').style.width = `${progress}%`;
  } catch (e) { $('status').textContent = 'NOT CONNECTED'; }
}
function startPolling() { poll(); setInterval(poll, 5000); }
window.addEventListener('DOMContentLoaded', async () => { if (await window.desktop.spotifyStatus()) { $('connect').textContent = 'SPOTIFY CONNECTED'; startPolling(); } });
