const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

app.disableHardwareAcceleration();
let win;
let callbackServer;
const REDIRECT_URI = 'http://127.0.0.1:43821/callback';
const SCOPES = 'user-read-playback-state user-read-currently-playing';

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sha256(value) { return crypto.createHash('sha256').update(value).digest(); }
function tokenPath() { return path.join(app.getPath('userData'), 'spotify-token.json'); }
function saveToken(token) { require('fs').writeFileSync(tokenPath(), JSON.stringify(token)); }
function loadToken() {
  try { return JSON.parse(require('fs').readFileSync(tokenPath(), 'utf8')); } catch { return null; }
}
async function spotifyFetch(url, options = {}) {
  const token = loadToken();
  if (!token?.access_token) return { status: 401 };
  let access = token.access_token;
  if (token.expires_at && Date.now() > token.expires_at - 60000) {
    const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: token.refresh_token, client_id: token.client_id });
    const refreshed = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body });
    if (!refreshed.ok) return { status: 401 };
    const data = await refreshed.json(); access = data.access_token;
    saveToken({...token, ...data, expires_at: Date.now() + data.expires_in * 1000});
  }
  return fetch(url, {...options, headers: {...options.headers, Authorization: `Bearer ${access}`} });
}
async function startAuth(clientId) {
  if (!clientId || !/^[A-Za-z0-9]+$/.test(clientId)) throw new Error('Client ID Spotify tidak valid');
  const verifier = base64url(crypto.randomBytes(64));
  const challenge = base64url(sha256(verifier));
  await new Promise((resolve, reject) => {
    callbackServer = http.createServer(async (req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== '/callback') return;
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      res.end('<html><body style="font-family:Arial;background:#111;color:#fff"><h2>Spotify tersambung. Tutup tab ini.</h2></body></html>');
      callbackServer.close(); callbackServer = null;
      if (error || !code) return reject(new Error(error || 'OAuth dibatalkan'));
      try {
        const body = new URLSearchParams({client_id: clientId, grant_type:'authorization_code', code, redirect_uri:REDIRECT_URI, code_verifier:verifier});
        const response = await fetch('https://accounts.spotify.com/api/token', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body});
        if (!response.ok) throw new Error(`Token Spotify gagal (${response.status})`);
        const data = await response.json();
        saveToken({...data, client_id: clientId, expires_at: Date.now() + data.expires_in * 1000});
        resolve();
      } catch (e) { reject(e); }
    });
    callbackServer.once('error', reject);
    callbackServer.listen(43821, '127.0.0.1', () => {
      const auth = new URL('https://accounts.spotify.com/authorize');
      auth.search = new URLSearchParams({response_type:'code', client_id:clientId, scope:SCOPES, redirect_uri:REDIRECT_URI, code_challenge_method:'S256', code_challenge:challenge});
      shell.openExternal(auth.toString());
    });
  });
}
function createWindow() {
  win = new BrowserWindow({width:320,height:390,minWidth:280,minHeight:300,frame:false,transparent:true,alwaysOnTop:true,resizable:true,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true}});
  win.loadFile('index.html'); win.setAlwaysOnTop(true, 'floating');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
ipcMain.on('window-close', () => win?.close());
ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.handle('spotify-auth', (_, clientId) => startAuth(clientId));
ipcMain.handle('spotify-status', () => Boolean(loadToken()?.access_token));
ipcMain.handle('spotify-now-playing', async () => {
  const response = await spotifyFetch('https://api.spotify.com/v1/me/player');
  if (response.status === 204 || response.status === 401) return null;
  if (!response.ok) throw new Error(`Spotify API ${response.status}`);
  return response.json();
});
