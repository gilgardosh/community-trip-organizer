# Authentication Flow Diagrams

## 1. Login Flow (Email/Password)

```mermaid
sequenceDiagram
    participant User
    participant LoginForm
    participant AuthContext
    participant AuthAPI
    participant Backend
    participant LocalStorage

    User->>LoginForm: Enter email & password
    LoginForm->>LoginForm: Validate form (Zod)
    LoginForm->>AuthContext: login(credentials)
    AuthContext->>AuthAPI: loginWithCredentials()
    AuthAPI->>Backend: POST /api/auth/login
    Backend-->>AuthAPI: { user, family, tokens }
    AuthAPI->>LocalStorage: Store tokens
    AuthAPI->>LocalStorage: Store user data
    AuthAPI->>LocalStorage: Store family data
    AuthAPI-->>AuthContext: Return auth data
    AuthContext->>AuthContext: Update state
    AuthContext-->>LoginForm: Success
    LoginForm->>User: Redirect to dashboard
```

## 2. OAuth Flow (Google/Facebook)

```mermaid
sequenceDiagram
    participant User
    participant OAuthButtons
    participant AuthContext
    participant AuthAPI
    participant OAuthProvider
    participant Backend
    participant CallbackPage

    User->>OAuthButtons: Click OAuth button
    OAuthButtons->>AuthContext: loginWithOAuth(provider)
    AuthContext->>AuthAPI: initiateOAuthLogin()
    AuthAPI->>OAuthProvider: Redirect to provider
    OAuthProvider->>User: Show login page
    User->>OAuthProvider: Authenticate
    OAuthProvider->>CallbackPage: Redirect with code
    CallbackPage->>AuthAPI: handleOAuthCallback(code)
    AuthAPI->>Backend: POST /api/auth/callback
    Backend-->>AuthAPI: { user, family, tokens }
    AuthAPI->>LocalStorage: Store tokens & data
    AuthAPI-->>CallbackPage: Success
    CallbackPage->>User: Redirect to dashboard
```

## 3. Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant RegisterForm
    participant AuthContext
    participant AuthAPI
    participant Backend

    User->>RegisterForm: Fill registration form
    RegisterForm->>RegisterForm: Validate (name, email, password, etc.)
    RegisterForm->>RegisterForm: Check password match
    RegisterForm->>AuthContext: register(data)
    AuthContext->>AuthAPI: registerUser()
    AuthAPI->>Backend: POST /api/auth/register
    Backend->>Backend: Create user & family
    Backend->>Backend: Set status to "pending"
    Backend-->>AuthAPI: { user, family, tokens }
    AuthAPI->>LocalStorage: Store tokens & data
    AuthAPI-->>RegisterForm: Success
    RegisterForm->>User: Show "Pending approval" message
