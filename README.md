# Spotify Lyrics Widget

Widget desktop floating untuk menampilkan lagu Spotify yang sedang diputar dan lirik dari LRCLIB.

## Jalankan

```powershell
npm.cmd install
npm.cmd start
```

## Hubungkan Spotify

1. Buka https://developer.spotify.com/dashboard dan login.
2. Buat aplikasi baru, lalu salin **Client ID**.
3. Tambahkan Redirect URI berikut persis di pengaturan aplikasi Spotify:

```text
http://127.0.0.1:43821/callback
```

4. Di widget klik **CONNECT SPOTIFY**, masukkan Client ID.
5. Login/izinkan akses Spotify di browser yang terbuka.
6. Putar lagu Spotify. Widget akan mengecek lagu aktif setiap 5 detik dan mencari lirik melalui LRCLIB.

Catatan:
- Tidak ada Client Secret di aplikasi desktop; OAuth menggunakan PKCE.
- Spotify API hanya mengirim status playback, bukan lirik.
- Lirik diambil dari layanan eksternal LRCLIB dan bisa tidak tersedia untuk semua lagu.
- Token disimpan lokal di folder user data Electron.
