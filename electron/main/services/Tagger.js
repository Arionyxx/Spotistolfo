import { parseBuffer } from 'music-metadata-browser';
import fs from 'fs-extra';
import path from 'path';

export class Tagger {
  constructor() {
    this.supportedFormats = ['.mp3', '.m4a', '.flac', '.ogg'];
  }

  async tagFile(filePath, trackData, videoData = null) {
    try {
      // Read the audio file
      const buffer = await fs.readFile(filePath);
      const metadata = await parseBuffer(buffer);

      // Get the file extension
      const ext = path.extname(filePath).toLowerCase();

      // Tag based on file format
      switch (ext) {
        case '.mp3':
          return await this.tagMP3(filePath, trackData, videoData);
        case '.m4a':
          return await this.tagM4A(filePath, trackData, videoData);
        case '.flac':
          return await this.tagFLAC(filePath, trackData, videoData);
        default:
          console.warn(`Unsupported format: ${ext}`);
          return filePath;
      }
    } catch (error) {
      console.error('Error tagging file:', error);
      // Return original file path if tagging fails
      return filePath;
    }
  }

  async tagMP3(filePath, trackData, videoData) {
    // For MP3 files, we'll use a simple approach
    // In a real implementation, you might want to use libraries like 'node-id3' or 'music-metadata'
    
    try {
      // Get current file stats
      const stats = await fs.stat(filePath);
      
      // Create a new filename with track information
      const filename = this.createFormattedFilename(trackData, '.mp3');
      const dir = path.dirname(filePath);
      const newFilePath = path.join(dir, filename);

      // If the filename would be different, rename the file
      if (newFilePath !== filePath) {
        await fs.move(filePath, newFilePath);
        return newFilePath;
      }

      return filePath;
    } catch (error) {
      console.error('Error tagging MP3:', error);
      return filePath;
    }
  }

  async tagM4A(filePath, trackData, videoData) {
    // Similar implementation for M4A files
    try {
      const filename = this.createFormattedFilename(trackData, '.m4a');
      const dir = path.dirname(filePath);
      const newFilePath = path.join(dir, filename);

      if (newFilePath !== filePath) {
        await fs.move(filePath, newFilePath);
        return newFilePath;
      }

      return filePath;
    } catch (error) {
      console.error('Error tagging M4A:', error);
      return filePath;
    }
  }

  async tagFLAC(filePath, trackData, videoData) {
    // Similar implementation for FLAC files
    try {
      const filename = this.createFormattedFilename(trackData, '.flac');
      const dir = path.dirname(filePath);
      const newFilePath = path.join(dir, filename);

      if (newFilePath !== filePath) {
        await fs.move(filePath, newFilePath);
        return newFilePath;
      }

      return filePath;
    } catch (error) {
      console.error('Error tagging FLAC:', error);
      return filePath;
    }
  }

  createFormattedFilename(trackData, extension) {
    // Create a clean filename from track data
    const artist = this.sanitizeFilename(trackData.artist || 'Unknown Artist');
    const title = this.sanitizeFilename(trackData.name || 'Unknown Title');
    const album = this.sanitizeFilename(trackData.album || 'Unknown Album');
    
    // Format: Artist - Title (Album)
    let filename = `${artist} - ${title}`;
    
    if (album !== 'Unknown Album') {
      filename += ` (${album})`;
    }
    
    filename += extension;
    
    return filename;
  }

  sanitizeFilename(filename) {
    // Remove invalid characters and clean up the filename
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim() // Remove leading/trailing whitespace
      .substring(0, 100); // Limit length
  }

  async getMetadata(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const metadata = await parseBuffer(buffer);
      
      return {
        title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: metadata.format.duration || 0,
        bitrate: metadata.format.bitrate || 0,
        sampleRate: metadata.format.sampleRate || 0,
        channels: metadata.format.numberOfChannels || 0,
        codec: metadata.format.codec || 'Unknown'
      };
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }

  async downloadAlbumArt(imageUrl, outputPath) {
    try {
      if (!imageUrl) {
        return null;
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download album art: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, buffer);
      
      return outputPath;
    } catch (error) {
      console.error('Error downloading album art:', error);
      return null;
    }
  }

  formatDuration(milliseconds) {
    if (!milliseconds || milliseconds === 0) {
      return '0:00';
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}