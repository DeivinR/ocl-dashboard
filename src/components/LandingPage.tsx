import { Briefcase, LogOut, ChevronRight, UploadCloud, TrendingUp, Sparkles, SendHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useCallback } from 'react';
import { useChat } from '../hooks/useSocketChat';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SECTIONS: Section[] = [
  {
    id: 'honorario',
    title: 'Honorário',
    description: 'Gestão de recuperação, renegociação e entrega amigável',
    icon: Briefcase,
    color: 'from-ocl-primary to-ocl-secondary',
  },
  {
    id: 'desempenho',
    title: 'Desempenho',
    description: 'Análise de performance e resultados operacionais',
    icon: TrendingUp,
    color: 'from-emerald-600 to-teal-600',
  },
];

interface LandingPageProps {
  onSectionSelect: (sectionId: string) => void;
  onUpload: () => void;
  onLogout: () => void;
  onSendMessage?: (message: string) => void;
}

export const LandingPage = ({ onSectionSelect, onUpload, onLogout, onSendMessage }: Readonly<LandingPageProps>) => {
  const { profile, supabase } = useAuth();
  const [query, setQuery] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');

  const handleToken = useCallback((token: string) => {
    setStreamingResponse((prev) => prev + token);
  }, []);

  const getAccessToken = useCallback(
    () =>
      supabase?.auth.getSession().then(({ data }) => data.session?.access_token ?? null) ??
      Promise.resolve(null),
    [supabase],
  );

  const { sendMessage: sendSocketMessage, isConnected } = useChat({
    onToken: handleToken,
    enabled: true,
    getAccessToken,
  });

  const handleChatSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    const message = query.trim();
    setQuery('');
    setStreamingResponse('');

    if (isConnected) {
      const conversationId = `conv-${Date.now()}`;
      sendSocketMessage(conversationId, message);
    }

    onSendMessage?.(message);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="OCL" className="h-12 object-contain" />
          {profile?.fullName && (
            <div className="hidden flex-col leading-tight md:flex">
              <div className="text-sm font-bold text-slate-900">{profile.fullName}</div>
              <div className="text-xs text-slate-500">{profile?.cargo}</div>
            </div>
          )}
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

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
              Olá, {profile?.fullName?.split(' ')[0] || 'Bem-vindo'}!
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">O que você gostaria de analisar hoje?</p>
          </div>

          <div className="mb-16">
            <form
              onSubmit={handleChatSubmit}
              className="group relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-ocl-primary/50"
            >
              <div className="flex items-center gap-3 px-4 py-2">
                <Sparkles className="animate-pulse text-ocl-primary" size={24} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pergunte sobre honorários, performance ou envie um comando..."
                  className="flex-1 bg-transparent text-lg text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="rounded-xl bg-ocl-primary p-3 text-white transition-all hover:bg-ocl-dark disabled:opacity-30"
                >
                  <SendHorizontal size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-50 bg-slate-50/50 px-4 py-2">
                {streamingResponse && (
                  <div className="flex-1 text-xs text-slate-700">
                    <strong>Resposta:</strong> {streamingResponse}
                  </div>
                )}
                {!streamingResponse && (
                  <>
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Sugestões:</span>
                    <button
                      type="button"
                      onClick={() => setQuery('Resumo de performance mensal')}
                      className="text-xs text-slate-500 transition-colors hover:text-ocl-primary"
                    >
                      "Resumo mensal"
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setQuery('Status de entregas amigáveis')}
                      className="text-xs text-slate-500 transition-colors hover:text-ocl-primary"
                    >
                      "Status de entregas"
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionSelect(section.id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 text-left shadow-lg ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-ocl-primary/20"
                >
                  <div
                    className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${section.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={32} />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-ocl-primary">
                    {section.title}
                  </h2>
                  <p className="mb-8 text-slate-600">{section.description}</p>

                  <div className="mt-auto flex items-center text-sm font-bold text-ocl-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                    Acessar Módulo <ChevronRight size={16} className="ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} OCL. Todos os direitos reservados.
      </footer>
    </div>
  );
};
