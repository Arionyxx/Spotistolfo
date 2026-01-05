const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth methods
  login: () => ipcRenderer.invoke('spotify:login'),
  loginWithClientId: (clientId) => ipcRenderer.invoke('spotify:loginWithClientId', clientId),
  handleCallback: (code) => ipcRenderer.invoke('spotify:callback', code),
  getUser: () => ipcRenderer.invoke('spotify:getUser'),
  
  // Playlist methods
  getPlaylists: () => ipcRenderer.invoke('spotify:getPlaylists'),
  getPlaylistTracks: (playlistId) => ipcRenderer.invoke('spotify:getPlaylistTracks', playlistId),
  
  // Download methods
  searchTrack: (trackData) => ipcRenderer.invoke('download:search', trackData),
  startDownload: (trackData, outputPath) => ipcRenderer.invoke('download:start', { trackData, outputPath }),
  cancelDownload: (trackId) => ipcRenderer.invoke('download:cancel', trackId),
  
  // Storage methods
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store:delete', key),
  
  // Dialog methods
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  getDownloadPath: () => ipcRenderer.invoke('dialog:getDownloadPath'),
  
  // Event listeners
  onAuthenticated: (callback) => ipcRenderer.on('spotify:authenticated', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download:progress', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
