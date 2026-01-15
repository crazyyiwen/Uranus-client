# Authentication Setup

## Overview

The application now includes a complete authentication system with login and signup pages. User authentication is handled by the backend API running on `http://localhost:3316`.

## Features

- **Login Page** - Sign in with email or username
- **Signup Page** - Create new account with email, username, and password
- **Protected Routes** - Editor page requires authentication
- **User Menu** - Display current user and logout button
- **Auto-redirect** - Redirect to login if not authenticated, redirect to editor if already logged in

## How It Works

### Authentication Flow

1. **Signup**:
   - User fills out signup form (email, username, password)
   - Frontend validates input (password match, email format, etc.)
   - POST request to `http://localhost:3316/signup` with:
     ```json
     { "username": "...", "email": "...", "password": "..." }
     ```
   - Backend creates user and returns user data (+ token if applicable)
   - User automatically logged in and redirected to `/editor`

2. **Login**:
   - User enters username + password
   - POST request to `http://localhost:3316/login` with:
     ```json
     { "username": "...", "password": "..." }
     ```
   - Backend validates credentials and returns user data (+ token if applicable)
   - If successful, user logged in and redirected to `/editor`
   - If failed, error message displayed

3. **Logout**:
   - Click user menu in top nav
   - Click "Log out"
   - Auth token removed from localStorage
   - Redirected to `/login` page

### Routes

```typescript
/               - Root (redirects to /login or /editor based on auth status)
/login          - Login page
/signup         - Signup page
/editor         - Protected workflow editor (requires auth)
```

### Protected Routes

The `ProtectedRoute` component wraps the editor page:

```tsx
<ProtectedRoute>
  <EditorPage />
</ProtectedRoute>
```

If user is not authenticated, automatically redirects to `/login`.

### Auth Store

Located at `src/store/authStore.ts`:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}
```

State persists across page refreshes using Zustand's `persist` middleware.

## Data Storage

### LocalStorage Keys

- `auth-storage` - Auth state (user object, isAuthenticated flag) - persisted by Zustand
- `auth_token` - JWT or session token returned by backend (if provided)

### User Object

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
```

## Backend API Endpoints

### Required Endpoints

**Signup**: `POST http://localhost:3316/signup`
```json
// Request
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}

// Response (expected)
{
  "id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "token": "jwt_token_here" // Optional but recommended
}
```

**Login**: `POST http://localhost:3316/login`
```json
// Request
{
  "username": "johndoe",
  "password": "password123"
}

// Response (expected)
{
  "id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "token": "jwt_token_here" // Optional but recommended
}
```

## Making Authenticated API Requests

Use the utility functions in `src/utils/api.ts` for authenticated requests:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/api';

// Example: Save workflow to backend
const saveWorkflow = async (workflow: WorkflowData) => {
  try {
    const result = await apiPost('/api/workflows', workflow);
    console.log('Saved:', result);
  } catch (error) {
    console.error('Failed to save:', error);
  }
};

// Example: Load workflows from backend
const loadWorkflows = async () => {
  try {
    const workflows = await apiGet<WorkflowData[]>('/api/workflows');
    return workflows;
  } catch (error) {
    console.error('Failed to load:', error);
    return [];
  }
};
```

The utility functions automatically include the JWT token in the `Authorization` header if available.

## Security Considerations

### Backend Requirements

The backend API should implement:

1. **Password Hashing**: Use bcrypt or argon2
2. **JWT Tokens**: Return tokens for session management
3. **Token Validation**: Verify JWT on protected endpoints
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS to allow requests from frontend
6. **Rate Limiting**: Prevent brute force attacks
7. **Email Verification**: Verify user emails (optional)
8. **Password Reset**: Forgot password flow (optional)

### CORS Configuration

Your backend must allow requests from the frontend:

```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5174', // Vite dev server
  credentials: true
}));
```

## Testing the Auth System

### Prerequisites

1. **Start your backend server** on `http://localhost:3316`
   - Ensure `/signup` and `/login` endpoints are working
   - Test with curl or Postman first

2. **Start the frontend dev server**:
   ```bash
   npm run dev
   ```

### Testing Flow

1. **Visit** http://localhost:5174/

2. **Sign up**:
   - Click "Sign up"
   - Fill out form (username, email, password)
   - Click "Create Account"
   - Should POST to `http://localhost:3316/signup`
   - If successful, redirects to editor

3. **Log out**:
   - Click user menu in top-right
   - Click "Log out"
   - Redirects to login

4. **Log in**:
   - Enter username and password
   - Click "Sign In"
   - Should POST to `http://localhost:3316/login`
   - If successful, redirects to editor

### Troubleshooting

**"Unable to connect to server"**:
- Make sure backend is running on port 3316
- Check CORS is enabled on backend
- Check browser console for CORS errors

**"Invalid username or password"**:
- Check backend response in Network tab
- Verify payload format matches expected structure
- Check backend logs for errors

## Files Created

```
src/
├── store/
│   └── authStore.ts              # Auth state management
├── pages/
│   ├── Login.tsx                 # Login page
│   ├── Signup.tsx                # Signup page
│   └── EditorPage.tsx            # Workflow editor (moved from App.tsx)
├── components/
│   ├── ProtectedRoute.tsx        # Auth guard component
│   └── TopNavigation/
│       └── TopNav.tsx            # Updated with user menu + logout
└── App.tsx                       # Updated with routing
```

## Dependencies Added

- `react-router-dom` - Client-side routing
- `zustand/middleware` - Persist middleware for auth state
