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
      // Check for demo user data first
      const demoUserData = localStorage.getItem('demoUserData');
      if (demoUserData) {
        const userData = JSON.parse(demoUserData);
        
        // Check if "remember me" is enabled and if login is still valid
        if (userData.rememberMe && userData.loginTime) {
          const loginTime = new Date(userData.loginTime);
          const now = new Date();
          const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          // If more than 24 hours have passed, clear the data
          if (hoursSinceLogin > 24) {
            console.log('🔍 Login expired (more than 24 hours), clearing data');
            localStorage.removeItem('demoUserData');
            setIsLoading(false);
            return;
          }
          
          console.log('✅ Remember me active, login still valid');
        } else {
          console.log('🔍 Remember me not enabled or no login time');
        }
        
        const demoUser: AuthUser = {
          id: 'demo-user-' + Date.now(),
          email: userData.email,
          givenName: userData.name,
          surname: '',
          organization: userData.workplace,
          location: userData.department,
          role: userData.role,
          accessToken: 'demo-token-' + Date.now(),
        };
        
        console.log('✅ Demo user created from form data:', demoUser);
        setUser(demoUser);
        setIsLoading(false);
        return;
      }
      
      // Fallback to authService
      const currentUser = await authService.getUser();
      console.log('🔄 Setting user in refreshUser:', currentUser);
      setUser(currentUser);
      console.log('✅ User refreshed:', currentUser);
      
      // If we have a user, make sure we're not loading anymore
      if (currentUser) {
        setIsLoading(false);
        console.log('✅ Loading set to false');
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
        console.log('🔄 Setting user directly from login:', newUser);
        setUser(newUser);
        console.log('✅ User set directly from login');
      } else {
        // Fallback to refresh if no user returned
        console.log('🔄 No user from login, calling refreshUser...');
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
        
        // Check for demo user data first (priority for demo)
        const demoUserData = localStorage.getItem('demoUserData');
        if (demoUserData) {
          console.log('🔍 Found demo user data, creating user...');
          const userData = JSON.parse(demoUserData);
          
          // Check if "remember me" is enabled and if login is still valid
          if (userData.rememberMe && userData.loginTime) {
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
            
            // If more than 24 hours have passed, clear the data
            if (hoursSinceLogin > 24) {
              console.log('🔍 Login expired (more than 24 hours), clearing data');
              localStorage.removeItem('demoUserData');
              setIsLoading(false);
              return;
            }
            
            console.log('✅ Remember me active, login still valid');
          } else {
            console.log('🔍 Remember me not enabled or no login time');
          }
          
          const demoUser: AuthUser = {
            id: 'demo-user-' + Date.now(),
            email: userData.email,
            givenName: userData.name,
            surname: '',
            organization: userData.workplace,
            location: userData.department,
            role: userData.role,
            accessToken: 'demo-token-' + Date.now(),
          };
          
          console.log('✅ Demo user created from localStorage:', demoUser);
          setUser(demoUser);
          setIsLoading(false);
          return;
        }
        
        // Check if we're returning from OIDC login
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
