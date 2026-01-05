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

export {};
