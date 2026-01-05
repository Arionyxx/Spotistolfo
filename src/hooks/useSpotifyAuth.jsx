import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user data exists in storage
      const storedUser = await window.electronAPI.storeGet('user');
      if (storedUser.success && storedUser.value) {
        setUser(storedUser.value);
      } else {
        // Try to get fresh user data
        const userData = await window.electronAPI.getUser();
        if (userData.success) {
          setUser(userData.user);
          await window.electronAPI.storeSet('user', userData.user);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);
      const result = await window.electronAPI.login();

      if (result.success) {
        // Main process handles opening the browser with auth URL
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to initiate login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const handleCallback = useCallback(async (code) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await window.electronAPI.handleCallback(code);
      
      if (result.success) {
        // Get user data after successful authentication
        const userData = await window.electronAPI.getUser();
        if (userData.success) {
          setUser(userData.user);
          await window.electronAPI.storeSet('user', userData.user);
        }
        return { success: true };
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Callback error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear stored data
      await window.electronAPI.storeDelete('user');
      await window.electronAPI.storeDelete('authToken');
      await window.electronAPI.storeDelete('refreshToken');
      
      // Clear state
      setUser(null);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = await window.electronAPI.storeGet('refreshToken');
      if (!storedRefreshToken.success || !storedRefreshToken.value) {
        throw new Error('No refresh token available');
      }

      // Note: You would implement refresh logic here
      // For now, we'll just return a placeholder
      return { success: true };
    } catch (err) {
      console.error('Token refresh error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Set up auth state change listeners
  useEffect(() => {
    if (window.electronAPI) {
      const handleAuthenticated = (event, data) => {
        setUser(data.user);
        window.electronAPI.storeSet('user', data.user);
      };

      window.electronAPI.onAuthenticated(handleAuthenticated);

      return () => {
        window.electronAPI.removeAllListeners('spotify:authenticated');
      };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    handleCallback,
    logout,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};