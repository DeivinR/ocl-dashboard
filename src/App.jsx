import React, { useState, useEffect, useRef } from 'react';
// Removendo imports de gráficos que não serão mais usados para limpar o código
import { 
  LayoutDashboard, Wallet, Handshake, Car, Gavel, Upload, FileText, TrendingUp, TrendingDown, 
  Calendar, Menu, HardDrive, Loader2, ShieldAlert, Building2, Target, Table, Clock, Info, 
  Cloud, CloudLightning, CheckCircle2, X
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const SYSTEM_VERSION = "v4.4 - Visual Limpo (Sem Gráfico)";

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDnHNW0McIlgJCk28CcjvwxWobJ9AKjpvw",
  authDomain: "ocl-dashboard.firebaseapp.com",
  projectId: "ocl-dashboard",
  storageBucket: "ocl-dashboard.firebasestorage.app",
  messagingSenderId: "576393684422",
  appId: "1:576393684422:web:6643b1500cf7355e6ffec7",
  measurementId: "G-TRF59EY4H9"
};

// --- HOOK PARA DETECTAR MOBILE ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- ESTILOS GLOBAIS E UTILITÁRIOS ---
const getStyles = (isMobile, sidebarOpen) => ({
  container: { 
    fontFamily: 'system-ui, -apple-system, sans-serif', 
    backgroundColor: '#f8fafc', 
    minHeight: '100vh', 
    display: 'flex', 
    color: '#1e293b',
    overflowX: 'hidden' 
  },
  sidebar: { 
    width: isMobile ? '280px' : (sidebarOpen ? '280px' : '80px'),
    backgroundColor: '#004990', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column', 
    position: 'fixed', 
    height: '100%', 
    zIndex: 50, 
    boxShadow: '4px 0 24px rgba(0,0,0,0.1)', 
    transition: 'transform 0.3s ease, width 0.3s ease',
    transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
  },
  overlay: {
    display: isMobile && sidebarOpen ? 'block' : 'none',
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40
  },
  main: { 
    flex: 1, 
    marginLeft: isMobile ? '0' : (sidebarOpen ? '280px' : '80px'), 
    transition: 'margin-left 0.3s ease', 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '100vh',
    width: '100%'
  },
  header: { 
    padding: isMobile ? '16px' : '24px 32px', 
    backgroundColor: 'white', 
    borderBottom: '1px solid #e2e8f0', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 30 
  },
  content: { 
    padding: isMobile ? '16px' : '32px', 
    overflowY: 'auto', 
    flex: 1 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: '16px', 
    padding: isMobile ? '20px' : '24px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
    border: '1px solid #f1f5f9' 
  },
  grid3: { 
    display: 'grid', 
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
    gap: '24px', 
    marginBottom: '32px' 
  },
  heroCard: { 
    borderRadius: '16px', 
    padding: isMobile ? '24px' : '32px', 
    color: 'white', 
    position: 'relative', 
    overflow: 'hidden', 
    textAlign: 'center', 
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px'
  },
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
});

// --- CORES ---
const COLORS = {
  primary: '#004990',
  themes: {
    'CASH': { main: '#004990', light: '#e0f2fe', icon: Wallet },
    'RENEGOCIAÇÃO': { main: '#7c3aed', light: '#f3e8ff', icon: Handshake },
    'ENTREGA AMIGÁVEL': { main: '#059669', light: '#d1fae5', icon: Car },
    'APREENSÃO': { main: '#d97706', light: '#fef3c7', icon: Gavel },
    'RETOMADAS': { main: '#dc2626', light: '#fee2e2', icon: FileText },
    'CONTENÇÃO': { main: '#0891b2', light: '#cffafe', icon: ShieldAlert },
    'gestao': { main: '#475569', light: '#f1f5f9', icon: Upload }
  },
  faixas: {
    'ENTRANTES': '#22d3ee', 'ATÉ 90 DIAS': '#3b82f6', '91 A 180 DIAS': '#8b5cf6', 'OVER 180 DIAS': '#ef4444', 'PREJUÍZO': '#64748b'
  }
};

