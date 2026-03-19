import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Database as DatabaseIcon } from 'lucide-react';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import { AppShell } from './components/shell/AppShell';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { PasswordChangePage } from './components/PasswordChangePage';
import { LandingPage } from './components/LandingPage';
import { SettingsPage } from './components/SettingsPage';
import type { DashboardData } from './lib/data';
import { getAppUrl } from './lib/config';

const ProductDashboard = lazy(() =>
  import('./components/ProductDashboard').then((m) => ({ default: m.ProductDashboard })),
);

interface DashboardRouteProps {
  data: DashboardData | null;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logout: () => Promise<void>;
}

const DashboardRoute = ({ data, isMobile, isSidebarOpen, setSidebarOpen, logout }: DashboardRouteProps) => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { menu, activeTab, setActiveTab, prevTab, nextTab, goToNext } = useNavigation(section);

  const dataContent = data ? (
    <ProductDashboard
      category={activeTab}
      categoryLabel={menu.find((m) => m.id === activeTab)?.label}
      data={data}
      isMobile={isMobile}
      onNext={goToNext}
      nextName={nextTab?.label}
      section={section}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <DatabaseIcon size={64} className="mb-4 opacity-20" />
      <p>Nenhum dado carregado.</p>
      <button onClick={() => navigate('/settings')} className="mt-4 font-bold text-ocl-primary hover:underline">
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
      currentDU={data?.currentDU}
      onLogout={logout}
      onBackToSections={() => navigate('/')}
    >
      <Suspense fallback={<DashboardSkeleton />}>{dataContent}</Suspense>
    </AppShell>
  );
};

const App = () => {
  const { user, data, updateData, loading, isConfigured, supabase, logout, isPasswordResetInProgress } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(
    () => globalThis.window !== undefined && globalThis.window.innerWidth >= 1024,
  );
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectToChangePassword = `${getAppUrl()}/change-password`;

  if (loading)
    return (
      <div className="flex items-center justify-center bg-brand-bg" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-ocl-primary" />
      </div>
    );

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage supabase={supabase} configError={!isConfigured} />} />
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage supabase={supabase} configError={!isConfigured} redirectTo={redirectToChangePassword} />
          }
        />
        <Route path="/change-password" element={<PasswordChangePage supabase={supabase} />} />
        <Route
          path="*"
          element={<Navigate to={location.pathname === '/forgot-password' ? '/forgot-password' : '/login'} replace />}
        />
      </Routes>
    );
  }

  if (isPasswordResetInProgress) {
    return (
      <Routes>
        <Route path="/change-password" element={<PasswordChangePage supabase={supabase} />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onSectionSelect={(sectionId) => navigate(`/dashboard/${sectionId}`)}
            onOpenSettings={() => navigate('/settings')}
            onLogout={logout}
          />
        }
      />
      <Route
        path="/dashboard/:section"
        element={
          <DashboardRoute
            data={data}
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            logout={logout}
          />
        }
      />
      <Route path="/dashboard" element={<Navigate to="/dashboard/honorarios" replace />} />
      <Route
        path="/settings"
        element={
          <SettingsPage supabase={supabase} onDataSaved={updateData} onBack={() => navigate('/')} onLogout={logout} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
