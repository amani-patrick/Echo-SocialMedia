import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { AppShell } from './components/AppShell.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Feed } from './pages/Feed.jsx';
import { Profile } from './pages/Profile.jsx';
import { Friends } from './pages/Friends.jsx';
import { Notifications } from './pages/Notifications.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={(
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          )}
        />
        <Route
          path="/friends"
          element={(
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          )}
        />
        <Route
          path="/notifications"
          element={(
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          )}
        />
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          )}
        />
      </Routes>
    </AppShell>
  );
}