// --- DADOS INICIAIS ---
const INITIAL_CSV_DATA = `Dias úteis trabalhados;6;;;;;;
Dias úteis totais do mês;19;;;;;;
FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;5000.00;6000.00;5500.00;5200.00;5800.00;6100.00;2000.00
ATÉ 90 DIAS;12000.00;11000.00;13000.00;12500.00;11800.00;12200.00;4000.00
91 A 180 DIAS;8000.00;7500.00;8200.00;9000.00;8500.00;9500.00;3000.00
OVER 180 DIAS;4000.00;4200.00;4100.00;4300.00;4400.00;4500.00;1500.00
PREJUÍZO;1000.00;500.00;800.00;1200.00;900.00;1100.00;400.00`;

// --- UTILITÁRIOS ---
const parseNumber = (valStr) => {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    let cleanStr = valStr.trim();
    if (cleanStr.includes(',') && !cleanStr.includes('.')) cleanStr = cleanStr.replace(',', '.');
    else if (cleanStr.includes('.') && cleanStr.includes(',')) {
        const lastDot = cleanStr.lastIndexOf('.');
        const lastComma = cleanStr.lastIndexOf(',');
        if (lastComma > lastDot) cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
        else cleanStr = cleanStr.replace(/,/g, '');
    }
    return parseFloat(cleanStr) || 0;
};

const parseCustomCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/);
  const line0 = (lines[0] || "").split((lines[0] || "").includes(';') ? ';' : ',');
  const line1 = (lines[1] || "").split((lines[1] || "").includes(';') ? ';' : ',');
  const daysWorked = parseNumber(line0[1]) || 1;
  const totalDays = parseNumber(line1[1]) || 1;

  const processBlock = (startLine, endLine) => {
    const separator = (lines[startLine - 1] || "").includes(';') ? ';' : ',';
    const headerLine = (lines[startLine - 1] || "").split(separator);
    const blockDates = headerLine.slice(1).filter(d => d).map(d => d.split(' ')[0]);
    const blockData = [];
    for (let i = startLine; i < endLine; i++) { 
       const row = (lines[i] || "").split(separator);
       if (!row[0] || row[0] === 'Total Geral') continue; 
       const faixa = row[0];
       const valores = row.slice(1).map(v => parseNumber(v)); 
       valores.forEach((val, index) => {
           if (blockDates[index]) blockData.push({ faixa: faixa, data: blockDates[index], valor: val });
       });
    }
    return { data: blockData, dates: blockDates };
  };

  return { 
      daysWorked, totalDays, 
      products: {
          'CASH': processBlock(4, 11).data,
          'RENEGOCIAÇÃO': processBlock(12, 19).data,
          'ENTREGA AMIGÁVEL': processBlock(20, 27).data,
          'APREENSÃO': processBlock(28, 35).data,
          'RETOMADAS': processBlock(36, 43).data,
          'CONTENÇÃO': processBlock(44, 48).data
      }, 
      dates: [...new Set(processBlock(4, 11).dates)] 
  };
};

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(Math.round(val));
const formatMonth = (str) => { if (!str) return "-"; const [y, m] = str.split('-'); return new Date(y, m - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase(); };

const calculateComparatives = (productName, data, dates) => {
    const productData = data.products[productName] || [];
    if (productData.length === 0) return { current: 0, prev: 0, avg3: 0, avg6: 0, dates: { current: '', prev: '' } };
    const n = dates.length;
    const currentMonth = dates[n - 1]; 
    const prevMonth = dates[n - 2];    
    const last3Months = dates.slice(Math.max(0, n - 4), n - 1); 
    const last6Months = dates.slice(Math.max(0, n - 7), n - 1);
    const getTotal = (d) => productData.filter(i => i.data === d).reduce((acc, curr) => acc + curr.valor, 0);
    return {
        current: getTotal(currentMonth),
        prev: getTotal(prevMonth),
        avg3: last3Months.reduce((acc, d) => acc + getTotal(d), 0) / (last3Months.length || 1),
        avg6: last6Months.reduce((acc, d) => acc + getTotal(d), 0) / (last6Months.length || 1),
        dates: { current: currentMonth, prev: prevMonth }
    };
};

// --- COMPONENTES VISUAIS ---

const HeroCard = ({ value, title, subtext, type, theme, isMobile }) => (
    <div style={{ ...getStyles(isMobile).heroCard, background: `linear-gradient(135deg, ${theme.main} 0%, ${theme.main}DD 100%)` }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.1, transform: 'rotate(15deg)' }}><theme.icon size={200} /></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
            <p style={{ fontSize: isMobile ? '12px' : '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', color: '#e0f2fe' }}>{title}</p>
            <h2 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{type === 'currency' ? formatCurrency(value) : formatNumber(value)}</h2>
            {subtext && <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '999px', fontSize: isMobile ? '12px' : '14px' }}><Calendar size={14} />{subtext}</div>}
        </div>
    </div>
);

