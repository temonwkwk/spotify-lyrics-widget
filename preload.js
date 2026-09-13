const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
  dragStart: () => ipcRenderer.send('window-drag-start'),
  dragStop: () => ipcRenderer.send('window-drag-stop'),
  spotifyAuth: (clientId) => ipcRenderer.invoke('spotify-auth', clientId),
  spotifyStatus: () => ipcRenderer.invoke('spotify-status'),
  nowPlaying: () => ipcRenderer.invoke('spotify-now-playing')
});
