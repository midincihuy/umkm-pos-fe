// Direct Google OAuth 2.0 implementation
// Replace with your actual client ID and API key from environment variables
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  locale?: string;
  // For compatibility with existing code that uses user_metadata
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

export interface AuthState {
  user: GoogleUser | null;
  loading: boolean;
}

type AuthChangeListener = (user: GoogleUser | null) => void;

// Declare Google Identity Services on window
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

// Initialize Google OAuth client
let googleClient: any = null;
let listeners: AuthChangeListener[] = [];

// Load Google Identity Services script dynamically
function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
}

// Notify all listeners of auth state changes
function notifyListeners(user: GoogleUser | null) {
  listeners.forEach(listener => listener(user));
}

// Initialize Google OAuth client
export async function initGoogleAuth(clientId: string): Promise<void> {
  if (!clientId) {
    throw new Error('Google Client ID is required');
  }

  await loadGoogleIdentityScript();

  // Add null check for window.google
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services failed to load');
  }

  googleClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid email profile',
    callback: async (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          const user = await fetchUserInfo(tokenResponse.access_token);
          notifyListeners(user);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          notifyListeners(null);
        }
      } else {
        notifyListeners(null);
      }
    },
  });
}

// Fetch user info from Google API
async function fetchUserInfo(accessToken: string): Promise<GoogleUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const userData = await response.json();

  // Format for compatibility with existing code
  const formattedUser: GoogleUser = {
    id: userData.sub,
    email: userData.email,
    name: userData.name,
    picture: userData.picture,
    given_name: userData.given_name,
    family_name: userData.family_name,
    email_verified: userData.email_verified,
    locale: userData.locale,
    user_metadata: {
      avatar_url: userData.picture,
      full_name: userData.name,
    },
  };

  // Save auth data
  localStorage.setItem('google_auth_user', JSON.stringify(formattedUser));
  localStorage.setItem('google_auth_token', accessToken);

  return formattedUser;
}

// Trigger Google login flow
export function signInWithGoogle(): void {
  if (!googleClient) {
    throw new Error('Google Auth not initialized. Call initGoogleAuth first.');
  }
  googleClient.requestAccessToken();
}

// Sign out from Google
export async function signOut(): Promise<void> {
  // Remove auth data
  localStorage.removeItem('google_auth_user');
  localStorage.removeItem('google_auth_token');

  // Notify listeners
  notifyListeners(null);
}

// Get current user from local storage
export function getCurrentUser(): GoogleUser | null {
  try {
    const user = localStorage.getItem('google_auth_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    localStorage.removeItem('google_auth_user');
    localStorage.removeItem('google_auth_token');
    return null;
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: AuthChangeListener): () => void {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
}