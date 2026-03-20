import { Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Database as DatabaseIcon } from 'lucide-react';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useNavigation } from '../hooks/useNavigation';
import { AppShell } from '../components/shell/AppShell';
import type { DashboardData } from '../services/data';

const ProductDashboard = lazy(() =>
  import('../components/ProductDashboard').then((m) => ({ default: m.ProductDashboard })),
);

interface DashboardPageProps {
  data: DashboardData | null;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logout: () => Promise<void>;
}

export const DashboardPage = ({ data, isMobile, isSidebarOpen, setSidebarOpen, logout }: DashboardPageProps) => {
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
