import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      console.log('✅ User refreshed:', currentUser);
      
      // If we have a user, make sure we're not loading anymore
      if (currentUser) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    }
  };

  const login = async () => {
    try {
      console.log('🔐 Starting login process...');
      const newUser = await authService.login();
      console.log('✅ Login completed, got user:', newUser);
      
      if (newUser) {
        // Set user directly from login response
        setUser(newUser);
        console.log('✅ User set directly from login');
      } else {
        // Fallback to refresh if no user returned
        await refreshUser();
        console.log('✅ User refreshed after login');
      }
      
      console.log('✅ Login process completed successfully');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing auth...');
        console.log('🔍 Current URL:', window.location.href);
        
        // Check if we're returning from login
        if (window.location.href.includes('id_token=') || window.location.href.includes('access_token=')) {
          console.log('🔍 Detected OIDC callback, completing login...');
          const newUser = await authService.completeLogin();
          if (newUser) {
            setUser(newUser);
            console.log('✅ OIDC login completed, user set:', newUser);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          console.log('🔍 No OIDC callback, checking for existing user...');
          // Check for existing user
          await refreshUser();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('🔍 Auth initialization completed, loading set to false');
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!user.accessToken,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
