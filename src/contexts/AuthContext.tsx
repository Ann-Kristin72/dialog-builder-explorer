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
  const [isLoading, setIsLoading] = useState(true);   // brukes av App.tsx
  const [ready, setReady] = useState(false);          // CTO bootstrap gate

  // 🔧 MSAL bootstrap MÅ kjøre før noe tidlig return
  useEffect(() => {
    (async () => {
      try {
        console.log("🚀 Auth bootstrap start");

        // 1) Hent redirect-respons (hvis vi kom fra B2C)
        const resp = await authService.handleRedirectPromise();
        if (resp?.account) {
          authService.setActiveAccount(resp.account);
          console.log("✅ Redirect account satt");
        }

        // 2) Finn/sett aktiv konto eller start login
        let acct = authService.getActiveAccount() ?? authService.getAllAccounts()[0];
        if (!acct) {
          console.log("➡️ Ingen konto, starter loginRedirect");
          await authService.loginRedirectWithQueryMode(); // inkluderer response_mode=query
          return; // redirect nå
        }
        authService.setActiveAccount(acct);

        // 3) Marker bootstrap done, så refresher vi bruker
        setReady(true);
        await refreshUser();           // 🔑 setter isLoading=false når ferdig
      } catch (err) {
        console.error("❌ Auth bootstrap error:", err);
        setReady(true);
        await refreshUser();           // 🔑 selv ved feil, sørg for at spinner stopper
      }
    })();
  }, []);

  // ⛔ Ikke rendr noe annet før MSAL bootstrap er ferdig
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initialiserer Azure AD B2C…</p>
        </div>
      </div>
    );
  }

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Refreshing user from Azure AD B2C...');
      const currentUser = await authService.getUser();
      console.log('✅ User refreshed from Azure AD B2C:', currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        console.log('✅ User found, setting loading to false');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);   // 🔑 viktig - alltid sett isLoading = false
      console.log('✅ Loading set to false');
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
