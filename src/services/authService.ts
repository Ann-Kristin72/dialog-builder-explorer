import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts';

// PKCE utility functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  // Simple SHA256 implementation for PKCE
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  
  // Use Web Crypto API for SHA256
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hash);
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

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
  private userManager: UserManager;
  private user: User | null = null;
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

    this.userManager = new UserManager({
      authority: import.meta.env.VITE_OIDC_AUTHORITY || 'https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_',
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID || '',
      redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silent_redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
      
      // Azure AD B2C konfigurasjon
      response_mode: 'query',
    });

    // Set up event handlers
    this.userManager.events.addUserLoaded((user) => {
      this.user = user;
      console.log('✅ User loaded:', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      this.user = null;
      console.log('❌ User unloaded');
    });

    this.userManager.events.addAccessTokenExpiring(() => {
      console.log('⚠️ Access token expiring, attempting renewal...');
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('❌ Silent renew error:', error);
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
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code_verifier for callback
      localStorage.setItem('pkce_code_verifier', codeVerifier);
      
      console.log('🔐 PKCE generated - code_verifier stored');
      
      // Create custom OIDC request with PKCE
      const loginUrl = new URL(this.userManager.settings.authority + '/oauth2/v2.0/authorize');
      loginUrl.searchParams.set('client_id', this.userManager.settings.client_id);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('redirect_uri', this.userManager.settings.redirect_uri);
      loginUrl.searchParams.set('scope', this.userManager.settings.scope);
      loginUrl.searchParams.set('code_challenge', codeChallenge);
      loginUrl.searchParams.set('code_challenge_method', 'S256');
      loginUrl.searchParams.set('response_mode', 'query');
      
      // Redirect to Azure AD B2C
      window.location.href = loginUrl.toString();
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
      // Get stored PKCE code_verifier
      const codeVerifier = localStorage.getItem('pkce_code_verifier');
      if (!codeVerifier) {
        console.error('❌ No PKCE code_verifier found');
        return null;
      }
      
      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        console.error('❌ No authorization code found in URL');
        return null;
      }
      
      console.log('🔐 PKCE callback - exchanging code for token');
      
      // Exchange authorization code for token using PKCE
      const tokenUrl = new URL(this.userManager.settings.authority + '/oauth2/v2.0/token');
      const tokenResponse = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.userManager.settings.client_id,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.userManager.settings.redirect_uri,
          code_verifier: codeVerifier,
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        return null;
      }
      
      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      
      // Clean up PKCE data
      localStorage.removeItem('pkce_code_verifier');
      
      // Create user object from token data
      const user: AuthUser = {
        id: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).sub : '',
        email: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).email : '',
        givenName: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).given_name || '' : '',
        surname: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).family_name || '' : '',
        organization: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).extension_Organization : undefined,
        location: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).extension_Location : undefined,
        role: tokenData.id_token ? JSON.parse(atob(tokenData.id_token.split('.')[1])).extension_Role : undefined,
        accessToken: tokenData.access_token || '',
      };
      
      return user;
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
      await this.userManager.signoutRedirect();
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
        this.user = await this.userManager.getUser();
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

    return this.user?.access_token || null;
  }

  // Get user profile info
  getUserProfile() {
    return this.user?.profile || null;
  }

  private mapUserToAuthUser(user: User): AuthUser {
    return {
      id: user.profile.sub || '',
      email: user.profile.email || '',
      givenName: (user.profile.given_name as string) || (user.profile.name as string) || '',
      surname: user.profile.family_name || '',
      organization: user.profile.extension_Organization as string || undefined,
      location: user.profile.extension_Location as string || undefined,
      role: user.profile.extension_Role as string || undefined,
      accessToken: user.access_token || '',
    };
  }

  // Handle silent renew
  async startSilentRenew(): Promise<void> {
    if (this.demoMode) return; // Demo mode doesn't need token renewal

    try {
      await this.userManager.startSilentRenew();
    } catch (error) {
      console.error('❌ Silent renew start error:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
