import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Handshake,
  Car,
  Gavel,
  FileText,
  ShieldAlert,
  Database as DatabaseIcon,
} from 'lucide-react';
import type { MenuItem } from '../components/shell/Sidebar';

const MENU: MenuItem[] = [
  { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
  { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
  { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
  { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
  { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
  { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
  { id: 'gestao', label: 'Gestão de Dados', icon: DatabaseIcon, spacing: true },
];

export const useNavigation = () => {
  const [activeTab, setActiveTab] = useState('CONSOLIDADO');

  const currentIndex = MENU.findIndex((m) => m.id === activeTab);
  const nextTab =
    currentIndex < MENU.length - 1 && MENU[currentIndex + 1]?.id !== 'gestao' ? (MENU[currentIndex + 1] ?? null) : null;
  const prevTab = currentIndex > 0 ? (MENU[currentIndex - 1] ?? null) : null;

  const goToNext = useCallback(() => {
    if (nextTab) {
      setActiveTab(nextTab.id);
      window.scrollTo(0, 0);
    }
  }, [nextTab]);

  return { menu: MENU, activeTab, setActiveTab, prevTab, nextTab, goToNext };
};
