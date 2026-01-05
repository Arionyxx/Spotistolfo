import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Download, 
  Music, 
  Shield, 
  Info,
  Save,
  RotateCcw,
  FolderOpen,
  Key,
  Palette,
  Bell,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const [settings, setSettings] = useState({
    downloadPath: '',
    autoRename: true,
    audioQuality: 'high',
    concurrentDownloads: 3,
    autoRefreshToken: true,
    notifications: true,
    darkMode: true,
    spotifyClientId: '',
    spotifyClientSecret: '',
    youtubeApiKey: '',
    downloadHistory: true,
    metadataTagging: true,
    albumArtDownload: true,
    retryFailed: true,
    maxRetries: 3
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('downloads');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load settings from electron-store
      const userSettingsResult = await window.electronAPI.storeGet('userSettings');
      
      if (userSettingsResult.success && userSettingsResult.value) {
        setSettings(prev => ({ ...prev, ...userSettingsResult.value }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('Attempting to save settings:', settings);
      
      // Validate that we have at least a client ID if it was entered
      if (settings.spotifyClientId) {
        console.log('Client ID to save:', settings.spotifyClientId);
      }
      
      // Save to electron-store
      const result = await window.electronAPI.storeSet('userSettings', settings);
      
      if (result && result.success === false) {
        throw new Error(result.error || 'Failed to save settings');
      }
      
      // Verify the save by immediately reading it back
      const readResult = await window.electronAPI.storeGet('userSettings');
      console.log('Verified saved data:', readResult.value);
      
      setHasChanges(false);
      console.log('✓ Settings saved successfully');
    } catch (error) {
      console.error('✗ Failed to save settings:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      downloadPath: '',
      autoRename: true,
      audioQuality: 'high',
      concurrentDownloads: 3,
      autoRefreshToken: true,
      notifications: true,
      darkMode: true,
      spotifyClientId: '',
      spotifyClientSecret: '',
      youtubeApiKey: '',
      downloadHistory: true,
      metadataTagging: true,
      albumArtDownload: true,
      retryFailed: true,
      maxRetries: 3
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const selectDownloadFolder = async () => {
    try {
      const result = await window.electronAPI.selectFolder();
      
      if (result.success) {
        handleSettingChange('downloadPath', result.path);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const testConnection = async (service) => {
    // Implement connection testing for Spotify, YouTube, etc.
    console.log(`Testing connection to ${service}...`);
  };

  const tabs = [
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'quality', label: 'Quality', icon: Music },
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'about', label: 'About', icon: Info }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
        <p className="text-spotify-gray-light ml-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-spotify-gray-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-spotify-gray-light">
              Configure your SpotiLoader preferences
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={resetSettings}
                className="btn-secondary flex items-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </motion.button>
            )}
            
            <button
              onClick={saveSettings}
              disabled={!hasChanges || saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <LoadingSpinner size="small" />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-spotify-gray-dark border-r border-spotify-gray-dark p-4">
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-spotify-green bg-opacity-20 text-spotify-green'
                      : 'text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Downloads Tab */}
            {activeTab === 'downloads' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Download Settings</h2>
                
                {/* Download Path */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Download Location
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={settings.downloadPath}
                      onChange={(e) => handleSettingChange('downloadPath', e.target.value)}
                      placeholder="Select download folder"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={selectDownloadFolder}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FolderOpen size={16} />
                      <span>Browse</span>
                    </button>
                  </div>
                  <p className="text-xs text-spotify-gray-light">
                    Where downloaded files will be saved
                  </p>
                </div>

                {/* Auto Rename */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Auto-rename files</label>
                    <p className="text-xs text-spotify-gray-light">
                      Automatically rename files using metadata
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoRename}
                      onChange={(e) => handleSettingChange('autoRename', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                {/* Concurrent Downloads */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Concurrent Downloads: {settings.concurrentDownloads}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.concurrentDownloads}
                    onChange={(e) => handleSettingChange('concurrentDownloads', parseInt(e.target.value))}
                    className="w-full h-2 bg-spotify-gray-medium rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-spotify-gray-light">
                    Number of downloads to run simultaneously
                  </p>
                </div>

                {/* Download History */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Keep download history</label>
                    <p className="text-xs text-spotify-gray-light">
                      Store information about completed downloads
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.downloadHistory}
                      onChange={(e) => handleSettingChange('downloadHistory', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                {/* Retry Failed */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Auto-retry failed downloads</label>
                    <p className="text-xs text-spotify-gray-light">
                      Automatically retry failed downloads
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.retryFailed}
                      onChange={(e) => handleSettingChange('retryFailed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                {/* Max Retries */}
                {settings.retryFailed && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Max Retries: {settings.maxRetries}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.maxRetries}
                      onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                      className="w-full h-2 bg-spotify-gray-medium rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Quality Tab */}
            {activeTab === 'quality' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Audio Quality</h2>
                
                {/* Audio Quality */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Audio Quality
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Low (128 kbps)', desc: 'Smaller file size' },
                      { value: 'medium', label: 'Medium (192 kbps)', desc: 'Balanced quality and size' },
                      { value: 'high', label: 'High (320 kbps)', desc: 'Best quality available' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="audioQuality"
                          value={option.value}
                          checked={settings.audioQuality === option.value}
                          onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                          className="w-4 h-4 text-spotify-green bg-transparent border-spotify-gray-medium focus:ring-spotify-green focus:ring-2"
                        />
                        <div>
                          <span className="text-white font-medium">{option.label}</span>
                          <p className="text-xs text-spotify-gray-light">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Metadata Tagging */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Metadata tagging</label>
                    <p className="text-xs text-spotify-gray-light">
                      Add ID3 tags to downloaded files
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.metadataTagging}
                      onChange={(e) => handleSettingChange('metadataTagging', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                {/* Album Art Download */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Download album art</label>
                    <p className="text-xs text-spotify-gray-light">
                      Embed album artwork in downloaded files
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.albumArtDownload}
                      onChange={(e) => handleSettingChange('albumArtDownload', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Authentication Tab */}
            {activeTab === 'auth' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Authentication</h2>
                
                {/* Spotify Client ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Spotify Client ID
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={settings.spotifyClientId}
                      onChange={(e) => handleSettingChange('spotifyClientId', e.target.value)}
                      placeholder="Your Spotify Client ID"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => testConnection('spotify')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Test</span>
                    </button>
                  </div>
                  <p className="text-xs text-spotify-gray-light">
                    Required for Spotify API access
                  </p>
                </div>

                {/* Spotify Client Secret */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Spotify Client Secret
                  </label>
                  <input
                    type="password"
                    value={settings.spotifyClientSecret}
                    onChange={(e) => handleSettingChange('spotifyClientSecret', e.target.value)}
                    placeholder="Your Spotify Client Secret"
                    className="input-field"
                  />
                  <p className="text-xs text-spotify-gray-light">
                    Keep this secret and secure
                  </p>
                </div>

                {/* YouTube API Key */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    YouTube API Key (Optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={settings.youtubeApiKey}
                      onChange={(e) => handleSettingChange('youtubeApiKey', e.target.value)}
                      placeholder="Your YouTube API Key"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => testConnection('youtube')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Test</span>
                    </button>
                  </div>
                  <p className="text-xs text-spotify-gray-light">
                    Improves search accuracy and reliability
                  </p>
                </div>

                {/* Auto Refresh Token */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Auto-refresh tokens</label>
                    <p className="text-xs text-spotify-gray-light">
                      Automatically refresh expired authentication tokens
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoRefreshToken}
                      onChange={(e) => handleSettingChange('autoRefreshToken', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                  <h3 className="text-blue-400 font-medium mb-2 flex items-center space-x-2">
                    <Shield size={16} />
                    <span>Security Note</span>
                  </h3>
                  <p className="text-blue-300 text-sm">
                    Your API credentials are stored locally and encrypted. Never share your client secret with others.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Appearance</h2>
                
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Dark mode</label>
                    <p className="text-xs text-spotify-gray-light">
                      Use dark theme throughout the application
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                <div className="bg-spotify-gray-dark rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Theme Preview</h3>
                  <div className="bg-spotify-black rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-spotify-green rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-white bg-opacity-20 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-spotify-gray-light rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-2 bg-spotify-gray-medium rounded w-full"></div>
                    <div className="h-2 bg-spotify-gray-medium rounded w-5/6"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Notifications</h2>
                
                {/* Enable Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Enable notifications</label>
                    <p className="text-xs text-spotify-gray-light">
                      Show desktop notifications for download status
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spotify-gray-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
                  </label>
                </div>

                <div className="bg-spotify-gray-dark rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Notification Types</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-spotify-green bg-transparent border-spotify-gray-medium rounded focus:ring-spotify-green focus:ring-2"
                      />
                      <span className="text-white text-sm">Download completed</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-spotify-green bg-transparent border-spotify-gray-medium rounded focus:ring-spotify-green focus:ring-2"
                      />
                      <span className="text-white text-sm">Download failed</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-spotify-green bg-transparent border-spotify-gray-medium rounded focus:ring-spotify-green focus:ring-2"
                      />
                      <span className="text-white text-sm">Authentication expired</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">About SpotiLoader</h2>
                
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-spotify-green rounded-full flex items-center justify-center mx-auto">
                    <Music size={40} className="text-black" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white">SpotiLoader</h3>
                    <p className="text-spotify-gray-light">Version 1.0.0</p>
                  </div>
                  
                  <p className="text-spotify-gray-light max-w-md mx-auto">
                    A modern desktop application for downloading and managing your Spotify playlists as MP3 files.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-dark rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-3">Features</h4>
                    <ul className="space-y-2 text-sm text-spotify-gray-light">
                      <li>• Browse and manage Spotify playlists</li>
                      <li>• Download tracks as high-quality MP3s</li>
                      <li>• Automatic metadata tagging</li>
                      <li>• Progress tracking and download history</li>
                      <li>• Modern, responsive UI</li>
                    </ul>
                  </div>
                  
                  <div className="glass-dark rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-3">Support</h4>
                    <div className="space-y-3">
                      <a
                        href="https://github.com/spotloader"
                        className="flex items-center space-x-2 text-spotify-green hover:text-spotify-green-dark transition-colors duration-200"
                      >
                        <ExternalLink size={16} />
                        <span>GitHub Repository</span>
                      </a>
                      <a
                        href="https://docs.spotloader.com"
                        className="flex items-center space-x-2 text-spotify-green hover:text-spotify-green-dark transition-colors duration-200"
                      >
                        <HelpCircle size={16} />
                        <span>Documentation</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-spotify-gray-dark rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-3">Legal</h4>
                  <p className="text-xs text-spotify-gray-light">
                    SpotiLoader is not affiliated with Spotify. This application uses the Spotify Web API 
                    and is intended for personal use only. Users are responsible for complying with 
                    Spotify's Terms of Service and applicable copyright laws.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;