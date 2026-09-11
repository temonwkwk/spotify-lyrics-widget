const $ = (id) => document.getElementById(id);
$('close').onclick = () => window.desktop.close();
$('min').onclick = () => window.desktop.minimize();
$('connect').onclick = async () => {
  const btn = $('connect'); btn.disabled = true; btn.textContent = 'CONNECTING...';
  $('status').textContent = 'SPOTIFY API NEEDS SETUP';
  $('artist').textContent = 'Buat Client ID Spotify untuk mengaktifkan';
  btn.textContent = 'SETUP REQUIRED';
  btn.disabled = false;
};
$('settings').onclick = () => alert('Spotify OAuth akan ditambahkan di langkah berikutnya.\n\nVersi ini adalah UI widget yang sudah bisa dijalankan.');
