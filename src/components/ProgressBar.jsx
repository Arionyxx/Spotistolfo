import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Download, Music, Edit2 } from 'lucide-react';

const ProgressBar = ({ 
  progress = 0, 
  status = 'idle', 
  label = '', 
  showLabel = true,
  size = 'medium',
  color = 'spotify-green'
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-green-400" />;
      case 'error':
        return <X size={16} className="text-red-400" />;
      case 'downloading':
        return <Download size={16} className="text-blue-400 animate-pulse" />;
      case 'searching':
        return <Music size={16} className="text-yellow-400 animate-pulse" />;
      case 'tagging':
        return <Edit2 size={16} className="text-purple-400 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready';
      case 'searching':
        return 'Searching...';
      case 'downloading':
        return 'Downloading...';
      case 'tagging':
        return 'Tagging...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="w-full">
      {/* Label and Status */}
      {showLabel && (label || getStatusText()) && (
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium text-white ${textSizeClasses[size]}`}>
            {label}
          </span>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-spotify-gray-light ${textSizeClasses[size]}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`progress-bar ${sizeClasses[size]} relative overflow-hidden`}>
        <motion.div
          className={`progress-fill ${color === 'spotify-green' ? 'bg-spotify-green' : 'bg-blue-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Animated background for active states */}
        {(status === 'searching' || status === 'downloading' || status === 'tagging') && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-20 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </div>

      {/* Progress Percentage */}
      {status !== 'completed' && status !== 'error' && (
        <div className="flex justify-between items-center mt-1">
          <span className={`text-spotify-gray-light ${textSizeClasses[size]}`}>
            {Math.round(progress)}%
          </span>
          
          {status === 'downloading' && (
            <span className={`text-spotify-gray-light ${textSizeClasses[size]}`}>
              {Math.round(progress * 10) / 10}% complete
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized components for different use cases
export const DownloadProgressBar = ({ download, showLabel = true }) => {
  const getDownloadLabel = () => {
    if (download.trackName) {
      return `${download.trackName} - ${download.artist}`;
    }
    return `Download ${download.id}`;
  };

  return (
    <ProgressBar
      progress={download.progress}
      status={download.status}
      label={getDownloadLabel()}
      showLabel={showLabel}
      size="medium"
    />
  );
};

export const BatchProgressBar = ({ total, completed, failed, inProgress = 0 }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const overallStatus = failed > 0 ? 'error' : completed === total ? 'completed' : 'downloading';

  return (
    <div className="space-y-2">
      <ProgressBar
        progress={progress}
        status={overallStatus}
        label={`Overall Progress (${completed}/${total} completed)`}
        showLabel={true}
        size="large"
      />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-spotify-gray-light">
          {inProgress} in progress
        </span>
        {failed > 0 && (
          <span className="text-red-400">
            {failed} failed
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;