const ComparisonCard = ({ title, comparisonValue, currentValue, type, theme, daysWorked, isMobile }) => {
    const isPositive = currentValue >= comparisonValue;
    const diff = comparisonValue > 0 ? ((currentValue - comparisonValue) / comparisonValue) * 100 : 0;
    return (
        <div style={{ ...getStyles(isMobile).card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: theme.main }}></div>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                    <div title={`Comparativo Mesmo Período: Dados referentes ao Dia Útil ${daysWorked} de cada mês.`} style={{ cursor: 'help' }}><Info size={16} color="#60a5fa" /></div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#334155', marginTop: '4px' }}>{type === 'currency' ? formatCurrency(comparisonValue) : formatNumber(comparisonValue)}</div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Referência Histórica</span>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: isPositive ? '#16a34a' : '#ef4444' }}>
                {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span>{Math.abs(diff).toFixed(1)}%</span><span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '12px' }}>vs atual</span>
            </div>
        </div>
    );
};

const AnalyticalTable = ({ productName, data, dates, daysWorked, type, theme, isMobile }) => {
    const productData = data.products[productName] || [];
    const formatter = type === 'currency' ? formatCurrency : formatNumber;
    const tableData = dates.map(date => {
        const items = productData.filter(d => d.data === date);
        return { date: formatMonth(date), total: items.reduce((acc, curr) => acc + curr.valor, 0), rawDate: date };
    }).reverse();

    return (
        <div style={{ ...getStyles(isMobile).card, padding: 0, marginTop: '32px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}><Table size={16} style={{ color: theme.main }}/> Visão Analítica - Evolução Dia Útil {daysWorked}</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Mês de Referência</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Resultado ({type === 'currency' ? 'R$' : 'Qtd'})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={row.rawDate} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: index === 0 ? '#eff6ff' : 'white' }}>
                                <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>{row.date} {index === 0 && <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 'bold' }}>ATUAL</span>}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: index === 0 ? theme.main : '#334155' }}>{type === 'currency' ? formatCurrency(row.total) : formatNumber(row.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductExecutiveView = ({ productName, data, dates, daysWorked, totalDays, theme, isMobile }) => {
    const metricType = productName !== 'CONTENÇÃO' ? 'currency' : 'number';
    const comps = calculateComparatives(productName, data, dates);
    const styles = getStyles(isMobile);

    return (
        <div style={{ maxWidth: '1024px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in' }}>
            <HeroCard title={`Realizado Mês Atual (Dia Útil ${daysWorked})`} value={comps.current} subtext={`Ref: ${formatMonth(comps.dates.current)}`} type={metricType} theme={theme} isMobile={isMobile} />
            <div style={styles.grid3}>
                <ComparisonCard title="vs Mês Anterior" comparisonValue={comps.prev} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
                <ComparisonCard title="vs Média 3 Meses" comparisonValue={comps.avg3} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
                <ComparisonCard title="vs Média 6 Meses" comparisonValue={comps.avg6} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
            </div>
            {/* GRÁFICO REMOVIDO DAQUI */}
            <AnalyticalTable productName={productName} data={data} dates={dates} daysWorked={daysWorked} type={metricType} theme={theme} isMobile={isMobile} />
        </div>
    );
};

const FileUploader = ({ onDataSaved, isMobile }) => {
    const [status, setStatus] = useState('idle');
    const fileRef = useRef(null);
    const auth = getAuth();
    const db = getFirestore();
    const styles = getStyles(isMobile);

    const handleProcess = async (file) => {
        setStatus('processing');
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const processed = parseCustomCSV(e.target.result);
                if (!auth.currentUser) await signInAnonymously(auth);
                const docRef = doc(db, 'artifacts', 'ocl-dashboard', 'public', 'data', 'dashboards', 'latest');
                await setDoc(docRef, { ...processed, updatedAt: new Date().toISOString() });
                onDataSaved(processed);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            };
            reader.readAsText(file, 'UTF-8');
        } catch (e) { console.error(e); setStatus('idle'); alert('Erro ao processar'); }
    };

    return (
        <div style={{ ...styles.card, textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}><CloudLightning size={40} color="#004990" /></div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Central Cloud</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>Sincronize o CSV para a diretoria.</p>
            <input type="file" ref={fileRef} onChange={(e) => handleProcess(e.target.files[0])} accept=".csv,.txt" style={{ display: 'none' }} />
            <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '40px', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' }}>
                <HardDrive size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                <span style={{ fontWeight: 'bold', color: '#475569' }}>Clique para Carregar CSV</span>
            </div>
            {status === 'processing' && <p style={{ marginTop: '16px', color: '#2563eb', fontWeight: 'bold' }}>Sincronizando...</p>}
            {status === 'success' && <p style={{ marginTop: '16px', color: '#16a34a', fontWeight: 'bold' }}>Sucesso! Dashboard Atualizado.</p>}
        </div>
    );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('CASH');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile, sidebarOpen);
  const currentTheme = COLORS.themes[activeTab] || COLORS.themes['CASH'];

  useEffect(() => {
    if (isMobile) setSidebarOpen(false); // Fecha sidebar ao carregar no mobile
    const init = async () => {
        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const auth = getAuth(app);
            await signInAnonymously(auth);
            onSnapshot(doc(db, 'artifacts', 'ocl-dashboard', 'public', 'data', 'dashboards', 'latest'), (doc) => {
                setData(doc.exists() ? doc.data() : parseCustomCSV(INITIAL_CSV_DATA));
                setLoading(false);
            });
        } catch (e) { console.error(e); setData(parseCustomCSV(INITIAL_CSV_DATA)); setLoading(false); }
    };
    init();
  }, [isMobile]);

  const menu = [
    { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
    { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
    { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
    { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
    { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
    { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
    { id: 'gestao', label: 'Gestão de Dados', icon: Upload, spacing: true },
  ];

  if (loading) return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#004990' }}><Loader2 size={40} className="animate-spin" /><p style={{ marginTop: '16px' }}>Conectando ao OCL Cloud...</p></div>;

  return (
    <div style={styles.container}>
      {/* Overlay para Mobile */}
      <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />

      <aside style={styles.sidebar}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {sidebarOpen ? <div style={styles.flexCenter}><div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004990', marginRight: '12px' }}><Building2 size={24} /></div><div><span style={{ fontWeight: 'bold', fontSize: '18px', display: 'block' }}>OCL</span><span style={{ fontSize: '10px', color: '#93c5fd', textTransform: 'uppercase' }}>Advogados</span></div></div> : <Building2 size={24} />}
            {isMobile && sidebarOpen && <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: 'white' }}><X size={24} /></button>}
        </div>
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {menu.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? 'white' : 'transparent', color: activeTab === item.id ? '#004990' : '#bfdbfe', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s', marginTop: item.spacing ? '24px' : '0' }}>
                    <item.icon size={20} style={{ minWidth: '20px' }} />
                    {sidebarOpen && <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.label}</span>}
                </button>
            ))}
        </nav>
        <div style={{ padding: '16px', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>{sidebarOpen && <p>{SYSTEM_VERSION}</p>}</div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
            <div style={styles.flexCenter}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', marginRight: '16px' }}><Menu size={20} color="#475569" /></button>
                {!isMobile && <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.main, marginRight: '12px' }}><currentTheme.icon size={24} /></div>}
                <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{menu.find(i => i.id === activeTab)?.label}</h1>
            </div>
            {data && !isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b' }}><span style={styles.flexCenter}><Calendar size={14} style={{ marginRight: '4px' }}/> {formatMonth(data.dates[data.dates.length -1])}</span><span style={{ ...styles.flexCenter, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#334155' }}><Clock size={14} style={{ marginRight: '4px' }}/> {data.daysWorked}/{data.totalDays}</span></div>}
        </header>
        <div style={styles.content}>
            {activeTab === 'gestao' ? <FileUploader onDataSaved={setData} isMobile={isMobile} /> : <ProductExecutiveView productName={activeTab} data={data} dates={data.dates} daysWorked={data.daysWorked} totalDays={data.totalDays} theme={currentTheme} isMobile={isMobile} />}
        </div>
      </main>
    </div>
  );
};

export default App;