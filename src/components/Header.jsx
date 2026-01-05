import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Menu, 
  Bell, 
  User,
  LogOut,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../hooks/useSpotifyAuth';
import { useDownload } from '../hooks/useDownloader';

const Header = ({ user, onSidebarToggle, sidebarCollapsed }) => {
  const { logout } = useAuth();
  const { getDownloadStats } = useDownload();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const stats = getDownloadStats();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-spotify-black bg-opacity-80 backdrop-blur-sm border-b border-spotify-gray-dark px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-lg transition-all duration-200"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-gray-light" 
            />
            <input
              type="text"
              placeholder="Search playlists, tracks, artists..."
              className="input-field pl-10 w-96 bg-spotify-gray-dark"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Download Stats */}
          {stats.downloading > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 bg-spotify-green bg-opacity-20 text-spotify-green px-3 py-1 rounded-full text-sm"
            >
              <Download size={14} />
              <span>{stats.downloading} downloading</span>
            </motion.div>
          )}

          {/* Notifications */}
          <button className="p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-lg transition-all duration-200 relative">
            <Bell size={18} />
            {stats.failed > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.failed}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-lg transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-full flex items-center justify-center">
                <User size={16} className="text-black" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  {user?.display_name || 'User'}
                </p>
                <p className="text-xs text-spotify-gray-light">
                  {user?.product || 'Free'} Account
                </p>
              </div>
              <MoreHorizontal size={16} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-spotify-gray-dark border border-spotify-gray-medium rounded-lg shadow-xl z-20"
                >
                  <div className="p-3 border-b border-spotify-gray-medium">
                    <p className="text-white font-medium text-sm">
                      {user?.display_name || 'User'}
                    </p>
                    <p className="text-spotify-gray-light text-xs">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to settings
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to downloads
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium text-sm transition-all duration-200"
                    >
                      <Download size={16} />
                      <span>Downloads</span>
                    </button>
                    
                    <div className="border-t border-spotify-gray-medium my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 text-sm transition-all duration-200"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Header */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            {getPageTitle()}
          </h2>
          {getPageSubtitle() && (
            <p className="text-spotify-gray-light text-sm">
              {getPageSubtitle()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {getActionButtons()}
        </div>
      </div>
    </header>
  );

  function getPageTitle() {
    const path = window.location.pathname;
    if (path === '/') return 'Your Library';
    if (path.startsWith('/playlist/')) return 'Playlist';
    if (path === '/downloads') return 'Downloads';
    if (path === '/settings') return 'Settings';
    return 'SpotiLoader';
  }

  function getPageSubtitle() {
    const path = window.location.pathname;
    if (path === '/') return `${stats.total} playlists`;
    if (path === '/downloads') return `${stats.completed} completed downloads`;
    if (path === '/settings') return 'Manage your preferences';
    return null;
  }

  function getActionButtons() {
    const path = window.location.pathname;
    
    if (path === '/') {
      return (
        <>
          <button className="btn-secondary">
            <Download size={16} className="mr-2" />
            Import Playlists
          </button>
        </>
      );
    }
    
    if (path.startsWith('/playlist/')) {
      return (
        <>
          <button className="btn-secondary">
            <Download size={16} className="mr-2" />
            Select All
          </button>
          <button className="btn-primary">
            <Download size={16} className="mr-2" />
            Download Selected
          </button>
        </>
      );
    }
    
    if (path === '/downloads') {
      return (
        <>
          <button className="btn-secondary">
            <Download size={16} className="mr-2" />
            Open Downloads Folder
          </button>
        </>
      );
    }

    return null;
  }
};

export default Header;