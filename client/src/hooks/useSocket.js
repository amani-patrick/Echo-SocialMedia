import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = () => {
  const { token } = useAuth();
  const [connectionState, setConnectionState] = useState('disconnected');

  const socket = useMemo(() => {
    if (!token || !SOCKET_URL) return null;
    return io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket']
    });
  }, [token]);

  useEffect(() => {
    if (!socket) {
      setConnectionState('disabled');
      return undefined;
    }
    socket.connect();
    setConnectionState('connecting');

    socket.on('connect', () => setConnectionState('connected'));
    socket.on('disconnect', () => setConnectionState('disconnected'));
    socket.on('connect_error', () => setConnectionState('unavailable'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connectionState };
};

