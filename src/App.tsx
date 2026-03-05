import { useState, lazy, Suspense, useCallback } from 'react';
import { Loader2, Database as DatabaseIcon } from 'lucide-react';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import { AppShell } from './components/shell/AppShell';
import { LoginScreen } from './components/LoginScreen';
import { LandingPage } from './components/LandingPage';
import { DataUploadPage } from './components/DataUploadPage';
import { ChatPage } from './components/ChatPage';

const ProductDashboard = lazy(() =>
  import('./components/ProductDashboard').then((m) => ({ default: m.ProductDashboard })),
);

const App = () => {
  const { user, data, setData, loading, isHomolog, isConfigured, supabase, logout, enterHomolog } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);
  const { menu, activeTab, setActiveTab, prevTab, nextTab, goToNext } = useNavigation(selectedSection ?? undefined);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const isMobile = useIsMobile();

  const handleSendMessage = useCallback((message: string) => {
    setInitialChatMessage(message);
    setSelectedSection('chat');
  }, []);

  const handleOpenChat = useCallback(() => {
    setSelectedSection('chat');
    setInitialChatMessage(null);
  }, []);

  const handleChatBack = useCallback(() => {
    setSelectedSection(null);
    setInitialChatMessage(null);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center bg-brand-bg" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-ocl-primary" />
      </div>
    );
  if (!user && !isHomolog)
    return <LoginScreen supabase={supabase} onHomolog={enterHomolog} configError={!isConfigured} />;

  if (!selectedSection)
    return (
      <LandingPage
        onSectionSelect={setSelectedSection}
        onUpload={() => setSelectedSection('upload')}
        onLogout={logout}
        onSendMessage={handleSendMessage}
        onOpenChat={handleOpenChat}
      />
    );

  if (selectedSection === 'chat') {
    return (
      <ChatPage
        getAccessToken={() =>
          supabase?.auth.getSession().then(({ data }) => data.session?.access_token ?? null) ?? Promise.resolve(null)
        }
        initialMessage={initialChatMessage}
        onInitialMessageConsumed={() => setInitialChatMessage(null)}
        onBack={handleChatBack}
        onUpload={() => setSelectedSection('upload')}
        onLogout={logout}
      />
    );
  }

  if (selectedSection === 'upload') {
    return (
      <DataUploadPage
        supabase={supabase}
        isHomolog={isHomolog}
        onDataSaved={setData}
        onBack={() => setSelectedSection(null)}
        onLogout={logout}
      />
    );
  }

  const dataContent = data ? (
    <ProductDashboard
      category={activeTab}
      data={data}
      isMobile={isMobile}
      onNext={goToNext}
      nextName={nextTab?.label}
      section={selectedSection ?? undefined}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <DatabaseIcon size={64} className="mb-4 opacity-20" />
      <p>Nenhum dado carregado.</p>
      <button onClick={() => setSelectedSection('upload')} className="mt-4 font-bold text-ocl-primary hover:underline">
        Fazer upload de dados
      </button>
    </div>
  );

  return (
    <AppShell
      tabs={{ menu, activeTab, prevTab, nextTab, onTabChange: setActiveTab }}
      sidebar={{
        isOpen: isSidebarOpen,
        onToggle: () => setSidebarOpen(!isSidebarOpen),
        onClose: () => setSidebarOpen(false),
      }}
      isMobile={isMobile}
      isHomolog={isHomolog}
      currentDU={data?.currentDU}
      onLogout={logout}
      onBackToSections={() => setSelectedSection(null)}
    >
      <Suspense fallback={<DashboardSkeleton />}>{dataContent}</Suspense>
    </AppShell>
  );
};

export default App;
