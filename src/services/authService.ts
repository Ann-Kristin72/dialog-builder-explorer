import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts';

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
  private demoMode: boolean = true; // Demo mode for testing

  constructor() {
    // Check if we're in demo mode (no Azure AD B2C configured)
    this.demoMode = !import.meta.env.VITE_OIDC_CLIENT_ID || import.meta.env.VITE_OIDC_CLIENT_ID === 'your-azure-b2c-client-id-here';
    
    if (this.demoMode) {
      console.log('🔧 Demo mode enabled - using local authentication');
      return;
    }

    this.userManager = new UserManager({
      authority: import.meta.env.VITE_OIDC_AUTHORITY || 'https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1A_SIGNIN',
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID || '',
      redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-qrrvdgk63-aino-frontend.vercel.app',
      response_type: 'id_token token',
      scope: 'openid profile email',
      post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-qrrvdgk63-aino-frontend.vercel.app',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silent_redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-qrrvdgk63-aino-frontend.vercel.app',
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

  async login(): Promise<void> {
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
      return;
    }

    try {
      await this.userManager.signinRedirect();
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async completeLogin(): Promise<AuthUser | null> {
    if (this.demoMode) {
      return null; // Demo mode doesn't use redirects
    }

    try {
      const user = await this.userManager.signinRedirectCallback();
      this.user = user;
      return this.mapUserToAuthUser(user);
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
        return JSON.parse(demoUser);
      }
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
      givenName: user.profile.given_name || user.profile.name || '',
      surname: user.profile.family_name || '',
      organization: user.profile.extension_Organization || undefined,
      location: user.profile.extension_Location || undefined,
      role: user.profile.extension_Role || undefined,
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
