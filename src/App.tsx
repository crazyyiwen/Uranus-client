import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { EditorPage } from '@/pages/EditorPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login or editor based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/editor" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
