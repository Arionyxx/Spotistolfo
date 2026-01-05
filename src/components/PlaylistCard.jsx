import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, MoreHorizontal, Edit2, Download } from 'lucide-react';

const PlaylistCard = ({ playlist, isSelected, onSelect, onRename, onDownload }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist.name);

  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(playlist.id);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== playlist.name) {
      onRename(playlist.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(playlist);
    setShowMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(playlist.name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="playlist-card group relative"
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
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
              className="w-3 h-3 bg-black rounded"
            />
          )}
        </motion.div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200"
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
                <span>Download Playlist</span>
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
            </motion.div>
          </>
        )}
      </div>

      {/* Playlist Image */}
      <div 
        className="relative aspect-square rounded-xl overflow-hidden mb-4 cursor-pointer"
        onClick={handleCardClick}
      >
        {playlist.image ? (
          <img
            src={playlist.image}
            alt={playlist.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-green-dark flex items-center justify-center">
            <Play size={48} className="text-black opacity-50" />
          </div>
        )}

        {/* Fallback for broken images */}
        <div className="hidden w-full h-full bg-gradient-to-br from-spotify-green to-spotify-green-dark items-center justify-center">
          <Play size={48} className="text-black opacity-50" />
        </div>

        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
        >
          <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg">
            <Play size={20} className="text-black ml-1" />
          </div>
        </motion.div>
      </div>

      {/* Playlist Info */}
      <div className="space-y-2" onClick={handleCardClick}>
        <div className="flex items-start justify-between">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="input-field text-white font-semibold text-sm bg-transparent border-spotify-green p-1 rounded flex-1"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 flex-1">
              {playlist.name}
            </h3>
          )}
        </div>

        <p className="text-spotify-gray-light text-xs">
          {playlist.trackCount} tracks • {playlist.owner}
        </p>

        {playlist.description && (
          <p className="text-spotify-gray-light text-xs line-clamp-2">
            {playlist.description}
          </p>
        )}

        {/* Playlist Stats */}
        <div className="flex items-center justify-between text-xs text-spotify-gray-light">
          <span className={`px-2 py-1 rounded-full text-xs ${
            playlist.isPublic 
              ? 'bg-blue-500 bg-opacity-20 text-blue-400' 
              : 'bg-purple-500 bg-opacity-20 text-purple-400'
          }`}>
            {playlist.isPublic ? 'Public' : 'Private'}
          </span>
          
          {playlist.isCollaborative && (
            <span className="px-2 py-1 rounded-full text-xs bg-green-500 bg-opacity-20 text-green-400">
              Collaborative
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;