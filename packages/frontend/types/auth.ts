// Authentication types

export type UserType = 'adult' | 'child';

export type Role = 'FAMILY' | 'TRIP_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  familyId: string;
  type: UserType;
  name: string;
  age?: number;
  email?: string;
  oauthProvider?: 'google' | 'facebook';
  profilePhotoUrl?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name?: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profilePhotoUrl?: string;
  familyName?: string;
}

export interface OAuthProvider {
  provider: 'google' | 'facebook';
  redirectUri?: string;
}

export interface AuthContextType {
  user: User | null;
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface AuthResponse {
  user: User;
  family: Family;
  tokens: AuthTokens;
}
