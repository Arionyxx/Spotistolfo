import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Pause, 
  Shuffle, 
  MoreHorizontal,
  Heart,
  Plus,
  Check
} from 'lucide-react';
import SongRow from '../components/SongRow';
import ProgressBar, { BatchProgressBar } from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useSpotifyAuth';
import { useDownload } from '../hooks/useDownloader';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addToQueue, 
    startBatchDownload, 
    downloads, 
    queue,
    getDownloadStats,
    getQueueStats
  } = useDownload();
  
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadPlaylistData();
  }, [id]);

  const loadPlaylistData = async () => {
    try {
      setLoading(true);
      
      // Load playlist info (we'll need to store this from the main playlists fetch)
      // For now, we'll simulate it
      const mockPlaylist = {
        id: id,
        name: 'My Favorite Songs',
        description: 'A collection of my all-time favorite tracks',
        image: null,
        trackCount: 0,
        owner: user?.display_name || 'You',
        isPublic: false,
        isCollaborative: false
      };
      
      // Load tracks
      const result = await window.electronAPI.getPlaylistTracks(id);
      
      if (result.success) {
        setTracks(result.tracks);
        mockPlaylist.trackCount = result.tracks.length;
      }
      
      setPlaylist(mockPlaylist);
    } catch (error) {
      console.error('Failed to load playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = (trackId) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleTrackRename = async (trackId, newTitle) => {
    try {
      // Update local state
      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, name: newTitle }
          : track
      ));

      // Save to persistent storage
      await window.electronAPI.storeSet(`track_rename_${trackId}`, newTitle);
    } catch (error) {
      console.error('Failed to rename track:', error);
    }
  };

  const handleDownloadTrack = async (track) => {
    try {
      setIsDownloading(true);
      
      // Get download path
      const pathResult = await window.electronAPI.getDownloadPath();
      const outputPath = pathResult.success ? pathResult.path : null;

      if (!outputPath) {
        // Show error - no download path set
        return;
      }

      // Add to download queue
      addToQueue([track], playlist.name);
      
      // Start download
      await startBatchDownload([`${track.id}_${Date.now()}`], outputPath);
      
    } catch (error) {
      console.error('Failed to download track:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedTracks.size === 0) return;

    try {
      setIsDownloading(true);
      
      // Get download path
      const pathResult = await window.electronAPI.getDownloadPath();
      const outputPath = pathResult.success ? pathResult.path : null;

      if (!outputPath) {
        // Show error - no download path set
        return;
      }

      // Get tracks to download
      const tracksToDownload = tracks.filter(track => selectedTracks.has(track.id));
      
      // Add to download queue
      const trackIds = addToQueue(tracksToDownload, playlist.name);
      
      // Start batch download
      await startBatchDownload(trackIds, outputPath);
      
      setSelectedTracks(new Set());
      
    } catch (error) {
      console.error('Failed to download selected tracks:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(tracks.map(track => track.id)));
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
  const downloadStats = getDownloadStats();
  const queueStats = getQueueStats();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
        <p className="text-spotify-gray-light ml-4">Loading playlist...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Playlist not found</h2>
        <p className="text-spotify-gray-light">The playlist you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-spotify-gray-dark to-spotify-black p-8">
        <div className="flex items-center space-x-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-full transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Playlist Image */}
          <div className="w-48 h-48 rounded-xl overflow-hidden shadow-2xl">
            {playlist.image ? (
              <img
                src={playlist.image}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-green-dark flex items-center justify-center">
                <Play size={64} className="text-black opacity-50" />
              </div>
            )}
          </div>

          {/* Playlist Info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-spotify-gray-light uppercase tracking-wider mb-2">
              Playlist
            </p>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              {playlist.name}
            </h1>
            
            {playlist.description && (
              <p className="text-spotify-gray-light text-lg mb-4 max-w-2xl">
                {playlist.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 text-spotify-gray-light">
              <span className="font-medium text-white">{playlist.owner}</span>
              <span>•</span>
              <span>{playlist.trackCount} songs</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
              {playlist.isPublic && (
                <>
                  <span>•</span>
                  <span>Public</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-spotify-black bg-opacity-50 backdrop-blur-sm border-b border-spotify-gray-dark p-6">
        <div className="flex items-center justify-between">
          {/* Play Controls */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 bg-spotify-green hover:bg-spotify-green-dark rounded-full flex items-center justify-center text-black transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            <button className="p-3 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-full transition-all duration-200">
              <Heart size={24} />
            </button>
            
            <button className="p-3 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-full transition-all duration-200">
              <MoreHorizontal size={24} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {selectedTracks.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDownloadSelected}
                disabled={isDownloading}
                className="btn-primary flex items-center space-x-2"
              >
                {isDownloading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Download size={16} />
                )}
                <span>Download Selected ({selectedTracks.size})</span>
              </motion.button>
            )}
            
            <button
              onClick={handleSelectAll}
              className="btn-secondary flex items-center space-x-2"
            >
              <Check size={16} />
              <span>
                {selectedTracks.size === tracks.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
        </div>

        {/* Download Stats */}
        {(downloadStats.total > 0 || queueStats.total > 0) && (
          <div className="mt-4 pt-4 border-t border-spotify-gray-dark">
            <BatchProgressBar
              total={downloadStats.total}
              completed={downloadStats.completed}
              failed={downloadStats.failed}
              inProgress={downloadStats.downloading}
            />
          </div>
        )}
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-auto">
        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-spotify-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <Play size={32} className="text-spotify-gray-light" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
            <p className="text-spotify-gray-light">
              This playlist doesn't contain any tracks or the tracks couldn't be loaded.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Table Header */}
            <div className="flex items-center text-spotify-gray-light text-sm font-medium mb-4 pb-2 border-b border-spotify-gray-dark">
              <div className="w-12 flex items-center justify-center">
                <span>#</span>
              </div>
              <div className="w-12"></div>
              <div className="flex-1">Title</div>
              <div className="hidden md:block w-32">Duration</div>
              <div className="hidden lg:block w-24">Added</div>
              <div className="w-16"></div>
            </div>

            {/* Track Rows */}
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <SongRow
                  key={track.id}
                  track={track}
                  index={index}
                  isSelected={selectedTracks.has(track.id)}
                  onSelect={handleTrackSelect}
                  onRename={handleTrackRename}
                  onDownload={handleDownloadTrack}
                  playlistName={playlist.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;