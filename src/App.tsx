import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Database as DatabaseIcon } from 'lucide-react';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import { AppShell } from './components/shell/AppShell';
import { LoginScreen } from './components/LoginScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { PasswordChangeScreen } from './components/PasswordChangeScreen';
import { LandingPage } from './components/LandingPage';
import { DataUploadPage } from './components/DataUploadPage';
// import { ChatPage } from './components/ChatPage';

const ProductDashboard = lazy(() =>
  import('./components/ProductDashboard').then((m) => ({ default: m.ProductDashboard })),
);

const App = () => {
  const { user, data, setData, loading, isConfigured, supabase, logout } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  // const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);
  const { menu, activeTab, setActiveTab, prevTab, nextTab, goToNext } = useNavigation(selectedSection ?? undefined);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // const handleSendMessage = useCallback((message: string) => {
  //   setInitialChatMessage(message);
  //   setSelectedSection('chat');
  // }, []);

  // const handleOpenChat = useCallback(() => {
  //   setSelectedSection('chat');
  //   setInitialChatMessage(null);
  // }, []);

  // const handleChatBack = useCallback(() => {
  //   setSelectedSection(null);
  //   setInitialChatMessage(null);
  // }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center bg-brand-bg" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-ocl-primary" />
      </div>
    );

  const dataContent = data ? (
    <ProductDashboard
      category={activeTab}
      categoryLabel={menu.find((m) => m.id === activeTab)?.label}
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
      <button onClick={() => navigate('/upload')} className="mt-4 font-bold text-ocl-primary hover:underline">
        Fazer upload de dados
      </button>
    </div>
  );

  const protectedApp = (
    <AppShell
      tabs={{ menu, activeTab, prevTab, nextTab, onTabChange: setActiveTab }}
      sidebar={{
        isOpen: isSidebarOpen,
        onToggle: () => setSidebarOpen(!isSidebarOpen),
        onClose: () => setSidebarOpen(false),
      }}
      isMobile={isMobile}
      currentDU={data?.currentDU}
      onLogout={logout}
      onBackToSections={() => setSelectedSection(null)}
    >
      <Suspense fallback={<DashboardSkeleton />}>{dataContent}</Suspense>
    </AppShell>
  );

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen supabase={supabase} configError={!isConfigured} />} />
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordScreen supabase={supabase} configError={!isConfigured} redirectTo="/change-password" />
          }
        />
        <Route path="/change-password" element={<PasswordChangeScreen supabase={supabase} />} />
        <Route
          path="*"
          element={<Navigate to={location.pathname === '/forgot-password' ? '/forgot-password' : '/login'} replace />}
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          selectedSection ? (
            protectedApp
          ) : (
            <LandingPage onSectionSelect={setSelectedSection} onUpload={() => navigate('/upload')} onLogout={logout} />
          )
        }
      />
      <Route
        path="/upload"
        element={
          <DataUploadPage supabase={supabase} onDataSaved={setData} onBack={() => navigate('/')} onLogout={logout} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
