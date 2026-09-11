const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

// Hindari error driver AMD/VideoProcessor pada beberapa Windows GPU.
app.disableHardwareAcceleration();

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 390, height: 560, minWidth: 300, minHeight: 300,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.loadFile('index.html');
  win.setAlwaysOnTop(true, 'floating');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
ipcMain.on('window-close', () => win?.close());
ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.on('open-external', (_, url) => shell.openExternal(url));
