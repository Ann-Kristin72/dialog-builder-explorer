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

  constructor() {
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
    try {
      await this.userManager.signinRedirect();
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async completeLogin(): Promise<AuthUser | null> {
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
    try {
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  async getUser(): Promise<AuthUser | null> {
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
    try {
      await this.userManager.startSilentRenew();
    } catch (error) {
      console.error('❌ Silent renew start error:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
