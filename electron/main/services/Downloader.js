import ytdl from 'ytdl-core';
import fs from 'fs-extra';
import path from 'path';
import { searchYouTube } from './YouTubeSearch.js';

export class Downloader {
  constructor() {
    this.activeDownloads = new Map();
    this.downloadQueue = [];
  }

  async searchTrack(trackData) {
    try {
      const searchQuery = `${trackData.artist} ${trackData.name} audio`;
      const results = await searchYouTube(searchQuery);
      
      return results.map(result => ({
        id: result.id,
        title: result.title,
        duration: result.duration,
        thumbnail: result.thumbnail,
        url: result.url,
        viewCount: result.viewCount
      }));
    } catch (error) {
      console.error('Error searching for track:', error);
      throw error;
    }
  }

  async downloadTrack(videoData, outputPath) {
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Ensure output directory exists
      await fs.ensureDir(outputPath);

      // Create filename
      const filename = this.sanitizeFilename(`${videoData.title}.mp3`);
      const filePath = path.join(outputPath, filename);

      // Check if file already exists
      if (await fs.pathExists(filePath)) {
        return filePath;
      }

      // Start download
      this.activeDownloads.set(downloadId, {
        status: 'downloading',
        videoId: videoData.id,
        filename: filename,
        filePath: filePath
      });

      // Download audio stream
      const audioStream = ytdl(`https://www.youtube.com/watch?v=${videoData.id}`, {
        quality: 'highestaudio',
        filter: 'audioonly',
        highWaterMark: 1 << 25 // 32MB chunk size
      });

      // Create write stream
      const writeStream = fs.createWriteStream(filePath);

      return new Promise((resolve, reject) => {
        // Handle stream events
        audioStream.on('progress', (chunkLength, downloaded, total) => {
          const progress = Math.floor((downloaded / total) * 100);
          console.log(`Download progress for ${videoData.title}: ${progress}%`);
        });

        audioStream.on('error', (error) => {
          this.activeDownloads.delete(downloadId);
          reject(new Error(`Download failed: ${error.message}`));
        });

        writeStream.on('error', (error) => {
          this.activeDownloads.delete(downloadId);
          reject(new Error(`File write failed: ${error.message}`));
        });

        writeStream.on('finish', () => {
          this.activeDownloads.delete(downloadId);
          resolve(filePath);
        });

        // Pipe audio to file
        audioStream.pipe(writeStream);
      });

    } catch (error) {
      this.activeDownloads.delete(downloadId);
      console.error('Download error:', error);
      throw error;
    }
  }

  cancelDownload(downloadId) {
    if (this.activeDownloads.has(downloadId)) {
      const download = this.activeDownloads.get(downloadId);
      // Note: ytdl-core doesn't have a direct cancel method
      // In a real implementation, you'd need to track and abort streams
      this.activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  }

  getActiveDownloads() {
    return Array.from(this.activeDownloads.entries()).map(([id, download]) => ({
      id,
      ...download
    }));
  }

  sanitizeFilename(filename) {
    // Remove invalid characters and limit length
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async getTrackInfo(videoId) {
    try {
      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      
      if (audioFormats.length === 0) {
        throw new Error('No audio formats available');
      }

      // Get the best quality audio format
      const bestAudio = audioFormats.reduce((prev, curr) => {
        return (parseInt(prev.audioBitrate) || 0) > (parseInt(curr.audioBitrate) || 0) ? prev : curr;
      });

      return {
        title: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds) * 1000,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        audioBitrate: bestAudio.audioBitrate,
        fileSize: bestAudio.contentLength
      };
    } catch (error) {
      console.error('Error getting track info:', error);
      throw error;
    }
  }
}