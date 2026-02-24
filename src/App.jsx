import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wallet, Handshake, Car, Gavel, FileText, 
  Calendar, Menu, Loader2, ShieldAlert, 
  X, ChevronLeft, ChevronRight, Database, LogOut
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

const LOGO_LIGHT_URL = "/logo-white.png";

const App = () => {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('CONSOLIDADO');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isHomolog, setIsHomolog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState(null);
    const isMobile = useIsMobile();
    const isConfigured = !SUPABASE_URL.includes("xyzcompany");

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
                setSupabase(globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: { storage: globalThis.sessionStorage }
                })); 
                return; 
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => { 
                if (globalThis.supabase) {
                    setSupabase(globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: { storage: globalThis.sessionStorage }
                    }));
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
        const handleLogoutTimer = () => { handleLogout(); };
        const resetTimer = () => { clearTimeout(timeout); timeout = setTimeout(handleLogoutTimer, INACTIVITY_LIMIT); };
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer();
        return () => { clearTimeout(timeout); events.forEach(event => document.removeEventListener(event, resetTimer)); };
    }, [user, supabase]);

    useEffect(() => {
        if (!supabase) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user); setIsHomolog(false); setLoading(true);
                supabase.from('dashboards').select('content').eq('id', 'latest').single().then(({ data: dbData }) => {
                        if (dbData?.content) setData(dbData.content);
                        setLoading(false);
                    });
            } else { setUser(null); setLoading(false); }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => { if (supabase) { await supabase.auth.signOut(); } setIsHomolog(false); setData(null); setUser(null); };
    const currentIndex = MENU.findIndex(m => m.id === activeTab);
    const nextTab = currentIndex < MENU.length - 1 && MENU[currentIndex + 1].id !== 'gestao' ? MENU[currentIndex + 1] : null;
    const prevTab = currentIndex > 0 ? MENU[currentIndex - 1] : null;

    if (loading) return <div className="flex items-center justify-center bg-[#F1F5F9]" style={{ minHeight: '100vh' }}><Loader2 size={40} className="text-[#003366] animate-spin"/></div>;
    if (!user && !isHomolog) return <LoginScreen supabase={supabase} onLogin={() => {}} onHomolog={() => { setIsHomolog(true); setLoading(false); }} configError={!isConfigured} />;

    return (
        <div className="flex flex-col md:flex-row bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden" style={{ minHeight: '100vh' }}>
            <aside className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#003366] to-[#001a33] text-white transition-all duration-300 shadow-2xl flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'} ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}>
                <div className="p-6 flex items-center justify-center h-24 border-b border-white/10 relative">
                    {isSidebarOpen ? <img src={LOGO_LIGHT_URL} alt="OCL" className="h-10 object-contain"/> : <img src={LOGO_LIGHT_URL} className="h-8"/>}
                    {isMobile && <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-8 text-white/50"><X/></button>}
                </div>
                <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                    {MENU.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'bg-white text-[#003366] shadow-lg translate-x-1 font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                            <item.icon size={20} /> {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${!isSidebarOpen && 'justify-center'}`}><LogOut size={20} />{isSidebarOpen && <span className="text-sm">Sair do Sistema</span>}</button>
                    {isSidebarOpen && isHomolog && <div className="text-center text-[10px] text-amber-400 mt-2 font-mono">AMBIENTE DE TESTE</div>}
                </div>
            </aside>
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-72' : 'ml-20')}`} style={{ minHeight: '100vh' }}>
                <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex justify-between items-center shadow-sm h-16">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Menu size={20} /></button>
                        <h2 className="font-bold text-[#003366] text-lg hidden md:block">{MENU.find(m => m.id === activeTab)?.label}</h2>
                     </div>
                     <div className="flex items-center gap-3">
                         {isMobile && (
                             <div className="flex gap-1">
                                 {/* BOTÃO LOGOUT MOBILE */}
                                 <button onClick={handleLogout} className="p-2 bg-red-50 text-red-600 rounded-lg mr-2" title="Sair"><LogOut size={16}/></button>
                                 <button onClick={() => {if(prevTab) setActiveTab(prevTab.id)}} disabled={!prevTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronLeft size={16}/></button>
                                 <button onClick={() => {if(nextTab) setActiveTab(nextTab.id)}} disabled={!nextTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronRight size={16}/></button>
                             </div>
                         )}
                         {data && (<div className="bg-blue-50 text-[#003366] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100"><Calendar size={14}/> {data.currentDU}º Dia Útil</div>)}
                     </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {isMobile && isSidebarOpen && <button type="button" className="fixed inset-0 bg-black/50 z-40 w-full h-full cursor-default border-none p-0 m-0 appearance-none" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)}></button>}
                    {activeTab === 'gestao' ? (<FileUploader supabase={supabase} onDataSaved={setData} isMobile={isMobile} isHomolog={isHomolog} />) : (data ? (<ProductDashboard category={activeTab} data={data} isMobile={isMobile} onNext={() => { if(nextTab) { setActiveTab(nextTab.id); window.scrollTo(0,0); }}} nextName={nextTab?.label} />) : (<div className="flex flex-col items-center justify-center h-full text-slate-400"><Database size={64} className="mb-4 opacity-20"/><p>Nenhum dado carregado.</p><button onClick={() => setActiveTab('gestao')} className="mt-4 text-[#003366] font-bold hover:underline">Ir para Gestão de Dados</button></div>))}
                </div>
            </main>
        </div>
    );
};

export default App;