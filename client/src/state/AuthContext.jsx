import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem('echosols.session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());
  const [profile, setProfile] = useState(null);
  const token = session?.token;

  useEffect(() => {
    if (session) {
      localStorage.setItem('echosols.session', JSON.stringify(session));
    } else {
      localStorage.removeItem('echosols.session');
    }
  }, [session]);

  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return instance;
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return null;
    }
    try {
      const { data } = await authAxios.get('/api/users/me');
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch profile', err);
      if (err.response?.status === 401) {
        setSession(null);
      }
      return null;
    }
  }, [authAxios, token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async ({ usernameOrEmail, password }) => {
    const { data } = await axios.post(`${API_URL}/api/users/login`, {
      usernameOrEmail,
      password
    });
    setSession({ token: data.token, username: data.username, email: data.email });
    return data;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    await axios.post(`${API_URL}/api/users/register`, {
      username,
      email,
      password
    });
    // auto login
    await login({ usernameOrEmail: username, password });
  }, [login]);

  const logout = useCallback(() => {
    setSession(null);
    setProfile(null);
  }, []);

  const ctxValue = useMemo(() => ({
    token,
    session,
    profile,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    refreshProfile,
    authAxios
  }), [token, session, profile, login, register, logout, refreshProfile, authAxios]);

  return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return value;
};

