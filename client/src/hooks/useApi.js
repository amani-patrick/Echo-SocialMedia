import { useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useApi = () => {
  const { token } = useAuth();

  return useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return instance;
  }, [token]);
};

