import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { SpotifyService } from './services/SpotifyService.js';
import { Downloader } from './services/Downloader.js';
import { Tagger } from './services/Tagger.js';
import Store from 'electron-store';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store
const store = new Store({
  name: 'spotloader-data',
  defaults: {
    authToken: null,
    refreshToken: null,
    userId: null,
    playlists: [],
    downloadHistory: [],
    settings: {
      downloadPath: null,
      autoRename: true,
      audioQuality: 'high'
    }
  }
});

class SpotiLoaderApp {
  constructor() {
    this.spotifyService = new SpotifyService();
    this.downloader = new Downloader();
    this.tagger = new Tagger();
    this.mainWindow = null;
    this.setupApp();
  }

  setupApp() {
    // Register the custom protocol
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('spotloader', process.execPath, [path.resolve(process.argv[1])]);
      }
    } else {
      app.setAsDefaultProtocolClient('spotloader');
    }

    // electron-reload is optional for development
    try {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
      });
    } catch (error) {
      // electron-reload not critical, dev server has HMR
      console.log('Hot reload not available, using Vite HMR instead');
    }

    app.whenReady().then(async () => {
      await this.createMainWindow();
      this.setupIpcHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // Handle the custom protocol callback
    app.on('open-url', (event, url) => {
      event.preventDefault();
      // Extract auth code from URL: spotloader://callback?code=...
      const code = new URL(url).searchParams.get('code');
      if (code && this.mainWindow) {
        this.mainWindow.webContents.send('spotify:auth-callback', { code });
      }
    });
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload.js')
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      titleBarStyle: 'hiddenInset',
      show: false
    });

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Check if dev server is running
    const devServerUrl = 'http://localhost:5173';
    const isDevServerRunning = await this.checkDevServer(devServerUrl);

    if (isDevServerRunning) {
      console.log('Dev server detected, loading from:', devServerUrl);
      this.mainWindow.loadURL(devServerUrl);
      this.mainWindow.webContents.openDevTools();
    } else {
      console.log('Dev server not found, loading from dist');
      this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
  }

  // Helper to check if dev server is running
  checkDevServer(url) {
    return new Promise((resolve) => {
      const http = require('http');
      const req = http.get(url, { timeout: 2000 }, () => {
        req.destroy();
        resolve(true);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  setupIpcHandlers() {
    // Auth handlers
    ipcMain.handle('spotify:login', async () => {
      try {
        const authUrl = await this.spotifyService.getAuthUrl();
        return { success: true, authUrl };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('spotify:callback', async (event, code) => {
      try {
        const tokenData = await this.spotifyService.handleCallback(code);
        store.set('authToken', tokenData.access_token);
        store.set('refreshToken', tokenData.refresh_token);
        store.set('userId', tokenData.user_id);
        
        if (this.mainWindow) {
          this.mainWindow.webContents.send('spotify:authenticated', {
            access_token: tokenData.access_token,
            user: tokenData.user
          });
        }
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('spotify:getUser', async () => {
      try {
        const token = store.get('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const userData = await this.spotifyService.getUser(token);
        return { success: true, user: userData };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Playlist handlers
    ipcMain.handle('spotify:getPlaylists', async () => {
      try {
        const token = store.get('authToken');
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const playlists = await this.spotifyService.getPlaylists(token);
        
        // Update store with playlist data
        store.set('playlists', playlists);
        
        return { success: true, playlists };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('spotify:getPlaylistTracks', async (event, playlistId) => {
      try {
        const token = store.get('authToken');
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const tracks = await this.spotifyService.getPlaylistTracks(token, playlistId);
        return { success: true, tracks };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Download handlers
    ipcMain.handle('download:search', async (event, trackData) => {
      try {
        const searchResults = await this.downloader.searchTrack(trackData);
        return { success: true, results: searchResults };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('download:start', async (event, { trackData, outputPath }) => {
      try {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('download:progress', {
            trackId: trackData.id,
            status: 'searching',
            progress: 0
          });
        }

        // Search for the track
        const searchResults = await this.downloader.searchTrack(trackData);
        if (!searchResults || searchResults.length === 0) {
          throw new Error('No search results found');
        }

        if (this.mainWindow) {
          this.mainWindow.webContents.send('download:progress', {
            trackId: trackData.id,
            status: 'downloading',
            progress: 25
          });
        }

        // Download the track
        const downloadedFile = await this.downloader.downloadTrack(
          searchResults[0],
          outputPath
        );

        if (this.mainWindow) {
          this.mainWindow.webContents.send('download:progress', {
            trackId: trackData.id,
            status: 'tagging',
            progress: 75
          });
        }

        // Tag the downloaded file
        const taggedFile = await this.tagger.tagFile(
          downloadedFile,
          trackData,
          searchResults[0]
        );

        // Add to download history
        const history = store.get('downloadHistory', []);
        history.push({
          trackId: trackData.id,
          trackName: trackData.name,
          artist: trackData.artist,
          album: trackData.album,
          filePath: taggedFile,
          downloadDate: new Date().toISOString(),
          duration: trackData.duration
        });
        store.set('downloadHistory', history);

        if (this.mainWindow) {
          this.mainWindow.webContents.send('download:progress', {
            trackId: trackData.id,
            status: 'completed',
            progress: 100,
            filePath: taggedFile
          });
        }

        return { success: true, filePath: taggedFile };
      } catch (error) {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('download:progress', {
            trackId: trackData.id,
            status: 'error',
            progress: 0,
            error: error.message
          });
        }
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('download:cancel', async (event, trackId) => {
      try {
        this.downloader.cancelDownload(trackId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Storage handlers
    ipcMain.handle('store:get', async (event, key) => {
      try {
        const value = store.get(key);
        return { success: true, value };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('store:set', async (event, key, value) => {
      try {
        store.set(key, value);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('store:delete', async (event, key) => {
      try {
        store.delete(key);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Dialog handlers
    ipcMain.handle('dialog:selectFolder', async () => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow, {
          properties: ['openDirectory']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          store.set('settings.downloadPath', result.filePaths[0]);
          return { success: true, path: result.filePaths[0] };
        }
        
        return { success: false, error: 'No folder selected' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('dialog:getDownloadPath', async () => {
      try {
        let downloadPath = store.get('settings.downloadPath');
        
        if (!downloadPath) {
          // Use default Downloads folder
          downloadPath = app.getPath('downloads');
          store.set('settings.downloadPath', downloadPath);
        }
        
        return { success: true, path: downloadPath };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
}

// Initialize the app
new SpotiLoaderApp();