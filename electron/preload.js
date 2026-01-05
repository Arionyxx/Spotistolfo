import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth methods
  login: () => ipcRenderer.invoke('spotify:login'),
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

// Define the type for the exposed API
declare global {
  interface Window {
    electronAPI: {
      login: () => Promise<{ success: boolean; authUrl?: string; error?: string }>;
      handleCallback: (code: string) => Promise<{ success: boolean; error?: string }>;
      getUser: () => Promise<{ success: boolean; user?: any; error?: string }>;
      getPlaylists: () => Promise<{ success: boolean; playlists?: any[]; error?: string }>;
      getPlaylistTracks: (playlistId: string) => Promise<{ success: boolean; tracks?: any[]; error?: string }>;
      searchTrack: (trackData: any) => Promise<{ success: boolean; results?: any[]; error?: string }>;
      startDownload: (trackData: any, outputPath: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      cancelDownload: (trackId: string) => Promise<{ success: boolean; error?: string }>;
      storeGet: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
      storeSet: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
      storeDelete: (key: string) => Promise<{ success: boolean; error?: string }>;
      selectFolder: () => Promise<{ success: boolean; path?: string; error?: string }>;
      getDownloadPath: () => Promise<{ success: boolean; path?: string; error?: string }>;
      onAuthenticated: (callback: (event: any, data: any) => void) => void;
      onDownloadProgress: (callback: (event: any, data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}