import { useState, useCallback, useEffect, useRef } from 'react';
import type { ThreadMessageLike } from '@assistant-ui/core';
import { ArrowLeft, LogOut, UploadCloud, Bot } from 'lucide-react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { SocketChatRuntime } from '../components/chat/SocketChatRuntime';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ChatComposer } from '../components/chat/ChatComposer';
import { EmptyState } from '../components/chat/EmptyState';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatMessagesSkeleton } from '../components/ui/Skeleton';
import type { Conversation } from '../types';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useMessages,
} from '../hooks/useConversations';

function apiMessagesToThreadMessages(
  messages: { id: string; role: 'user' | 'assistant'; content: string }[],
): ThreadMessageLike[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: [{ type: 'text', text: m.content }],
  }));
}

interface ChatPageProps {
  getAccessToken: () => Promise<string | null>;
  initialMessage: string | null;
  onInitialMessageConsumed: () => void;
  onBack: () => void;
  onUpload: () => void;
  onLogout: () => void;
}

export function ChatPage({
  getAccessToken,
  initialMessage,
  onInitialMessageConsumed,
  onBack,
  onUpload,
  onLogout,
}: Readonly<ChatPageProps>) {
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const { conversations, loading, error, refetch } = useConversations(getAccessToken);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const createMutation = useCreateConversation(getAccessToken);
  const createMutationRef = useRef(createMutation);
  createMutationRef.current = createMutation;

  const deleteMutation = useDeleteConversation(getAccessToken);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const messagesQuery = useMessages(selectedConversationId, getAccessToken);
  const currentMessages =
    selectedConversationId && messagesQuery.data ? apiMessagesToThreadMessages(messagesQuery.data) : [];
  const messagesLoading = !!selectedConversationId && messagesQuery.isLoading;

  const handleNewChat = useCallback(async () => {
    const mutation = createMutationRef.current;
    if (mutation.isPending) return;
    mutation.reset();

    const conv = await mutation.mutateAsync();
    setSelectedConversationId(conv.id);
  }, []);

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      if (id === null) {
        handleNewChat();
        return;
      }
      setSelectedConversationId(id);
    },
    [handleNewChat],
  );

  const initialCreateAttempted = useRef(false);
  useEffect(() => {
    if (initialMessage == null || initialMessage.trim() === '' || selectedConversationId !== null) return;
    if (initialCreateAttempted.current) return;
    initialCreateAttempted.current = true;
    const mutation = createMutationRef.current;
    mutation
      .mutateAsync()
      .then((conv: Conversation) => {
        setSelectedConversationId(conv.id);
      })
      .catch(() => { });
  }, [initialMessage, selectedConversationId]);

  const handleConversationCreated = useCallback((id: string) => {
    setSelectedConversationId(id);
    void refetchRef.current(undefined);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (selectedConversationId === id) setSelectedConversationId(null);
        },
      });
    },
    [deleteMutation, selectedConversationId],
  );

  let createError: string | null = null;
  if (createMutation.isError && createMutation.error) {
    createError =
      createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create conversation';
  }

  const mainContent =
    selectedConversationId === null ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-slate-500">
        {createError && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-600">{createError}</p>}
        <p className="text-sm">Selecione uma conversa ou inicie uma nova.</p>
      </div>
    ) : (
      <SocketChatRuntime
        getAccessToken={getAccessToken}
        conversationId={selectedConversationId}
        initialMessages={currentMessages}
        onConversationCreated={handleConversationCreated}
        initialMessage={initialMessage}
        onInitialMessageConsumed={onInitialMessageConsumed}
      >
        <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
          <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
            <ThreadPrimitive.Empty>
              <EmptyState />
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages components={{ Message: ChatMessageBubble }} />
            <div className="h-4" />
          </ThreadPrimitive.Viewport>
          <ThreadPrimitive.ViewportFooter>
            <ChatComposer />
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Root>
      </SocketChatRuntime>
    );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OCL" className="h-12 object-contain" />
            <div className="hidden h-5 w-px bg-slate-200 md:block" />
            <div className="hidden items-center gap-1.5 md:flex">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-ocl-primary to-ocl-secondary">
                <Bot size={11} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Assistente IA</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 md:px-4"
          >
            <UploadCloud size={18} />
            <span className="hidden md:inline">Upload de Dados</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          creating={createMutation.isPending}
          deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          {messagesLoading ? (
            <ChatMessagesSkeleton />
          ) : (
            mainContent
          )}
        </div>
      </main>

      <style>{`
        @keyframes aui-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
