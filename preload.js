const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
  spotifyAuth: (clientId) => ipcRenderer.invoke('spotify-auth', clientId),
  spotifyStatus: () => ipcRenderer.invoke('spotify-status'),
  nowPlaying: () => ipcRenderer.invoke('spotify-now-playing')
});
