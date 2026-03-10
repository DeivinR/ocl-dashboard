import { useState, useCallback, useEffect, useRef } from 'react';
import type { ThreadMessageLike } from '@assistant-ui/core';
import { ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { SocketChatRuntime } from './chat/SocketChatRuntime';
import { ChatMessageBubble } from './chat/ChatMessageBubble';
import { ChatComposer } from './chat/ChatComposer';
import { EmptyState } from './chat/EmptyState';
import { StandaloneComposer } from './chat/StandaloneComposer';
import { ConversationList } from './chat/ConversationList';
import type { Conversation } from '../interfaces/conversation';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversation,
  useMessages,
} from '../hooks/useConversations';

const SUGGESTIONS = ['Repasse de cash no mês', 'Batimento de meta por região', 'Retomadas realizadas no mês'];

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
  userName: string;
  userRole: string;
}

export function ChatPage({
  getAccessToken,
  initialMessage,
  onInitialMessageConsumed,
  onBack,
  onLogout,
  userName,
  userRole,
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
  const updateMutation = useUpdateConversation(getAccessToken);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const messagesQuery = useMessages(selectedConversationId, getAccessToken);
  const currentMessages =
    selectedConversationId && messagesQuery.data ? apiMessagesToThreadMessages(messagesQuery.data) : [];

  const handleNewChat = useCallback(async () => {
    const mutation = createMutationRef.current;
    if (mutation.isPending) return;
    const conv = await mutation.mutateAsync();
    setSelectedConversationId(conv.id);
  }, []);

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      if (id === null) {
        void handleNewChat();
        return;
      }
      setSelectedConversationId(id);
    },
    [handleNewChat],
  );

  const initialCreateAttempted = useRef(false);
  useEffect(() => {
    if (!initialMessage?.trim() || selectedConversationId !== null) return;
    if (initialCreateAttempted.current) return;
    initialCreateAttempted.current = true;
    createMutationRef.current
      .mutateAsync()
      .then((conv: Conversation) => setSelectedConversationId(conv.id))
      .catch(() => {});
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

  const handleRenameConversation = useCallback(
    (id: string, title: string) => {
      updateMutation.mutate({ conversationId: id, title });
    },
    [updateMutation],
  );

  const handleStartWithMessage = useCallback((text: string) => {
    const mutation = createMutationRef.current;
    if (mutation.isPending) return;
    mutation
      .mutateAsync()
      .then((conv: Conversation) => {
        setSelectedConversationId(conv.id);
        setPendingMessage(text.trim());
      })
      .catch(() => {});
  }, []);

  const createError = (() => {
    if (!createMutation.isError) return null;
    if (createMutation.error instanceof Error) return createMutation.error.message;
    return 'Failed to create conversation';
  })();

  const userInitial = userName.trim().charAt(0).toUpperCase() || '?';

  const mainContent =
    selectedConversationId === null ? (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
          {createError && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-600">{createError}</p>}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ocl-primary to-ocl-secondary text-white shadow-lg">
              <Sparkles size={30} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Assistente OCL</h2>
              <p className="mt-1 text-sm text-slate-500">Faça uma pergunta ou escolha uma sugestão abaixo</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStartWithMessage(s)}
                disabled={createMutation.isPending}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-ocl-primary/30 hover:bg-ocl-primary/5 hover:text-ocl-primary disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <StandaloneComposer onSubmit={handleStartWithMessage} disabled={createMutation.isPending} />
      </div>
    ) : (
      <SocketChatRuntime
        getAccessToken={getAccessToken}
        conversationId={selectedConversationId}
        initialMessages={currentMessages}
        onConversationCreated={handleConversationCreated}
        initialMessage={pendingMessage ?? initialMessage}
        onInitialMessageConsumed={() => {
          setPendingMessage(null);
          onInitialMessageConsumed();
        }}
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <main className="flex h-full w-full">
        <aside
          className={`relative flex flex-col border-r border-slate-200 bg-slate-50/50 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-72' : 'w-16'
          }`}
        >
          <div className="flex h-16 items-center overflow-hidden border-b border-slate-200">
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'w-56 pl-4 opacity-100' : 'pointer-events-none w-0 opacity-0'
              }`}
            >
              <button
                onClick={onBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200/50"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="ml-3 flex-1 overflow-hidden">
                <img src="/logo.png" alt="OCL" className="h-7 object-contain" />
              </div>
            </div>
            <div className="flex w-16 shrink-0 items-center justify-center">
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200/50"
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <ConversationList
                conversations={conversations}
                loading={loading}
                error={error}
                selectedId={selectedConversationId}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onRename={handleRenameConversation}
                creating={createMutation.isPending}
                deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
                embedded
              />
            </div>
          </div>

          <div className="flex h-16 items-center overflow-hidden border-t border-slate-200">
            <div className="flex w-16 shrink-0 items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ocl-primary to-ocl-secondary text-xs font-semibold text-white shadow-sm">
                {userInitial}
              </div>
            </div>
            <div
              className={`flex min-w-0 flex-col transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'flex-1 opacity-100' : 'pointer-events-none w-0 opacity-0'
              }`}
            >
              <p className="truncate text-sm font-semibold text-slate-700">{userName}</p>
              <p className="truncate text-xs text-slate-500">{userRole}</p>
            </div>
            <div
              className={`transition-all duration-300 ${isSidebarOpen ? 'w-12 pr-2 opacity-100' : 'w-0 overflow-hidden opacity-0'}`}
            >
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{mainContent}</div>
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
