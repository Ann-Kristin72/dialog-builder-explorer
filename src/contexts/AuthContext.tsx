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
      console.log('🔄 Refreshing user from Azure AD B2C...');
      const currentUser = await authService.getUser();
      console.log('✅ User refreshed from Azure AD B2C:', currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        setIsLoading(false);
        console.log('✅ Loading set to false');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      console.log('🔐 Starting Azure AD B2C login...');
      const newUser = await authService.login();
      console.log('✅ Azure AD B2C login completed, got user:', newUser);
      
      if (newUser) {
        // User returned immediately (popup flow)
        setUser(newUser);
        console.log('✅ User set from Azure AD B2C login');
      } else {
        // User will be redirected to Azure AD B2C (redirect flow)
        console.log('🔄 Redirect flow - user will be redirected to Azure AD B2C');
        // Don't call refreshUser here - wait for redirect callback
      }
      
      console.log('✅ Azure AD B2C login process completed successfully');
    } catch (error) {
      console.error('❌ Azure AD B2C login error:', error);
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
        console.log('🔍 Initializing Azure AD B2C auth...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Current hash:', window.location.hash);
        
        // CTO's recommendation: Set loading true while waiting for handleRedirectPromise
        setIsLoading(true);
        
        // CTO's recommendation: Run handleRedirectPromise first before anything else
        console.log('🔍 Running MSAL handleRedirectPromise...');
        
        // Check if we're returning from OIDC login
        // Use both href and hash to ensure we catch the callback
        const hasCallback = window.location.href.includes('code=') || 
                           window.location.hash.includes('code=') ||
                           window.location.href.includes('id_token=') || 
                           window.location.hash.includes('id_token=') ||
                           window.location.href.includes('access_token=') || 
                           window.location.hash.includes('access_token=');
        
        console.log('🔍 TEST: hasCallback result:', hasCallback);
        
        if (hasCallback) {
          console.log('🔍 Detected OIDC callback, completing login...');
          const newUser = await authService.completeLogin();
          if (newUser) {
            setUser(newUser);
            console.log('✅ OIDC login completed, user set:', newUser);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.log('❌ OIDC login failed, no user returned');
          }
        } else {
          console.log('🔍 No OIDC callback, checking for existing user...');
          // Check for existing user from Azure AD B2C
          await refreshUser();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('🔍 Azure AD B2C auth initialization completed, loading set to false');
      }
    };

    initializeAuth();
  }, []);

  const isAuthenticatedValue = !!user && !!user.accessToken;
  
  console.log('🔍 AuthContext value update:', {
    user: user ? { id: user.id, email: user.email, hasAccessToken: !!user.accessToken } : null,
    isLoading,
    isAuthenticated: isAuthenticatedValue,
    userAccessToken: user?.accessToken
  });
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: isAuthenticatedValue,
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
