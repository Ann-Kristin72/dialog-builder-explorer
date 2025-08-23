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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false); // CTO's ready state

  // CTO's recommendation: Don't render anything until MSAL is ready
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initialiserer Azure AD B2C...</p>
        </div>
      </div>
    );
  }

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
        
        // CTO's recommendation: Wait for MSAL to be ready first
        await authService.waitForReady();
        console.log('✅ MSAL is ready, proceeding with auth initialization');
        
        // Now check for existing user or callback
        const existingUser = await authService.getUser();
        if (existingUser) {
          setUser(existingUser);
          console.log('✅ Found existing user:', existingUser);
        } else {
          console.log('🔍 No existing user found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setReady(true); // CTO's ready state
        console.log('🔍 Azure AD B2C auth initialization completed, ready set to true');
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
