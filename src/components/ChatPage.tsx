import { ArrowLeft, LogOut, UploadCloud, Bot } from 'lucide-react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { SocketChatRuntime } from './chat/SocketChatRuntime';
import { ChatMessageBubble } from './chat/ChatMessageBubble';
import { ChatComposer } from './chat/ChatComposer';
import { EmptyState } from './chat/EmptyState';

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

      <main className="flex min-h-0 flex-1 flex-col">
        <SocketChatRuntime
          getAccessToken={getAccessToken}
          initialMessage={initialMessage}
          onInitialMessageConsumed={onInitialMessageConsumed}
        >
          <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
            <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
              <ThreadPrimitive.Empty>
                <EmptyState onSuggest={() => {}} />
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ Message: ChatMessageBubble }} />
              <div className="h-4" />
            </ThreadPrimitive.Viewport>
            <ThreadPrimitive.ViewportFooter>
              <ChatComposer />
            </ThreadPrimitive.ViewportFooter>
          </ThreadPrimitive.Root>
        </SocketChatRuntime>
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
