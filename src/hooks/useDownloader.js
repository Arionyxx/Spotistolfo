import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const DownloadContext = createContext({});

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [queue, setQueue] = useState([]);
  const downloadProgressRef = useRef(new Map());

  const addToQueue = useCallback((tracks, playlistName = '') => {
    const trackItems = tracks.map(track => ({
      ...track,
      id: `${track.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playlistName,
      status: 'queued',
      progress: 0,
      addedAt: new Date().toISOString()
    }));

    setQueue(prev => [...prev, ...trackItems]);
    return trackItems.map(item => item.id);
  }, []);

  const startDownload = useCallback(async (trackData, outputPath) => {
    try {
      setIsDownloading(true);

      // Create download entry
      const downloadId = `${trackData.id}_${Date.now()}`;
      const downloadEntry = {
        id: downloadId,
        trackId: trackData.id,
        trackName: trackData.name,
        artist: trackData.artist,
        album: trackData.album,
        status: 'starting',
        progress: 0,
        outputPath,
        startedAt: new Date().toISOString(),
        estimatedDuration: trackData.duration || 0
      };

      setDownloads(prev => [...prev, downloadEntry]);
      downloadProgressRef.current.set(downloadId, downloadEntry);

      // Start the download
      const result = await window.electronAPI.startDownload(trackData, outputPath);

      if (result.success) {
        updateDownloadProgress(downloadId, {
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
          filePath: result.filePath
        });
      } else {
        updateDownloadProgress(downloadId, {
          status: 'error',
          progress: 0,
          error: result.error,
          completedAt: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Download failed:', error);
      updateDownloadProgress(trackData.id, {
        status: 'error',
        progress: 0,
        error: error.message,
        completedAt: new Date().toISOString()
      });
      return { success: false, error: error.message };
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const startBatchDownload = useCallback(async (trackIds, outputPath) => {
    try {
      const tracksToDownload = queue.filter(track => trackIds.includes(track.id));
      
      for (const track of tracksToDownload) {
        await startDownload(track, outputPath);
        
        // Small delay between downloads to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Remove completed tracks from queue
      setQueue(prev => prev.filter(track => !trackIds.includes(track.id)));

      return { success: true };
    } catch (error) {
      console.error('Batch download failed:', error);
      return { success: false, error: error.message };
    }
  }, [queue, startDownload]);

  const cancelDownload = useCallback(async (downloadId) => {
    try {
      const result = await window.electronAPI.cancelDownload(downloadId);
      
      if (result.success) {
        updateDownloadProgress(downloadId, {
          status: 'cancelled',
          progress: 0,
          completedAt: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Cancel download failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const cancelAllDownloads = useCallback(() => {
    downloads.forEach(download => {
      if (download.status === 'downloading' || download.status === 'starting') {
        cancelDownload(download.id);
      }
    });
  }, [downloads, cancelDownload]);

  const removeFromQueue = useCallback((trackId) => {
    setQueue(prev => prev.filter(track => track.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(download => 
      !['completed', 'error', 'cancelled'].includes(download.status)
    ));
  }, []);

  const updateDownloadProgress = useCallback((downloadId, updates) => {
    setDownloads(prev => prev.map(download => 
      download.id === downloadId 
        ? { ...download, ...updates }
        : download
    ));

    // Update the ref as well
    if (downloadProgressRef.current.has(downloadId)) {
      const current = downloadProgressRef.current.get(downloadId);
      downloadProgressRef.current.set(downloadId, { ...current, ...updates });
    }
  }, []);

  const getDownloadStats = useCallback(() => {
    const total = downloads.length;
    const completed = downloads.filter(d => d.status === 'completed').length;
    const failed = downloads.filter(d => d.status === 'error').length;
    const downloading = downloads.filter(d => 
      ['starting', 'downloading', 'searching', 'tagging'].includes(d.status)
    ).length;
    const queued = queue.length;

    return {
      total,
      completed,
      failed,
      downloading,
      queued,
      overallProgress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [downloads, queue]);

  const getQueueStats = useCallback(() => {
    const total = queue.length;
    const totalDuration = queue.reduce((sum, track) => sum + (track.duration || 0), 0);
    
    return {
      total,
      totalDuration,
      estimatedTimeRemaining: total * 180000 // Rough estimate: 3 minutes per track
    };
  }, [queue]);

  // Set up download progress listeners
  React.useEffect(() => {
    if (window.electronAPI) {
      const handleProgress = (event, data) => {
        const { trackId, status, progress, error, filePath } = data;
        const downloadId = downloads.find(d => d.trackId === trackId)?.id;
        
        if (downloadId) {
          updateDownloadProgress(downloadId, {
            status,
            progress,
            ...(error && { error }),
            ...(filePath && { filePath })
          });
        }
      };

      window.electronAPI.onDownloadProgress(handleProgress);

      return () => {
        window.electronAPI.removeAllListeners('download:progress');
      };
    }
  }, [downloads, updateDownloadProgress]);

  const value = {
    downloads,
    queue,
    isDownloading,
    addToQueue,
    startDownload,
    startBatchDownload,
    cancelDownload,
    cancelAllDownloads,
    removeFromQueue,
    clearQueue,
    clearCompleted,
    getDownloadStats,
    getQueueStats,
    getDownloadById: (id) => downloads.find(d => d.id === id),
    getQueueTrackById: (id) => queue.find(track => track.id === id)
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};