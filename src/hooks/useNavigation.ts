import { useState, useCallback, useMemo } from 'react';
import { LayoutDashboard, Wallet, Handshake, Car, Gavel, FileText, ShieldAlert } from 'lucide-react';
import type { MenuItem } from '../components/shell/Sidebar';

const FULL_MENU: MenuItem[] = [
  { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
  { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
  { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
  { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
  { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
  { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
];

export const useNavigation = (section?: string) => {
  const menu = useMemo(() => {
    if (section === 'desempenho') {
      return FULL_MENU.filter((item) => item.id !== 'CONSOLIDADO');
    }
    return FULL_MENU;
  }, [section]);

  const [activeTab, setActiveTab] = useState(() => {
    return section === 'desempenho' ? 'CASH' : 'CONSOLIDADO';
  });

  const currentIndex = menu.findIndex((m) => m.id === activeTab);
  const nextTab = currentIndex < menu.length - 1 ? (menu[currentIndex + 1] ?? null) : null;
  const prevTab = currentIndex > 0 ? (menu[currentIndex - 1] ?? null) : null;

  const goToNext = useCallback(() => {
    if (nextTab) {
      setActiveTab(nextTab.id);
      window.scrollTo(0, 0);
    }
  }, [nextTab]);

  return { menu, activeTab, setActiveTab, prevTab, nextTab, goToNext };
};
