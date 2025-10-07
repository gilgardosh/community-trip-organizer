# Quick Start Guide - Authentication System

## 🚀 Installation & Setup

### 1. Install Testing Dependencies (Optional)

If you want to run the component tests, install these dependencies:

```bash
cd packages/frontend
yarn add --dev @testing-library/react@^14.1.2 @testing-library/user-event@^14.5.1 @testing-library/jest-dom@^6.1.5 @vitejs/plugin-react@^4.2.1 @vitest/ui@^1.0.4 jsdom@^23.0.1
```

### 2. Environment Configuration

Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. That's it!

The authentication system is already integrated. All dependencies for the auth system itself are already installed.

## 🎯 Quick Usage Guide

### Login Page

Navigate to: `http://localhost:3000/auth/login`

Features:

- Login with email/password
- Register new account
- Google OAuth login
- Facebook OAuth login

### Protecting a Route

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute allowedRoles={['family']}>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Using Auth State

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>שלום, {user.name}</p>
          <button onClick={logout}>התנתק</button>
        </>
      ) : (
        <p>אנא התחבר</p>
      )}
    </div>
  );
}
```

### Adding User Nav to Header

```tsx
import { UserNav } from '@/components/auth/UserNav';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">טיולי השכונה</h1>
        <UserNav />
      </div>
    </header>
  );
}
```

## 📋 Available Components

| Component        | Path                               | Purpose               |
| ---------------- | ---------------------------------- | --------------------- |
| `LoginForm`      | `@/components/auth/LoginForm`      | Email/password login  |
| `RegisterForm`   | `@/components/auth/RegisterForm`   | User registration     |
| `OAuthButtons`   | `@/components/auth/OAuthButtons`   | Google/Facebook login |
| `ProtectedRoute` | `@/components/auth/ProtectedRoute` | Route protection      |
| `UserNav`        | `@/components/auth/UserNav`        | User menu/status      |

## 🔑 Available Hooks

```tsx
import { useAuth } from '@/contexts/AuthContext';

const {
  user, // Current user data
  family, // Current family data
  isAuthenticated, // Boolean: is logged in
  isLoading, // Boolean: loading state
  login, // Function: login(credentials)
  loginWithOAuth, // Function: loginWithOAuth(provider)
  register, // Function: register(data)
  logout, // Function: logout()
  refreshToken, // Function: refreshToken()
} = useAuth();
```

## 🧪 Running Tests

### Validation Tests (Already Working)

```bash
cd packages/frontend
yarn test validation.test.ts
```

### Component Tests (After Installing Dependencies)

```bash
cd packages/frontend
yarn test
```

## 📝 Example Pages

### Login/Register Page

- **URL**: `/auth/login`
- **File**: `app/auth/login/page.tsx`
- Already created and working

### OAuth Callback

- **URL**: `/auth/callback`
- **File**: `app/auth/callback/page.tsx`
- Handles OAuth redirects

### Family Dashboard (Example)

- **URL**: `/family/dashboard`
- **File**: `app/family/dashboard/page.tsx`
- Shows how to use protected routes and auth context

## 🎨 Hebrew & RTL

All components are already configured for Hebrew with RTL:

- Text is in Hebrew
- Layout is right-to-left
- Email fields use LTR for input
- Error messages in Hebrew

## 🔒 Roles

Three roles are supported:

- `family` - Regular family users
- `trip_admin` - Trip administrators
- `super_admin` - System administrators

Use in ProtectedRoute:

```tsx
<ProtectedRoute allowedRoles={['trip_admin', 'super_admin']}>
  {/* Admin only content */}
</ProtectedRoute>
```

## 📖 Full Documentation

See `AUTHENTICATION.md` for complete documentation including:

- All component APIs
- Detailed usage examples
- Security considerations
- Testing guide
- Next steps

## ✅ What's Already Done

✅ Login form with validation  
✅ Registration form with validation  
✅ OAuth buttons (Google, Facebook)  
✅ JWT token management  
✅ Protected routes  
✅ Role-based access control  
✅ User navigation component  
✅ Auth context provider  
✅ Form validation with Hebrew errors  
✅ RTL layout support  
✅ Test examples  
✅ Complete documentation

## 🎉 You're Ready!

The authentication system is fully implemented and ready to use. Just:

1. Start the backend server
2. Start the frontend: `yarn dev`
3. Visit: `http://localhost:3000/auth/login`

Enjoy! 🚀
