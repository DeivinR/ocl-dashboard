import { useState } from 'react';
import { Loader2, Database as DatabaseIcon } from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import { AppShell } from './components/shell/AppShell';
import { ProductDashboard } from './components/ProductDashboard';
import { FileUploader } from './components/FileUploader';
import { LoginScreen } from './components/LoginScreen';

const App = () => {
  const { user, data, setData, loading, isHomolog, isConfigured, supabase, logout, enterHomolog } = useAuth();
  const { menu, activeTab, setActiveTab, prevTab, nextTab, goToNext } = useNavigation();
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const isMobile = useIsMobile();

  if (loading)
    return (
      <div className="flex items-center justify-center bg-brand-bg" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-ocl-primary" />
      </div>
    );
  if (!user && !isHomolog)
    return <LoginScreen supabase={supabase} onHomolog={enterHomolog} configError={!isConfigured} />;

  const dataContent = data ? (
    <ProductDashboard
      category={activeTab}
      data={data}
      isMobile={isMobile}
      onNext={goToNext}
      nextName={nextTab?.label}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <DatabaseIcon size={64} className="mb-4 opacity-20" />
      <p>Nenhum dado carregado.</p>
      <button onClick={() => setActiveTab('gestao')} className="mt-4 font-bold text-ocl-primary hover:underline">
        Ir para Gestão de Dados
      </button>
    </div>
  );

  return (
    <AppShell
      menu={menu}
      activeTab={activeTab}
      isMobile={isMobile}
      isSidebarOpen={isSidebarOpen}
      isHomolog={isHomolog}
      currentDU={data?.currentDU}
      prevTab={prevTab}
      nextTab={nextTab}
      onTabChange={setActiveTab}
      onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
      onLogout={logout}
    >
      {activeTab === 'gestao' ? (
        <FileUploader supabase={supabase} onDataSaved={setData} isHomolog={isHomolog} />
      ) : (
        dataContent
      )}
    </AppShell>
  );
};

export default App;
