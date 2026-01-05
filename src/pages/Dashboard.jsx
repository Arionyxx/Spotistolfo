import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Grid, List, Search, Filter } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard';
import { useAuth } from '../hooks/useSpotifyAuth';
import { useDownload } from '../hooks/useDownloader';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToQueue } = useDownload();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'tracks', 'date'

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.getPlaylists();
      
      if (result.success) {
        setPlaylists(result.playlists);
      } else {
        console.error('Failed to load playlists:', result.error);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = (playlistId) => {
    setSelectedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const handlePlaylistRename = async (playlistId, newName) => {
    try {
      // Update local state
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, name: newName }
          : playlist
      ));

      // Save to persistent storage
      await window.electronAPI.storeSet(`playlist_rename_${playlistId}`, newName);
    } catch (error) {
      console.error('Failed to rename playlist:', error);
    }
  };

  const handleDownloadPlaylist = async (playlist) => {
    try {
      // Get tracks for the playlist
      const result = await window.electronAPI.getPlaylistTracks(playlist.id);
      
      if (result.success) {
        // Add all tracks to download queue
        const trackIds = addToQueue(result.tracks, playlist.name);
        
        // Show success message (in a real app, you'd use a toast library)
        console.log(`Added ${result.tracks.length} tracks to download queue`);
      }
    } catch (error) {
      console.error('Failed to download playlist:', error);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPlaylists.size === 0) return;

    try {
      // Get download path
      const pathResult = await window.electronAPI.getDownloadPath();
      const outputPath = pathResult.success ? pathResult.path : null;

      if (!outputPath) {
        // Show error - no download path set
        return;
      }

      // Download each selected playlist
      for (const playlistId of selectedPlaylists) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
          await handleDownloadPlaylist(playlist);
        }
      }

      setSelectedPlaylists(new Set());
    } catch (error) {
      console.error('Failed to download selected playlists:', error);
    }
  };

  const filteredAndSortedPlaylists = playlists
    .filter(playlist => 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.owner.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'tracks':
          return b.trackCount - a.trackCount;
        case 'date':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const selectAllPlaylists = () => {
    if (selectedPlaylists.size === filteredAndSortedPlaylists.length) {
      setSelectedPlaylists(new Set());
    } else {
      setSelectedPlaylists(new Set(filteredAndSortedPlaylists.map(p => p.id)));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-spotify-gray-light">Loading your playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="p-6 border-b border-spotify-gray-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Library</h1>
            <p className="text-spotify-gray-light">
              {filteredAndSortedPlaylists.length} of {playlists.length} playlists
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedPlaylists.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDownloadSelected}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Download Selected ({selectedPlaylists.size})</span>
              </motion.button>
            )}
            
            <button className="btn-secondary flex items-center space-x-2">
              <Plus size={16} />
              <span>Create Playlist</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-gray-light" />
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-80"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="tracks">Sort by Track Count</option>
              <option value="date">Sort by Date</option>
            </select>

            {/* Filter */}
            <button className="btn-secondary flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Select All */}
            <button
              onClick={selectAllPlaylists}
              className="text-sm text-spotify-gray-light hover:text-white transition-colors duration-200"
            >
              {selectedPlaylists.size === filteredAndSortedPlaylists.length ? 'Deselect All' : 'Select All'}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-spotify-gray-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-spotify-green text-black' 
                    : 'text-spotify-gray-light hover:text-white'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-spotify-green text-black' 
                    : 'text-spotify-gray-light hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedPlaylists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-spotify-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-spotify-gray-light" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No playlists found' : 'No playlists available'}
            </h3>
            <p className="text-spotify-gray-light max-w-md mx-auto">
              {searchTerm 
                ? `No playlists match your search for "${searchTerm}". Try adjusting your search terms.`
                : 'Connect your Spotify account to see your playlists here.'
              }
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <PlaylistCard
                    playlist={playlist}
                    isSelected={selectedPlaylists.has(playlist.id)}
                    onSelect={handlePlaylistSelect}
                    onRename={handlePlaylistRename}
                    onDownload={handleDownloadPlaylist}
                  />
                ) : (
                  // List view - simplified card design
                  <div className="card flex items-center space-x-4 p-4">
                    <input
                      type="checkbox"
                      checked={selectedPlaylists.has(playlist.id)}
                      onChange={() => handlePlaylistSelect(playlist.id)}
                      className="w-4 h-4 text-spotify-green bg-transparent border-spotify-gray-medium rounded focus:ring-spotify-green focus:ring-2"
                    />
                    
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {playlist.image ? (
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-spotify-gray-medium flex items-center justify-center">
                          <Grid size={24} className="text-spotify-gray-light" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                      <p className="text-spotify-gray-light text-sm">
                        {playlist.trackCount} tracks • {playlist.owner}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDownloadPlaylist(playlist)}
                      className="btn-primary"
                    >
                      Download
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;