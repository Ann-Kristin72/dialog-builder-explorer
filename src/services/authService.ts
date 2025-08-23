import { PublicClientApplication, Configuration, AuthenticationResult, AccountInfo } from '@azure/msal-browser';

// MSAL configuration for Azure AD B2C
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID || '',
    authority: import.meta.env.VITE_OIDC_AUTHORITY || 'https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_',
    knownAuthorities: ['teknotassenb2c.b2clogin.com'],
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export interface AuthUser {
  id: string;
  email: string;
  givenName: string;
  surname: string;
  organization?: string;
  location?: string;
  role?: string;
  accessToken: string;
}

class AuthService {
  private msalInstance: PublicClientApplication;
  private user: AccountInfo | null = null;
  private demoMode: boolean = false; // Default to Azure AD B2C

  constructor() {
    // Check if we're in demo mode (no Azure AD B2C configured)
    this.demoMode = !import.meta.env.VITE_OIDC_CLIENT_ID || 
                   import.meta.env.VITE_OIDC_CLIENT_ID === 'your-azure-b2c-client-id-here' ||
                   import.meta.env.VITE_OIDC_CLIENT_ID === '';
    
    if (this.demoMode) {
      console.log('🔧 Demo mode enabled - using local authentication');
      return;
    }

    console.log('🔐 Azure AD B2C mode enabled - using OIDC authentication');
    console.log('🔑 Client ID:', import.meta.env.VITE_OIDC_CLIENT_ID);
    console.log('🌐 Authority:', import.meta.env.VITE_OIDC_AUTHORITY);

    this.msalInstance = new PublicClientApplication(msalConfig);

    // Set up event handlers
    this.msalInstance.addEventCallback((event) => {
      if (event.eventType === 'msal:loginSuccess') {
        console.log('✅ Login success event');
      } else if (event.eventType === 'msal:loginFailure') {
        console.log('❌ Login failure event');
      } else if (event.eventType === 'msal:acquireTokenSuccess') {
        console.log('✅ Token acquisition success');
      } else if (event.eventType === 'msal:acquireTokenFailure') {
        console.error('❌ Token acquisition failure');
      }
    });
  }

  async login(): Promise<AuthUser> {
    if (this.demoMode) {
      // Demo login - create a mock user
      const demoUser: AuthUser = {
        id: 'demo-user-123',
        email: 'demo@teknotassen.no',
        givenName: 'Demo',
        surname: 'Bruker',
        organization: 'TeknoTassen',
        location: 'Oslo',
        role: 'Admin',
        accessToken: 'demo-token-' + Date.now(),
      };
      
      // Store in localStorage for demo
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      console.log('✅ Demo user created and stored:', demoUser);
      return demoUser;
    }

    try {
      // Use MSAL to initiate login
      const loginResult = await this.msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account', // Ensure user is prompted for account selection
      });

      if (loginResult.account) {
        this.user = loginResult.account;
        console.log('✅ Login successful');
        return this.mapUserToAuthUser(this.user);
      } else {
        console.error('❌ Login failed or user cancelled');
        throw new Error('Login failed or user cancelled');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async completeLogin(): Promise<AuthUser | null> {
    if (this.demoMode) {
      // In demo mode, get user from localStorage
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser);
      }
      return null;
    }

    try {
      // Use MSAL to acquire token silently
      const silentResult = await this.msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: this.user,
      });

      if (silentResult.account) {
        this.user = silentResult.account;
        console.log('✅ Silent renew successful');
        return this.mapUserToAuthUser(this.user);
      } else {
        console.error('❌ Silent renew failed or no account found');
        return null;
      }
    } catch (error) {
      console.error('❌ Complete login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    if (this.demoMode) {
      localStorage.removeItem('demoUser');
      return;
    }

    try {
      await this.msalInstance.logoutPopup({
        mainWindowRedirectUri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  async getUser(): Promise<AuthUser | null> {
    if (this.demoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const user = JSON.parse(demoUser);
        console.log('✅ Demo user retrieved:', user);
        return user;
      }
      console.log('❌ No demo user found in localStorage');
      return null;
    }

    try {
      if (!this.user) {
        // If user is null, try to acquire token silently to get the account
        const silentResult = await this.msalInstance.acquireTokenSilent({
          scopes: ['openid', 'profile', 'email'],
          account: this.user,
        });
        this.user = silentResult.account;
      }
      return this.user ? this.mapUserToAuthUser(this.user) : null;
    } catch (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user !== null && !!user.accessToken;
    } catch (error) {
      return false;
    }
  }

  getAccessToken(): string | null {
    if (this.demoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser).accessToken;
      }
      return null;
    }

    return this.user?.idTokenClaims?.sub || null;
  }

  // Get user profile info
  getUserProfile() {
    return this.user?.idTokenClaims || null;
  }

  private mapUserToAuthUser(user: AccountInfo): AuthUser {
    return {
      id: (user.idTokenClaims?.sub as string) || '',
      email: (user.idTokenClaims?.email as string) || '',
      givenName: (user.idTokenClaims?.given_name as string) || '',
      surname: (user.idTokenClaims?.family_name as string) || '',
      organization: (user.idTokenClaims?.extension_Organization as string) || undefined,
      location: (user.idTokenClaims?.extension_Location as string) || undefined,
      role: (user.idTokenClaims?.extension_Role as string) || undefined,
      accessToken: (user.idTokenClaims?.sub as string) || '', // Use sub as access token for simplicity
    };
  }

  // Handle silent renew
  async startSilentRenew(): Promise<void> {
    if (this.demoMode) return; // Demo mode doesn't need token renewal

    try {
      await this.msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: this.user,
      });
    } catch (error) {
      console.error('❌ Silent renew start error:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
