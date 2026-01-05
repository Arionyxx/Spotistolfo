import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Music, 
  Download, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Library',
      description: 'Browse playlists'
    },
    {
      path: '/downloads',
      icon: Download,
      label: 'Downloads',
      description: 'Track history'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Preferences'
    }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-spotify-gray-dark">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-spotify-green rounded-lg flex items-center justify-center">
            <Music size={18} className="text-black" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-white font-bold text-lg">SpotiLoader</h1>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-spotify-gray-light">
                    {item.description}
                  </div>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="p-4 border-t border-spotify-gray-dark"
        >
          <div className="glass-dark rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-full flex items-center justify-center">
                <span className="text-black font-semibold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  Spotify User
                </p>
                <p className="text-spotify-gray-light text-xs">
                  Free Account
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Collapse Toggle */}
      <div className="p-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 text-spotify-gray-light hover:text-white hover:bg-spotify-gray-dark rounded-lg transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 64 : 256
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-spotify-gray-dark border-r border-spotify-gray-dark z-40"
    >
      <SidebarContent />
    </motion.aside>
  );
};

export default Sidebar;