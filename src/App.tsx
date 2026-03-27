import { useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import {
  LoginPage,
  ForgotPasswordPage,
  PasswordChangePage,
  LandingPage,
  SettingsPage,
  DashboardPage,
  ChatPage,
} from './pages';
import { getAppUrl } from './config';
import { getUserDisplay } from './utils/userDisplay';

const App = () => {
  const { user, data, profile, updateData, loading, isConfigured, supabase, logout, isPasswordResetInProgress } =
    useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(
    () => globalThis.window !== undefined && globalThis.window.innerWidth >= 1024,
  );
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectToChangePassword = `${getAppUrl()}/change-password`;
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);
  const userDisplay = getUserDisplay({
    fullName: profile?.fullName,
    role: profile?.role,
    email: user?.email,
  });

  const getAccessToken = useMemo(() => {
    return async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    };
  }, [supabase]);

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
            onOpenChat={() => navigate('/chat')}
            onSendMessage={(message) => {
              setInitialChatMessage(message);
              navigate('/chat');
            }}
          />
        }
      />
      <Route
        path="/dashboard/:section"
        element={
          <DashboardPage
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
      <Route
        path="/chat"
        element={
          <ChatPage
            getAccessToken={getAccessToken}
            initialMessage={initialChatMessage}
            onInitialMessageConsumed={() => setInitialChatMessage(null)}
            onBack={() => navigate('/')}
            onLogout={logout}
            userName={userDisplay.name}
            userRole={userDisplay.role}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
