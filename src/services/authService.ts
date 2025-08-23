import { PublicClientApplication, Configuration, AuthenticationResult, AccountInfo, LogLevel } from '@azure/msal-browser';

// MSAL configuration for Azure AD B2C - CTO's robust template
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID || '',
    authority: 'https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_',
    knownAuthorities: ['teknotassenb2c.b2clogin.com'],
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
    navigateToLoginRequestUrl: false, // <= unngå ekstra redirect-loop
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true, // Safari/ITP
  },
  system: {
    loggerOptions: { logLevel: LogLevel.Info, loggerCallback: (_l, m) => console.log('[MSAL]', m) }
  }
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
    // Always use Azure AD B2C when MSAL is configured
    this.demoMode = false; // Force Azure AD B2C mode
    
    console.log('🔐 Azure AD B2C mode enabled - using MSAL authentication');
    console.log('🔑 Client ID:', import.meta.env.VITE_OIDC_CLIENT_ID);
    console.log('🌐 Authority:', import.meta.env.VITE_OIDC_AUTHORITY);

    this.msalInstance = new PublicClientApplication(msalConfig);

    // CTO's recommendation: Initialize MSAL and handle redirect promise FIRST
    this.msalInstance.initialize().then(() => {
      console.log('✅ MSAL initialized successfully');
      
      // VIKTIG: kjør handleRedirectPromise FØRST for å unngå race condition
      return this.msalInstance.handleRedirectPromise();
    }).then((resp) => {
      if (resp?.account) {
        console.log('✅ Got redirect response, setting active account');
        this.msalInstance.setActiveAccount(resp.account);
        this.user = resp.account;
      } else {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          console.log('✅ Found existing accounts, setting active account');
          this.msalInstance.setActiveAccount(accounts[0]);
          this.user = accounts[0];
        } else {
          console.log('🔍 No existing accounts found');
        }
      }
    }).catch((error) => {
      console.error('❌ MSAL initialization failed:', error);
    });

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
    try {
      // Ensure MSAL is initialized before proceeding
      await this.msalInstance.initialize();
      console.log('✅ MSAL ready for login');
      
      // Use MSAL to initiate login with redirect flow
      await this.msalInstance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account', // Ensure user is prompted for account selection
      });
      
      // With redirect flow, we don't get a result here
      // The user will be redirected to Azure AD B2C
      // We'll handle the result in completeLogin method
      return null;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async completeLogin(): Promise<AuthUser | null> {
    try {
      console.log('🔍 Starting completeLogin...');
      console.log('🔍 Current URL:', window.location.href);
      
      // Handle redirect response from Azure AD B2C
      const response = await this.msalInstance.handleRedirectPromise();
      console.log('🔍 MSAL handleRedirectPromise response:', response);
      
      if (response) {
        // User returned from Azure AD B2C
        console.log('🔍 Got redirect response, checking account...');
        if (response.account) {
          this.user = response.account;
          console.log('✅ Login successful with redirect, account:', response.account);
          
          // CTO's recommendation: Set active account explicitly
          this.msalInstance.setActiveAccount(response.account);
          console.log('✅ Active account set:', response.account);
          
          const authUser = this.mapUserToAuthUser(this.user);
          console.log('✅ Mapped to AuthUser:', authUser);
          return authUser;
        } else {
          console.error('❌ No account in redirect response');
          return null;
        }
      } else {
        // No redirect response, check if user is already logged in
        console.log('🔍 No redirect response, checking existing accounts...');
        const accounts = this.msalInstance.getAllAccounts();
        console.log('🔍 Existing accounts:', accounts);
        if (accounts.length > 0) {
          this.user = accounts[0];
          console.log('✅ User already logged in, account:', accounts[0]);
          
          // CTO's recommendation: Set active account explicitly
          this.msalInstance.setActiveAccount(accounts[0]);
          console.log('✅ Active account set:', accounts[0]);
          
          const authUser = this.mapUserToAuthUser(this.user);
          console.log('✅ Mapped to AuthUser:', authUser);
          return authUser;
        }
        console.log('🔍 No existing accounts found');
        return null;
      }
    } catch (error) {
      console.error('❌ Complete login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || 'https://dialog-builder-explorer-a3cr9ruhf-aino-frontend.vercel.app',
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  async getUser(): Promise<AuthUser | null> {
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
      accessToken: (user.idTokenClaims?.sub as string) || '', // Use sub as temporary access token until we get proper token
    };
  }

  // Handle silent renew
  async startSilentRenew(): Promise<void> {
    try {
      await this.msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: this.user,
      });
    } catch (error) {
      console.error('❌ Silent renew start error:', error);
    }
  }

  // CTO's recommendation: Wait for MSAL to be ready
  async waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.msalInstance) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }
}

export const authService = new AuthService();
export default authService;
