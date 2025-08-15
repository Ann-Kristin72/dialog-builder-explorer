import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

// OIDC konfigurasjon
export const oidcConfig = {
  authority: import.meta.env.VITE_OIDC_ISSUER || 'https://login.microsoftonline.com/common',
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'your-client-id',
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: 'code',
  scope: 'openid profile email',
  loadUserInfo: true,
  monitorSession: true,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/auth/silent-renew`,
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

// Opprett UserManager instans
export const userManager = new UserManager(oidcConfig);

// OIDC events
userManager.events.addUserLoaded((user) => {
  console.log('User loaded:', user);
});

userManager.events.addUserUnloaded(() => {
  console.log('User unloaded');
});

userManager.events.addSilentRenewError((error) => {
  console.error('Silent renew error:', error);
});

userManager.events.addUserSignedOut(() => {
  console.log('User signed out');
});

export default userManager;
