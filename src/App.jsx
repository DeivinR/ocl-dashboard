import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Handshake,
  Car,
  Gavel,
  FileText,
  Calendar,
  Menu,
  Loader2,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
} from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';
import { ProductDashboard } from './components/ProductDashboard';
import { FileUploader } from './components/FileUploader';
import { LoginScreen } from './components/LoginScreen';

const GET_ENV = (key) => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return null;
};

const SUPABASE_URL = GET_ENV('NEXT_PUBLIC_SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = GET_ENV('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';

const LOGO_LIGHT_URL = '/logo-white.png';

const App = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('CONSOLIDADO');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isHomolog, setIsHomolog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);
  const isMobile = useIsMobile();
  const isConfigured = !SUPABASE_URL.includes('xyzcompany');

  const MENU = [
    { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
    { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
    { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
    { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
    { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
    { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
    { id: 'gestao', label: 'Gestão de Dados', icon: Database, spacing: true },
  ];

  useEffect(() => {
    const loadSupabase = async () => {
      if (globalThis.supabase) {
        setSupabase(
          globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { storage: globalThis.sessionStorage },
          }),
        );
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        if (globalThis.supabase) {
          setSupabase(
            globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              auth: { storage: globalThis.sessionStorage },
            }),
          );
        }
      };
      document.head.appendChild(script);
    };
    loadSupabase();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    const INACTIVITY_LIMIT = 10 * 60 * 1000;
    let timeout;
    const handleLogoutTimer = () => {
      handleLogout();
    };
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogoutTimer, INACTIVITY_LIMIT);
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [user, supabase]);

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setIsHomolog(false);
        setLoading(true);
        supabase
          .from('dashboards')
          .select('content')
          .eq('id', 'latest')
          .single()
          .then(({ data: dbData }) => {
            if (dbData?.content) setData(dbData.content);
            setLoading(false);
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsHomolog(false);
    setData(null);
    setUser(null);
  };
  const currentIndex = MENU.findIndex((m) => m.id === activeTab);
  const nextTab =
    currentIndex < MENU.length - 1 && MENU[currentIndex + 1].id !== 'gestao' ? MENU[currentIndex + 1] : null;
  const prevTab = currentIndex > 0 ? MENU[currentIndex - 1] : null;

  if (loading)
    return (
      <div className="flex items-center justify-center bg-[#F1F5F9]" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-[#003366]" />
      </div>
    );
  if (!user && !isHomolog)
    return (
      <LoginScreen
        supabase={supabase}
        onLogin={() => {}}
        onHomolog={() => {
          setIsHomolog(true);
          setLoading(false);
        }}
        configError={!isConfigured}
      />
    );

  return (
    <div
      className="flex flex-col overflow-hidden bg-[#F1F5F9] font-sans text-slate-800 md:flex-row"
      style={{ minHeight: '100vh' }}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#003366] to-[#001a33] text-white shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'} ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
      >
        <div className="relative flex h-24 items-center justify-center border-b border-white/10 p-6">
          {isSidebarOpen ? (
            <img src={LOGO_LIGHT_URL} alt="OCL" className="h-10 object-contain" />
          ) : (
            <img src={LOGO_LIGHT_URL} className="h-8" />
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-8 text-white/50">
              <X />
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {MENU.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'translate-x-1 bg-white font-bold text-[#003366] shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <item.icon size={20} /> {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white/60 transition-colors hover:bg-white/5 hover:text-white ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm">Sair do Sistema</span>}
          </button>
          {isSidebarOpen && isHomolog && (
            <div className="mt-2 text-center font-mono text-[10px] text-amber-400">AMBIENTE DE TESTE</div>
          )}
        </div>
      </aside>
      <main
        className={`flex flex-1 flex-col transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-72' : 'ml-20'}`}
        style={{ minHeight: '100vh' }}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <h2 className="hidden text-lg font-bold text-[#003366] md:block">
              {MENU.find((m) => m.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isMobile && (
              <div className="flex gap-1">
                {/* BOTÃO LOGOUT MOBILE */}
                <button onClick={handleLogout} className="mr-2 rounded-lg bg-red-50 p-2 text-red-600" title="Sair">
                  <LogOut size={16} />
                </button>
                <button
                  onClick={() => {
                    if (prevTab) setActiveTab(prevTab.id);
                  }}
                  disabled={!prevTab}
                  className="rounded-lg bg-slate-100 p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    if (nextTab) setActiveTab(nextTab.id);
                  }}
                  disabled={!nextTab}
                  className="rounded-lg bg-slate-100 p-2 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {data && (
              <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#003366]">
                <Calendar size={14} /> {data.currentDU}º Dia Útil
              </div>
            )}
          </div>
        </header>
        <div className="relative flex-1 overflow-y-auto p-4 md:p-8">
          {isMobile && isSidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 m-0 h-full w-full cursor-default appearance-none border-none bg-black/50 p-0"
              aria-label="Fechar menu"
              onClick={() => setSidebarOpen(false)}
            ></button>
          )}
          {activeTab === 'gestao' ? (
            <FileUploader supabase={supabase} onDataSaved={setData} isMobile={isMobile} isHomolog={isHomolog} />
          ) : data ? (
            <ProductDashboard
              category={activeTab}
              data={data}
              isMobile={isMobile}
              onNext={() => {
                if (nextTab) {
                  setActiveTab(nextTab.id);
                  window.scrollTo(0, 0);
                }
              }}
              nextName={nextTab?.label}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <Database size={64} className="mb-4 opacity-20" />
              <p>Nenhum dado carregado.</p>
              <button onClick={() => setActiveTab('gestao')} className="mt-4 font-bold text-[#003366] hover:underline">
                Ir para Gestão de Dados
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
