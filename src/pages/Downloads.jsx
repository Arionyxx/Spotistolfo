import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  Search, 
  Filter,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { useDownload } from '../hooks/useDownloader.jsx';

const Downloads = () => {
  const { 
    downloads, 
    queue,
    clearCompleted, 
    removeFromQueue,
    clearQueue,
    getDownloadStats,
    getQueueStats
  } = useDownload();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const downloadStats = getDownloadStats();
  const queueStats = getQueueStats();

  const filteredDownloads = downloads
    .filter(download => {
      const matchesSearch = 
        download.trackName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        download.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        download.album?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || download.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
        case 'name':
          return (a.trackName || '').localeCompare(b.trackName || '');
        case 'status':
          return a.status.localeCompare(b.status);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

  const filteredQueue = queue.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'error':
        return <XCircle size={16} className="text-red-400" />;
      case 'downloading':
      case 'starting':
      case 'searching':
      case 'tagging':
        return <Download size={16} className="text-blue-400 animate-pulse" />;
      default:
        return <Clock size={16} className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'downloading':
      case 'starting':
      case 'searching':
      case 'tagging':
        return 'text-blue-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-spotify-gray-dark">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Downloads</h1>
            <p className="text-spotify-gray-light">
              Track your download progress and manage completed files
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {(downloadStats.completed > 0 || queueStats.total > 0) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearCompleted}
                className="btn-secondary flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Clear Completed</span>
              </motion.button>
            )}
            
            <button className="btn-primary flex items-center space-x-2">
              <FolderOpen size={16} />
              <span>Open Downloads Folder</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-dark rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{downloadStats.completed}</p>
                <p className="text-sm text-spotify-gray-light">Completed</p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{downloadStats.downloading}</p>
                <p className="text-sm text-spotify-gray-light">Downloading</p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{downloadStats.failed}</p>
                <p className="text-sm text-spotify-gray-light">Failed</p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{queueStats.total}</p>
                <p className="text-sm text-spotify-gray-light">In Queue</p>
              </div>
            </div>
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
                placeholder="Search downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-80"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="downloading">Downloading</option>
              <option value="error">Failed</option>
              <option value="queued">Queued</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="progress">Sort by Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Active Downloads */}
        {(downloadStats.downloading > 0 || queueStats.total > 0) && (
          <div className="p-6 border-b border-spotify-gray-dark">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Download size={20} className="text-blue-400" />
              <span>Active Downloads</span>
            </h2>

            <div className="space-y-4">
              {downloads
                .filter(d => ['starting', 'downloading', 'searching', 'tagging'].includes(d.status))
                .map(download => (
                  <div key={download.id} className="glass-dark rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(download.status)}
                        <div>
                          <h4 className="font-medium text-white">
                            {download.trackName || 'Unknown Track'}
                          </h4>
                          <p className="text-sm text-spotify-gray-light">
                            {download.artist || 'Unknown Artist'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(download.status)}`}>
                          {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                        </p>
                        <p className="text-xs text-spotify-gray-light">
                          {download.startedAt && formatDate(download.startedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <ProgressBar
                      progress={download.progress || 0}
                      status={download.status}
                      showLabel={false}
                      size="medium"
                    />
                  </div>
                ))}

              {/* Queue Items */}
              {filteredQueue.map(item => (
                <div key={item.id} className="glass-dark rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock size={16} className="text-yellow-400" />
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-spotify-gray-light">{item.artist}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-spotify-gray-light hover:text-red-400 transition-colors duration-200"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download History */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Calendar size={20} />
              <span>Download History</span>
            </h2>
            
            {filteredDownloads.length > 0 && (
              <p className="text-sm text-spotify-gray-light">
                {filteredDownloads.length} download{filteredDownloads.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {filteredDownloads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-spotify-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <Download size={32} className="text-spotify-gray-light" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {downloads.length === 0 ? 'No downloads yet' : 'No downloads match your filters'}
              </h3>
              <p className="text-spotify-gray-light max-w-md mx-auto">
                {downloads.length === 0 
                  ? 'Start downloading tracks from your playlists to see them here.'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDownloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-dark rounded-lg p-4 hover:bg-spotify-gray-dark transition-all duration-200 ${
                    download.status === 'error' ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {getStatusIcon(download.status)}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {download.trackName || 'Unknown Track'}
                        </h4>
                        <p className="text-sm text-spotify-gray-light truncate">
                          {download.artist || 'Unknown Artist'} • {download.album || 'Unknown Album'}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-spotify-gray-light">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{download.startedAt && formatDate(download.startedAt)}</span>
                          </span>
                          
                          {download.estimatedDuration && (
                            <span className="flex items-center space-x-1">
                              <span>~{formatDuration(download.estimatedDuration)}</span>
                            </span>
                          )}
                          
                          {download.filePath && (
                            <span className="flex items-center space-x-1">
                              <FolderOpen size={12} />
                              <span>Downloaded</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(download.status)}`}>
                          {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                        </p>
                        
                        {download.status === 'completed' && download.completedAt && (
                          <p className="text-xs text-spotify-gray-light">
                            {formatDate(download.completedAt)}
                          </p>
                        )}
                        
                        {download.error && (
                          <p className="text-xs text-red-400 mt-1 max-w-xs truncate" title={download.error}>
                            {download.error}
                          </p>
                        )}
                      </div>

                      {download.status === 'completed' && (
                        <button className="p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-medium rounded-lg transition-all duration-200">
                          <Play size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {download.status === 'error' && download.error && (
                    <div className="mt-3 pt-3 border-t border-red-500 border-opacity-20">
                      <p className="text-sm text-red-400">{download.error}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Downloads;