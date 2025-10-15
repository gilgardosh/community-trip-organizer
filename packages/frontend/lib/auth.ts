// Authentication API client

import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  OAuthProvider,
  AuthTokens,
} from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token management
const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';
const FAMILY_KEY = 'auth_family';

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored || stored === 'undefined' || stored === 'null') return null;
  try {
    return JSON.parse(stored);
  } catch {
    // Clear invalid data
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(FAMILY_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored || stored === 'undefined' || stored === 'null') return null;
  try {
    return JSON.parse(stored);
  } catch {
    // Clear invalid data
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredFamily() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(FAMILY_KEY);
  if (!stored || stored === 'undefined' || stored === 'null') return null;
  try {
    return JSON.parse(stored);
  } catch {
    // Clear invalid data
    localStorage.removeItem(FAMILY_KEY);
    return null;
  }
}

export function setStoredFamily(family: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
}

// API helper with auth headers
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && tokens?.refreshToken) {
    try {
      const newTokens = await refreshAuthToken(tokens.refreshToken);
      setStoredTokens(newTokens);

      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (error) {
      clearStoredTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

// Login with email/password
export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setStoredTokens(data.tokens);
  setStoredUser(data.user);
  setStoredFamily(data.family);

  return data;
}

// Register new user
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const authData: AuthResponse = await response.json();
  setStoredTokens(authData.tokens);
  setStoredUser(authData.user);
  setStoredFamily(authData.family);

  return authData;
}

// OAuth login (Google/Facebook)
export async function initiateOAuthLogin(
  provider: OAuthProvider,
): Promise<void> {
  const redirectUri =
    provider.redirectUri || `${window.location.origin}/auth/callback`;
  window.location.href = `${API_URL}/api/auth/${provider.provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// Handle OAuth callback
export async function handleOAuthCallback(
  provider: string,
  code: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/${provider}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'OAuth authentication failed');
  }

  const data: AuthResponse = await response.json();
  setStoredTokens(data.tokens);
  setStoredUser(data.user);
  setStoredFamily(data.family);

  return data;
}

// Refresh access token
export async function refreshAuthToken(
  refreshToken: string,
): Promise<AuthTokens> {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

// Logout
export async function logoutUser(): Promise<void> {
  try {
    await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    });
  } finally {
    clearStoredTokens();
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await fetchWithAuth('/api/auth/me');

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  const data: AuthResponse = await response.json();
  setStoredUser(data.user);
  setStoredFamily(data.family);

  return data;
}

// Verify token validity
export async function verifyToken(): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/api/auth/verify');
    return response.ok;
  } catch {
    return false;
  }
}
