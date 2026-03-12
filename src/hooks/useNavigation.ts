import { useState, useCallback, useMemo, useEffect } from 'react';
import { LayoutDashboard, Wallet, Handshake, Car, Gavel, FileText, ShieldAlert } from 'lucide-react';
import type { MenuItem } from '../components/shell/Sidebar';

const DESEMPENHO_MENU: MenuItem[] = [
  { id: 'CASH', label: 'Repasse', icon: Wallet },
  { id: 'RENEGOCIAÇÃO', label: 'Saldo Renegociado', icon: Handshake },
  { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
  { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
  { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
  { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
];

const HONORARIO_MENU: MenuItem[] = [
  { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
  { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
  { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
  { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
  { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
];

const METAS_MENU: MenuItem[] = [
  { id: 'cash', label: 'Cash', icon: Wallet },
  { id: 'reneg', label: 'Renegociação', icon: Handshake },
  { id: 'amigavel', label: 'Entrega Amigável', icon: Car },
  { id: 'judicial', label: 'Judicial', icon: Gavel },
  { id: 'retomada', label: 'Retomadas', icon: FileText },
];

const SECTION_MENUS: Record<string, { menu: MenuItem[]; defaultTab: string }> = {
  desempenho: { menu: DESEMPENHO_MENU, defaultTab: 'CASH' },
  honorario: { menu: HONORARIO_MENU, defaultTab: 'CONSOLIDADO' },
  metas: { menu: METAS_MENU, defaultTab: 'cash' },
};

export const useNavigation = (section?: string) => {
  const { menu, defaultTab } = useMemo(() => {
    if (section && SECTION_MENUS[section]) {
      return SECTION_MENUS[section];
    }
    return { menu: HONORARIO_MENU, defaultTab: 'CONSOLIDADO' };
  }, [section]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const effectiveActiveTab = useMemo(
    () => (menu.some((m) => m.id === activeTab) ? activeTab : defaultTab),
    [menu, activeTab, defaultTab],
  );

  const currentIndex = menu.findIndex((m) => m.id === effectiveActiveTab);
  const nextTab = currentIndex < menu.length - 1 ? (menu[currentIndex + 1] ?? null) : null;
  const prevTab = currentIndex > 0 ? (menu[currentIndex - 1] ?? null) : null;

  const goToNext = useCallback(() => {
    if (nextTab) {
      setActiveTab(nextTab.id);
      window.scrollTo(0, 0);
    }
  }, [nextTab]);

  return { menu, activeTab: effectiveActiveTab, setActiveTab, prevTab, nextTab, goToNext };
};
