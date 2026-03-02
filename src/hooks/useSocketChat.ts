import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketChatOptions {
  onToken?: (token: string) => void;
  onDone?: () => void;
  onCancelled?: () => void;
  onError?: (message: string) => void;
  enabled?: boolean;
  getAccessToken?: () => Promise<string | null>;
}

export const useChat = ({
  onToken,
  onDone,
  onCancelled,
  onError,
  enabled = true,
  getAccessToken,
}: UseSocketChatOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const isFirstCleanup = useRef(true);
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = import.meta.env.VITE_OCL_DASHBOARD_BACKEND_URL || 'http://localhost:3000';
    let cancelled = false;
    const getToken = getAccessTokenRef.current;

    const connect = (token: string | null): (() => void) => {
      if (cancelled) return () => {};
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

      socket.on('token', (chunk: string) => {
        if (typeof chunk === 'string') onToken?.(chunk);
      });

      socket.on('done', () => {
        onDone?.();
      });

      socket.on('cancelled', () => {
        onCancelled?.();
        if (!onCancelled) onDone?.();
      });

      socket.on('error', (data: { message: string }) => {
        const msg = data?.message ?? 'Unknown error';
        setError(msg);
        onError?.(msg);
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
    };

    if (getToken) {
      let cleanup: (() => void) | null = null;
      getToken().then((token) => {
        if (!cancelled) cleanup = connect(token);
      });
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }

    let token: string | null = null;
    if (typeof sessionStorage !== 'undefined') {
      const sbKey = Object.keys(sessionStorage).find((k) => /^sb-[^-]+-auth-token$/.test(k));
      if (sbKey) {
        try {
          const raw = sessionStorage.getItem(sbKey);
          const parsed = raw ? (JSON.parse(raw) as { access_token?: string }) : null;
          token = parsed?.access_token ?? null;
        } catch {
          token = null;
        }
      }
    }
    return connect(token);
  }, [enabled, onToken, onDone]);

  const sendMessage = useCallback((conversationId: string, message: string) => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit('chat', { conversationId, message });
    setError(null);
    return true;
  }, []);

  const cancel = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cancelStream');
      socketRef.current.emit('cancel');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    sendMessage,
    cancel,
    isConnected,
    error,
    clearError,
  };
};
