import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketChatOptions {
  onToken?: (token: string) => void;
  onDone?: () => void;
  enabled?: boolean;
}

export const useChat = ({ onToken, onDone, enabled = true }: UseSocketChatOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const isFirstCleanup = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = import.meta.env.VITE_OCL_DASHBOARD_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('supabase.auth.token');
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('token', (data: { text: string } | string) => {
      const token = typeof data === 'string' ? data : data.text;
      onToken?.(token);
    });

    socket.on('done', () => {
      onDone?.();
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      if (isFirstCleanup.current) {
        isFirstCleanup.current = false;
        return;
      }

      if (socket?.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [enabled, onToken, onDone]);

  const sendMessage = useCallback((conversationId: string, message: string) => {
    if (!socketRef.current?.connected) {
      return false;
    }

    socketRef.current.emit('chat', { conversationId, message });
    return true;
  }, []);

  return {
    sendMessage,
    isConnected,
    error,
  };
};
