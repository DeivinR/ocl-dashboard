import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ThreadMessageLike } from '@assistant-ui/core';
import type { AppendMessage } from '@assistant-ui/react';
import { useExternalStoreRuntime, AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChat } from '../../hooks/useSocketChat';

const MESSAGE_MAX = 10_000;

function genId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const ChatActionsContext = createContext<{ sendMessage: (text: string) => void } | null>(null);

export function useChatActions() {
  const ctx = useContext(ChatActionsContext);
  return ctx;
}

interface SocketChatRuntimeProps {
  getAccessToken: () => Promise<string | null>;
  conversationId: string;
  initialMessages: ThreadMessageLike[];
  onConversationCreated?: (id: string) => void;
  initialMessage: string | null;
  onInitialMessageConsumed: () => void;
  children: React.ReactNode;
}

export function SocketChatRuntime({
  getAccessToken,
  conversationId,
  initialMessages,
  onConversationCreated,
  initialMessage,
  onInitialMessageConsumed,
  children,
}: Readonly<SocketChatRuntimeProps>) {
  const [messages, setMessages] = useState<ThreadMessageLike[]>(() => initialMessages);
  const [isRunning, setIsRunning] = useState(false);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;
  const initialMessagesRef = useRef(initialMessages);
  initialMessagesRef.current = initialMessages;
  const streamingIdRef = useRef<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  const prevConversationIdRef = useRef(conversationId);

  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      setIsRunning(false);
      streamingIdRef.current = null;
    }
    if (!streamingIdRef.current) {
      setMessages(initialMessages);
    }
  }, [conversationId, initialMessages]);

  const finishStreaming = useCallback((status: NonNullable<ThreadMessageLike['status']>) => {
    const completedId = streamingIdRef.current;
    if (!completedId) return;
    streamingIdRef.current = null;
    setMessages((prev) => prev.map((m) => (m.id === completedId ? { ...m, status } : m)));
    setIsRunning(false);
  }, []);

  const onConversationCreatedRef = useRef(onConversationCreated);
  onConversationCreatedRef.current = onConversationCreated;

  const onDone = useCallback(
    (payload?: { conversationId?: string }) => {
      if (payload?.conversationId) onConversationCreatedRef.current?.(payload.conversationId);
      finishStreaming({ type: 'complete', reason: 'stop' });
    },
    [finishStreaming],
  );

  const onCancelled = useCallback(() => {
    finishStreaming({ type: 'incomplete', reason: 'cancelled' });
  }, [finishStreaming]);

  const onError = useCallback(
    (message: string) => {
      lastErrorRef.current = message;
      finishStreaming({ type: 'incomplete', reason: 'error', error: message });
    },
    [finishStreaming],
  );

  const onToken = useCallback((token: string) => {
    const targetId = streamingIdRef.current;
    if (!targetId) return;
    setMessages((prev) => {
      const last = prev.at(-1);
      if (last?.role !== 'assistant' || last?.id !== targetId) return prev;
      const content = Array.isArray(last.content) ? last.content : [];
      const textPart = content.find((p): p is { type: 'text'; text: string } => p.type === 'text');
      const newText = (textPart?.text ?? '') + token;
      const newContent = textPart
        ? content.map((p) => (p.type === 'text' ? { type: 'text', text: newText } : p))
        : [{ type: 'text', text: newText }];
      return prev.map((m) => (m.id === targetId ? { ...m, content: newContent } : m));
    });
  }, []);

  const { sendMessage, cancel, isConnected, error, clearError } = useChat({
    onToken,
    onDone,
    onCancelled,
    onError,
    enabled: true,
    getAccessToken,
  });

  const runTurn = useCallback(
    (text: string) => {
      clearError();
      const trimmed = text.trim();
      if (!trimmed) return;
      const message = trimmed.length > MESSAGE_MAX ? trimmed.slice(0, MESSAGE_MAX) : trimmed;
      const userMsg: ThreadMessageLike = {
        id: genId(),
        role: 'user',
        content: [{ type: 'text', text: message }],
      };
      const assistantId = genId();
      streamingIdRef.current = assistantId;
      const assistantMsg: ThreadMessageLike = {
        id: assistantId,
        role: 'assistant',
        content: [{ type: 'text', text: '' }],
        status: { type: 'running' },
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsRunning(true);
      sendMessage(conversationIdRef.current, message);
    },
    [sendMessage, clearError],
  );

  const onCancel = useCallback(async () => {
    cancel();
    onCancelled();
  }, [cancel, onCancelled]);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const part = message.content?.[0];
      if (part?.type !== 'text' || typeof (part as { text?: string }).text !== 'string') return;
      runTurn((part as { type: 'text'; text: string }).text);
    },
    [runTurn],
  );

  const initialConsumed = useRef<string | null>(null);
  useEffect(() => {
    if (!isConnected || initialMessage === null || initialMessage.trim() === '') return;
    const key = `${conversationId}:${initialMessage}`;
    if (initialConsumed.current === key) return;
    initialConsumed.current = key;
    runTurn(initialMessage.trim());
    onInitialMessageConsumed();
  }, [isConnected, initialMessage, conversationId, runTurn, onInitialMessageConsumed]);

  const convertMessage = useCallback((msg: ThreadMessageLike) => msg, []);
  const store = useMemo(
    () => ({
      messages,
      isRunning,
      onNew,
      onCancel,
      convertMessage,
    }),
    [messages, isRunning, onNew, onCancel, convertMessage],
  );

  const runtime = useExternalStoreRuntime(store);

  const chatActions = useMemo(() => ({ sendMessage: runTurn }), [runTurn]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatActionsContext.Provider value={chatActions}>
        {error && (
          <div className="flex items-center justify-between gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="rounded px-2 py-1 font-medium hover:bg-red-100">
              Fechar
            </button>
          </div>
        )}
        {children}
      </ChatActionsContext.Provider>
    </AssistantRuntimeProvider>
  );
}
