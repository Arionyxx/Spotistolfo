import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, LogIn, Settings, X } from 'lucide-react';
import { useAuth } from '../hooks/useSpotifyAuth';
import LoadingSpinner from './LoadingSpinner';

const AuthModal = () => {
  const { login, loading, error } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleLogin = async () => {
    if (clientId.trim()) {
      // Update client ID if provided
      // In a real implementation, you'd update the Spotify service config
    }
    
    const result = await login();
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
  };

  const handleSettingsSave = () => {
    // Save settings to local storage or state
    localStorage.setItem('spotify-client-id', clientId);
    localStorage.setItem('spotify-client-secret', clientSecret);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-2xl p-8 text-center">
          {/* Logo/Icon */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={40} className="text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SpotiLoader</h1>
            <p className="text-spotify-gray-light">
              Export your Spotify playlists as MP3s
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-left">
              <label className="block text-sm font-medium text-spotify-gray-light mb-2">
                Spotify Client ID (Optional)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Spotify Client ID"
                className="input-field w-full"
              />
              <p className="text-xs text-spotify-gray-light mt-1">
                Leave empty to use default app credentials
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-lg"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Connect Spotify</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary w-full flex items-center justify-center space-x-2 py-2"
              >
                <Settings size={16} />
                <span>Advanced Settings</span>
              </button>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-8 text-left"
          >
            <h3 className="text-white font-semibold mb-3">Features:</h3>
            <ul className="space-y-2 text-sm text-spotify-gray-light">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-spotify-green rounded-full"></div>
                <span>Browse your Spotify playlists</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-spotify-green rounded-full"></div>
                <span>Download tracks as high-quality MP3s</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-spotify-green rounded-full"></div>
                <span>Automatic metadata tagging</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-spotify-green rounded-full"></div>
                <span>Track download progress</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-spotify-gray-dark rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Advanced Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-spotify-gray-light hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-spotify-gray-light mb-2">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="your-client-id"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-spotify-gray-light mb-2">
                  Spotify Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="your-client-secret"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-spotify-gray-light mb-2">
                  Download Path
                </label>
                <input
                  type="text"
                  placeholder="/path/to/downloads"
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-rename"
                  className="rounded"
                />
                <label htmlFor="auto-rename" className="text-sm text-spotify-gray-light">
                  Auto-rename files with metadata
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSettingsSave}
                  className="btn-primary flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AuthModal;