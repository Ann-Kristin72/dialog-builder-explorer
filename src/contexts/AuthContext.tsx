import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserManager } from 'oidc-client-ts';
import userManager from '@/config/oidc';

// Bruker interface
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'helsepersonell' | 'prosjektleder' | 'admin';
  organization?: string;
  sub?: string; // OIDC subject
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
}

// Opprett context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider komponent
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sjekk om bruker er autentisert
  const isAuthenticated = !!user;

  // Hent bruker fra OIDC
  const getUser = async (): Promise<void> => {
    try {
      const user = await userManager.getUser();
      setUser(user);
      
      if (user && !user.expired) {
        await getUserProfile();
      }
    } catch (error) {
      console.error('Error getting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hent brukerprofil
  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      // Hent brukerinfo fra OIDC
      const userInfo = await userManager.getUser();
      
      if (userInfo) {
        // Opprett brukerprofil fra OIDC data
        const profile: UserProfile = {
          id: userInfo.profile.sub || userInfo.profile.oid || 'unknown',
          email: userInfo.profile.email || userInfo.profile.upn || '',
          name: userInfo.profile.name || userInfo.profile.given_name || 'Ukjent',
          role: 'helsepersonell', // Standard rolle - kan endres senere
          organization: userInfo.profile.org_name || 'Ukjent kommune',
          sub: userInfo.profile.sub,
        };

        setUserProfile(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }

    return null;
  };

  // Login funksjon
  const login = async (): Promise<void> => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Logout funksjon
  const logout = async (): Promise<void> => {
    try {
      await userManager.signoutRedirect();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Håndter OIDC callbacks
  useEffect(() => {
    // Håndter signin callback
    const handleSigninCallback = async () => {
      try {
        const user = await userManager.signinRedirectCallback();
        setUser(user);
        await getUserProfile();
      } catch (error) {
        console.error('Signin callback error:', error);
      }
    };

    // Håndter signout callback
    const handleSignoutCallback = async () => {
      try {
        await userManager.signoutRedirectCallback();
        setUser(null);
        setUserProfile(null);
      } catch (error) {
        console.error('Signout callback error:', error);
      }
    };

    // Sjekk om vi er i en callback
    if (window.location.pathname === '/auth/callback') {
      handleSigninCallback();
    } else if (window.location.pathname === '/auth/silent-renew') {
      // Silent renew callback
      userManager.signinSilentCallback();
    } else {
      // Normal side - hent bruker
      getUser();
    }
  }, []);

  // Lyt på OIDC events
  useEffect(() => {
    const handleUserLoaded = (user: User) => {
      setUser(user);
      getUserProfile();
    };

    const handleUserUnloaded = () => {
      setUser(null);
      setUserProfile(null);
    };

    const handleSilentRenewError = (error: Error) => {
      console.error('Silent renew error:', error);
      // Prøv å logge inn på nytt
      login();
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for å bruke auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
