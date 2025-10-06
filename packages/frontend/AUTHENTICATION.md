# Authentication System Documentation

## Overview

This authentication system provides a complete solution for user authentication in the Community Trip Organizer application, including:

- Email/password authentication
- OAuth login (Google and Facebook)
- JWT token management
- Role-based access control
- Protected routes
- Hebrew language support with RTL layout

## Components

### 1. Authentication Context (`contexts/AuthContext.tsx`)

Provides global authentication state management using React Context API.

**Features:**
- User and family state management
- Login/logout functionality
- Token persistence
- Automatic token refresh

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  // ...
}
```

### 2. Login Form (`components/auth/LoginForm.tsx`)

Email/password login form with validation.

**Features:**
- Email and password fields with validation
- Password visibility toggle
- Loading states
- Error messages in Hebrew
- RTL layout support

**Props:**
- `onSuccess?: () => void` - Callback after successful login

### 3. Registration Form (`components/auth/RegisterForm.tsx`)

User registration form with comprehensive validation.

**Features:**
- Name, email, password, phone, and family name fields
- Password strength validation
- Password confirmation
- Real-time validation feedback
- Hebrew error messages

**Props:**
- `onSuccess?: () => void` - Callback after successful registration

### 4. OAuth Buttons (`components/auth/OAuthButtons.tsx`)

Google and Facebook OAuth login buttons.

**Features:**
- Branded buttons with logos
- Loading states
- Error handling
- Redirect handling

**Props:**
- `onSuccess?: () => void` - Callback after successful OAuth login

### 5. Protected Route (`components/auth/ProtectedRoute.tsx`)

Wrapper component for protecting routes based on authentication and role.

**Features:**
- Authentication verification
- Role-based access control
- Automatic redirect to login
- Loading state handling

**Props:**
- `allowedRoles?: Role[]` - Allowed user roles
- `redirectTo?: string` - Redirect URL (default: `/auth/login`)

**Usage:**
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['trip_admin', 'super_admin']}>
      <div>Admin content</div>
    </ProtectedRoute>
  )
}
```

### 6. User Navigation (`components/auth/UserNav.tsx`)

Navigation component showing user status and logout option.

**Features:**
- User avatar with initials
- User name, email, and role display
- Dropdown menu with profile and settings links
- Logout functionality
- Login button when not authenticated

## API Client (`lib/auth.ts`)

Authentication API client with the following functions:

### Token Management
- `getStoredTokens()` - Get stored auth tokens
- `setStoredTokens(tokens)` - Store auth tokens
- `clearStoredTokens()` - Clear stored tokens
- `getStoredUser()` - Get stored user data
- `getStoredFamily()` - Get stored family data

### Authentication
- `loginWithCredentials(credentials)` - Login with email/password
- `registerUser(data)` - Register new user
- `initiateOAuthLogin(provider)` - Start OAuth flow
- `handleOAuthCallback(provider, code)` - Handle OAuth callback
- `logoutUser()` - Logout current user
- `getCurrentUser()` - Get current user data
- `refreshAuthToken(refreshToken)` - Refresh access token
- `verifyToken()` - Verify token validity

## Validation (`lib/validation.ts`)

Form validation using Zod with Hebrew error messages.

### Schemas
- `emailSchema` - Email validation
- `passwordSchema` - Password strength validation
- `phoneSchema` - Israeli phone number validation
- `nameSchema` - Name validation
- `ageSchema` - Age validation
- `loginSchema` - Login form validation
- `registerSchema` - Registration form validation
- `childSchema` - Child data validation

### Helper Functions
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validatePhone(phone)` - Validate Israeli phone number
- `formatZodError(error)` - Format Zod errors for display

## Pages

### Login/Register Page (`app/auth/login/page.tsx`)

Main authentication page with tabs for login and registration.

**Features:**
- Tabbed interface
- OAuth buttons
- Email/password forms
- Return URL support

**URL Parameters:**
- `returnUrl` - URL to redirect to after successful authentication

### OAuth Callback (`app/auth/callback/page.tsx`)

Handles OAuth provider callbacks.

**Features:**
- Code exchange
- Token storage
- Error handling
- Redirect to original URL

## Types (`types/auth.ts`)

TypeScript types for authentication:

- `User` - User data
- `Family` - Family data
- `Role` - User roles (`family`, `trip_admin`, `super_admin`)
- `UserType` - User type (`adult`, `child`)
- `AuthTokens` - Access and refresh tokens
- `LoginCredentials` - Login form data
- `RegisterData` - Registration form data
- `OAuthProvider` - OAuth provider config
- `AuthContextType` - Auth context interface
- `AuthResponse` - API auth response

## Setup

### 1. Install Dependencies

The following dependencies are already included in package.json:
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation integration
- `zod` - Schema validation
- `lucide-react` - Icons

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Wrap App with AuthProvider

The `AuthProvider` is already included in `app/layout.tsx`.

### 4. Use Authentication

```tsx
// In any component
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 5. Protect Routes

```tsx
// In a page component
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function FamilyPage() {
  return (
    <ProtectedRoute allowedRoles={['family']}>
      <div>Family content</div>
    </ProtectedRoute>
  )
}
```

## Testing

### Unit Tests

Run validation tests:
```bash
yarn test validation.test.ts
```

### Testing Libraries (Need to Install)

For component testing, install:
```bash
yarn add --dev @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
```

Then update `vitest.config.ts` to include:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom'
```

## Hebrew Text & RTL

All components use Hebrew text with proper RTL layout:

- Forms have right-aligned labels
- Error messages appear in Hebrew
- Email fields use `dir="ltr"` for left-to-right input
- Buttons and icons are mirrored appropriately

## Security

- Passwords are validated for strength (8+ chars, uppercase, lowercase, numbers)
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- API requests include automatic token refresh
- Protected routes verify authentication and authorization

## Next Steps

1. Connect to actual backend API
2. Implement token refresh mechanism
3. Add remember me functionality
4. Implement password reset flow
5. Add two-factor authentication
6. Set up proper CSRF protection
7. Use httpOnly cookies for tokens in production