```

## 4. Protected Route Flow

```mermaid
flowchart TD
    A[User visits protected route] --> B{Is authenticated?}
    B -->|No| C[Redirect to /auth/login]
    C --> D[Store return URL]
    D --> E[Show login page]
    
    B -->|Yes| F{Has required role?}
    F -->|No| G[Redirect to user's default page]
    G --> H{Check user role}
    H -->|family| I[Redirect to /family]
    H -->|trip_admin| J[Redirect to /admin]
    H -->|super_admin| K[Redirect to /super-admin]
    
    F -->|Yes| L[Render protected content]
```

## 5. Token Refresh Flow

```mermaid
sequenceDiagram
    participant Component
    participant AuthAPI
    participant Backend
    participant LocalStorage

    Component->>AuthAPI: API request
    AuthAPI->>Backend: Request with token
    Backend-->>AuthAPI: 401 Unauthorized
    AuthAPI->>AuthAPI: Check if refresh token exists
    AuthAPI->>Backend: POST /api/auth/refresh
    Backend-->>AuthAPI: { accessToken, refreshToken }
    AuthAPI->>LocalStorage: Update tokens
    AuthAPI->>Backend: Retry original request
    Backend-->>AuthAPI: Success response
    AuthAPI-->>Component: Return data
```

## 6. Component Architecture

```mermaid
graph TB
    A[App Root Layout] --> B[AuthProvider]
    B --> C[Toaster]
    B --> D[Page Components]
    
    D --> E[ProtectedRoute]
    E --> F{Auth Check}
    F -->|Pass| G[Render Children]
    F -->|Fail| H[Redirect]
    
    D --> I[UserNav]
    I --> J[useAuth Hook]
    
    D --> K[LoginForm]
    K --> J
    
    D --> L[RegisterForm]
    L --> J
    
    D --> M[OAuthButtons]
    M --> J
    
    J --> N[AuthContext]
    N --> O[Auth API Client]
    O --> P[Backend]
```

## 7. State Management

```mermaid
stateDiagram-v2
    [*] --> Loading: App starts
    Loading --> Unauthenticated: No tokens
    Loading --> Authenticated: Valid tokens
    
    Unauthenticated --> Authenticating: Login/Register
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure
    
    Authenticated --> Refreshing: Token expired (401)
    Refreshing --> Authenticated: Refresh success
    Refreshing --> Unauthenticated: Refresh failed
    
    Authenticated --> Unauthenticated: Logout
    
    Authenticated --> [*]: App closes
    Unauthenticated --> [*]: App closes
```

## 8. Validation Flow

```mermaid
flowchart LR
    A[User Input] --> B{Zod Validation}
    
    B -->|Email| C[Email Schema]
    C --> D{Valid?}
    D -->|No| E[Show Hebrew error]
    D -->|Yes| F[Continue]
    
    B -->|Password| G[Password Schema]
    G --> H{8+ chars, upper, lower, number?}
    H -->|No| I[Show strength error]
    H -->|Yes| F
    
    B -->|Phone| J[Phone Schema]
    J --> K{Israeli format?}
    K -->|No| L[Show format error]
    K -->|Yes| F
    
    F --> M[Submit Form]
```

## 9. Role-Based Access

```mermaid
graph TD
    A[User] --> B{Role}
    
    B -->|family| C[Family Routes]
    C --> C1[/family]
    C --> C2[/family/trips]
    C --> C3[/profile]
    
    B -->|trip_admin| D[Trip Admin Routes]
    D --> D1[/admin]
    D --> D2[/admin/trip/:id]
    D --> D3[All family routes]
    
    B -->|super_admin| E[Super Admin Routes]
    E --> E1[/super-admin]
    E --> E2[/super-admin/activity-log]
    E --> E3[All other routes]
```

## 10. Error Handling

```mermaid
flowchart TD
    A[API Error] --> B{Error Type}
    
    B -->|400| C[Validation Error]
    C --> D[Show field errors]
    
    B -->|401| E[Unauthorized]
    E --> F{Has refresh token?}
    F -->|Yes| G[Try refresh]
    F -->|No| H[Redirect to login]
    G -->|Success| I[Retry request]
    G -->|Fail| H
    
    B -->|403| J[Forbidden]
    J --> K[Redirect to user's page]
    
    B -->|404| L[Not Found]
    L --> M[Show error message]
    
    B -->|500| N[Server Error]
    N --> O[Show generic error]
```

---

## Component Dependencies

```
AuthContext
    ├── Uses: auth API client
    ├── Provides: user, family, isAuthenticated, login, logout, etc.
    └── Used by: All auth components

LoginForm
    ├── Uses: AuthContext, validation schemas
    └── Renders: Email field, password field, submit button

RegisterForm
    ├── Uses: AuthContext, validation schemas
    └── Renders: Name, email, password, phone, family name fields

OAuthButtons
    ├── Uses: AuthContext
    └── Renders: Google button, Facebook button

ProtectedRoute
    ├── Uses: AuthContext
    ├── Checks: Authentication, roles
    └── Renders: Children or redirects

UserNav
    ├── Uses: AuthContext
    └── Renders: Avatar, dropdown menu, logout button

AuthStatus
    ├── Uses: AuthContext
    └── Renders: Role badge
```

---

## Key Points

### Security
1. Tokens stored in localStorage (consider httpOnly cookies for production)
2. Automatic token refresh on 401
3. Password strength validation enforced
4. Role-based access control at route level

### UX
1. Loading states for all async operations
2. Hebrew error messages throughout
3. RTL layout support
4. Smooth redirects with return URLs
5. Toast notifications for user feedback

### Developer Experience
1. TypeScript for type safety
2. Zod for runtime validation
3. React Hook Form for form management
4. Reusable components
5. Clean API with useAuth hook
