import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Edit2, 
  Check, 
  X, 
  Clock,
  Music,
  Heart,
  Download
} from 'lucide-react';
import { useDownload } from '../hooks/useDownloader';

const SongRow = ({ 
  track, 
  index, 
  isSelected, 
  onSelect, 
  onRename, 
  onDownload,
  playlistName 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(track.name);
  const [isPlaying, setIsPlaying] = useState(false);
  const { downloads } = useDownload();

  // Check if this track is currently downloading
  const currentDownload = downloads.find(d => d.trackId === track.id);

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(track.id);
  };

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== track.name) {
      onRename(track.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(track.name);
      setIsEditing(false);
    }
  };

  const handlePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  const handleDownload = () => {
    onDownload(track);
    setShowMenu(false);
  };

  const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAddedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'downloading': return 'text-blue-400';
      case 'searching': return 'text-yellow-400';
      case 'tagging': return 'text-purple-400';
      default: return 'text-spotify-gray-light';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={12} />;
      case 'error': return <X size={12} />;
      case 'downloading': return <Download size={12} className="animate-pulse" />;
      case 'searching': return <Music size={12} className="animate-pulse" />;
      case 'tagging': return <Edit2 size={12} className="animate-pulse" />;
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`song-row group relative ${
        isSelected ? 'bg-spotify-green bg-opacity-20' : ''
      }`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center space-x-3">
        <motion.div
          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-spotify-green border-spotify-green'
              : 'border-white border-opacity-50 hover:border-opacity-100'
          }`}
          onClick={handleSelect}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-black rounded"
            />
          )}
        </motion.div>

        {/* Track Number / Play Button */}
        <div className="w-6 flex items-center justify-center">
          {isHovered ? (
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-spotify-green transition-colors duration-200"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          ) : (
            <span className="text-spotify-gray-light text-sm">
              {index + 1}
            </span>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          {/* Album Art */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {track.images && track.images.length > 0 ? (
              <img
                src={track.images[track.images.length - 1].url}
                alt={track.album}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full bg-spotify-gray-medium flex items-center justify-center">
                <Music size={20} className="text-spotify-gray-light" />
              </div>
            )}
            
            {/* Fallback */}
            <div className="hidden w-full h-full bg-spotify-gray-medium items-center justify-center">
              <Music size={20} className="text-spotify-gray-light" />
            </div>
          </div>

          {/* Title and Artist */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyPress}
                  className="input-field text-white font-medium bg-transparent border-spotify-green p-1 rounded flex-1 text-sm"
                  autoFocus
                />
                <button onClick={handleRename} className="text-green-400 hover:text-green-300">
                  <Check size={14} />
                </button>
                <button onClick={() => {
                  setEditTitle(track.name);
                  setIsEditing(false);
                }} className="text-red-400 hover:text-red-300">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <h4 className="font-medium text-white text-sm truncate">
                {track.name}
              </h4>
            )}
            
            <p className="text-spotify-gray-light text-xs truncate">
              {track.artist} • {track.album}
            </p>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="hidden md:flex items-center space-x-4 text-spotify-gray-light text-sm">
        <span className="w-12 text-right">{formatDuration(track.duration)}</span>
        
        {/* Download Status */}
        {currentDownload && (
          <div className={`flex items-center space-x-1 ${getStatusColor(currentDownload.status)}`}>
            {getStatusIcon(currentDownload.status)}
            <span className="text-xs capitalize">{currentDownload.status}</span>
          </div>
        )}
      </div>

      {/* Added Date */}
      <div className="hidden lg:flex items-center text-spotify-gray-light text-sm">
        <span>{formatAddedDate(track.addedAt)}</span>
      </div>

      {/* Actions Menu */}
      <div className="flex items-center space-x-2">
        {/* Favorite Button */}
        <button className="opacity-0 group-hover:opacity-100 p-1 text-spotify-gray-light hover:text-white transition-all duration-200">
          <Heart size={14} />
        </button>

        {/* More Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-spotify-gray-light hover:text-white transition-all duration-200"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-spotify-gray-dark border border-spotify-gray-medium rounded-lg shadow-xl z-20"
              >
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200"
                >
                  <Edit2 size={16} />
                  <span>Rename</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200">
                  <Heart size={16} />
                  <span>Add to Favorites</span>
                </button>
                
                <div className="border-t border-spotify-gray-medium my-1" />
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200">
                  <Music size={16} />
                  <span>View on Spotify</span>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar for Active Downloads */}
      {currentDownload && currentDownload.status !== 'completed' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-spotify-gray-medium"
        >
          <motion.div
            className="h-full bg-spotify-green"
            initial={{ width: 0 }}
            animate={{ width: `${currentDownload.progress || 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongRow;