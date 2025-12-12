import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
import { 
  LayoutDashboard, Wallet, Handshake, Car, Gavel, Upload, FileText, TrendingUp, TrendingDown, 
  Calendar, Menu, HardDrive, Loader2, ShieldAlert, Building2, Target, Table, Clock, Info, 
  Cloud, CloudLightning, CheckCircle2, X, Lock, User, Layers, RefreshCw, Eye, ArrowRight,
  ChevronLeft, ChevronRight // Novos ícones para navegação
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const SYSTEM_VERSION = "v1.0.0 - Versão Oficial (Fix Style)";

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
    padding: isMobile ? '12px 16px' : '24px 32px', 
    backgroundColor: 'white', 
    borderBottom: '1px solid #e2e8f0', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', // Garante que fique fixo no topo
    top: 0, 
    zIndex: 30,
    boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
  },
  content: { 
    paddingTop: isMobile ? '16px' : '32px',
    paddingLeft: isMobile ? '16px' : '32px',
    paddingRight: isMobile ? '16px' : '32px',
    paddingBottom: isMobile ? '32px' : '32px',
    overflowY: 'auto', 
    flex: 1,
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
  navButton: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#004990',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  // Login
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' },
  loginCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0 24px 0', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', outline: 'none' },
  button: { width: '100%', padding: '14px', backgroundColor: '#004990', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
});

// --- CORES ---
const COLORS = {
  primary: '#004990',
  themes: {
    'CONSOLIDADO': { main: '#1e293b', light: '#f1f5f9', icon: Layers },
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

// --- DADOS INICIAIS (EXPANDIDOS PARA A NOVA ESTRUTURA) ---
const INITIAL_CSV_DATA = `Dias úteis trabalhados;6;;;;;;
Dias úteis totais do mês;19;;;;;;

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;5000.00;6000.00;5500.00;5200.00;5800.00;6100.00;2000.00
ATÉ 90 DIAS;12000.00;11000.00;13000.00;12500.00;11800.00;12200.00;4000.00
91 A 180 DIAS;8000.00;7500.00;8200.00;9000.00;8500.00;9500.00;3000.00
OVER 180 DIAS;4000.00;4200.00;4100.00;4300.00;4400.00;4500.00;1500.00
PREJUÍZO;1000.00;500.00;800.00;1200.00;900.00;1100.00;400.00
Total Geral;30000.00;29200.00;31600.00;32200.00;31400.00;33400.00;10900.00

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;1500.00;1600.00;1550.00;1520.00;1580.00;1610.00;500.00
ATÉ 90 DIAS;3000.00;3100.00;3300.00;3250.00;3180.00;3220.00;1000.00
91 A 180 DIAS;2000.00;2500.00;2200.00;2000.00;2500.00;2500.00;800.00
OVER 180 DIAS;1000.00;1200.00;1100.00;1300.00;1400.00;1500.00;400.00
PREJUÍZO;500.00;500.00;500.00;200.00;900.00;100.00;100.00
Total Geral;8000.00;8900.00;8650.00;8270.00;9560.00;8930.00;2800.00

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;0.00;0.00;0.00;0.00;0.00;0.00;0.00
ATÉ 90 DIAS;500.00;600.00;550.00;520.00;580.00;610.00;200.00
91 A 180 DIAS;1200.00;1100.00;1300.00;1250.00;1180.00;1220.00;400.00
OVER 180 DIAS;800.00;750.00;820.00;900.00;850.00;950.00;300.00
PREJUÍZO;400.00;420.00;410.00;430.00;440.00;450.00;150.00
Total Geral;2900.00;2870.00;3080.00;3100.00;3050.00;3230.00;1050.00

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;0.00;0.00;0.00;0.00;0.00;0.00;0.00
ATÉ 90 DIAS;0.00;0.00;0.00;0.00;0.00;0.00;0.00
91 A 180 DIAS;500.00;600.00;550.00;520.00;580.00;610.00;200.00
OVER 180 DIAS;2200.00;2100.00;2300.00;2250.00;2180.00;2220.00;800.00
PREJUÍZO;1800.00;1750.00;1820.00;1900.00;1850.00;1950.00;600.00
Total Geral;4500.00;4450.00;4670.00;4670.00;4610.00;4780.00;1600.00

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;50;55;52;58;60;62;20
ATÉ 90 DIAS;80;82;85;88;90;92;35
91 A 180 DIAS;40;42;41;43;45;48;15
OVER 180 DIAS;10;12;11;13;14;15;5
PREJUÍZO;5;5;5;6;7;8;2
Total Geral;185;196;194;208;216;225;77

FAIXA;2025-06-01;2025-07-01;2025-08-01;2025-09-01;2025-10-01;2025-11-01;2025-12-01
ENTRANTES;10;12;11;10;12;13;4
ATÉ 90 DIAS;20;22;25;24;23;25;8
91 A 180 DIAS;15;14;16;18;17;19;6
OVER 180 DIAS;5;6;5;6;7;8;3
PREJUÍZO;2;1;2;3;2;3;1
Total Geral;52;55;59;61;61;68;22
// ... (Repete estrutura para outras qtds) ...
`;

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

  const processCombinedBlock = (valStart, valEnd, qtdStart, qtdEnd) => {
    const separator = (lines[valStart - 1] || "").includes(';') ? ';' : ',';
    let headerLine = (lines[valStart - 1] || "").split(separator);
    if (!headerLine[1] && lines[valStart-2]) headerLine = lines[valStart-2].split(separator);

    const blockDates = headerLine.slice(1).filter(d => d).map(d => d.split(' ')[0]);
    const blockData = [];
    
    for (let i = valStart; i < valEnd; i++) { 
       const row = (lines[i] || "").split(separator);
       if (!row[0] || row[0] === 'Total Geral') continue; 
       const faixa = row[0];
       const valores = row.slice(1).map(v => parseNumber(v)); 
       let qtdRow = [];
       if (qtdStart && qtdEnd) {
           const offset = i - valStart; 
           const targetQtdLine = qtdStart + offset;
           if (lines[targetQtdLine]) {
               qtdRow = lines[targetQtdLine].split(separator).slice(1).map(v => parseNumber(v));
           }
       }

       valores.forEach((val, index) => {
           if (blockDates[index]) {
               blockData.push({ 
                   faixa: faixa, 
                   data: blockDates[index], 
                   valor: val,
                   qtd: qtdRow[index] || 0
               });
           }
       });
    }
    return { data: blockData, dates: blockDates };
  };

  const cash = processCombinedBlock(4, 11, 49, 56);
  const reneg = processCombinedBlock(12, 19, 57, 64);
  const amigavel = processCombinedBlock(20, 27, 65, 72);
  const apreensao = processCombinedBlock(28, 35, 73, 80);
  const retomadas = processCombinedBlock(36, 43, 81, 88);
  const contencao = processCombinedBlock(44, 48, null, null);

  const consolidadoData = [];
  if (cash.data) {
      cash.data.forEach((item, index) => {
          const r = reneg.data[index] || { valor: 0, qtd: 0 };
          const rt = retomadas.data[index] || { valor: 0, qtd: 0 };
          consolidadoData.push({
              faixa: item.faixa,
              data: item.data,
              valor: item.valor + r.valor + rt.valor,
              qtd: item.qtd + r.qtd + rt.qtd
          });
      });
  }

  return { 
      daysWorked, totalDays, 
      products: {
          'CONSOLIDADO': consolidadoData, 
          'CASH': cash.data,
          'RENEGOCIAÇÃO': reneg.data,
          'ENTREGA AMIGÁVEL': amigavel.data,
          'APREENSÃO': apreensao.data,
          'RETOMADAS': retomadas.data,
          'CONTENÇÃO': contencao.data
      }, 
      dates: [...new Set(cash.dates)] 
  };
};

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(Math.round(val));
const formatMonth = (str) => { if (!str || !str.includes('-')) return "-"; const [y, m] = str.split('-'); return new Date(y, m - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase(); };

const calculateComparatives = (productName, data, dates) => {
    if (!dates || dates.length === 0) return { current: 0, prev: 0, avg3: 0, avg6: 0, dates: { current: '', prev: '' } };
    const productData = data.products[productName] || [];
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
    const isContencao = productName === 'CONTENÇÃO';
    
    const tableData = dates.map(date => {
        const items = productData.filter(d => d.data === date);
        const totalVal = items.reduce((acc, curr) => acc + curr.valor, 0);
        const totalQtd = items.reduce((acc, curr) => acc + (curr.qtd || 0), 0);
        const tkm = daysWorked > 0 ? totalVal / daysWorked : 0;
        const tkmAcordo = totalQtd > 0 ? totalVal / totalQtd : 0;
        return { date: formatMonth(date), totalVal, totalQtd, tkm, tkmAcordo, rawDate: date };
    }).reverse();

    return (
        <div style={{ ...getStyles(isMobile).card, padding: 0, marginTop: '32px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Table size={16} style={{ color: theme.main }}/> Visão Analítica - Evolução Dia Útil {daysWorked}
                </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Mês</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Resultado ({type === 'currency' ? 'R$' : 'Qtd'})</th>
                            {!isContencao && <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>TKM D.U. (R$)</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={row.rawDate} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: index === 0 ? '#eff6ff' : 'white' }}>
                                <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>{row.date} {index === 0 && <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 'bold' }}>ATUAL</span>}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: index === 0 ? theme.main : '#334155' }}>{formatter(row.totalVal)}</td>
                                {!isContencao && <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#64748b' }}>{formatCurrency(row.tkm)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductExecutiveView = ({ productName, data, dates, daysWorked, totalDays, theme, isMobile, onNextTab, nextTabName }) => {
    const metricType = productName !== 'CONTENÇÃO' ? 'currency' : 'number';
    const comps = calculateComparatives(productName, data, dates);
    const styles = getStyles(isMobile);

    return (
        <div style={{ maxWidth: '1024px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in' }}>
            <HeroCard title={`Realizado Mês Atual (Dia Útil ${daysWorked})`} value={comps.current} subtext={`Ref: ${formatMonth(comps.dates.current)}`} type={metricType} theme={theme} isMobile={isMobile} />
            <div style={getStyles(isMobile).grid3}>
                <ComparisonCard title="vs Mês Anterior" comparisonValue={comps.prev} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
                <ComparisonCard title="vs Média 3 Meses" comparisonValue={comps.avg3} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
                <ComparisonCard title="vs Média 6 Meses" comparisonValue={comps.avg6} currentValue={comps.current} type={metricType} theme={theme} daysWorked={daysWorked} isMobile={isMobile} />
            </div>
            {/* GRÁFICO REMOVIDO DAQUI */}
            <AnalyticalTable productName={productName} data={data} dates={dates} daysWorked={daysWorked} type={metricType} theme={theme} isMobile={isMobile} />
            
            {/* Navegação Mobile no final da página */}
            {isMobile && nextTabName && (
                <button onClick={onNextTab} style={getStyles(isMobile).mobileNavButton}>
                    Próximo: {nextTabName} <ArrowRight size={16} />
                </button>
            )}
        </div>
    );
};

const FileUploader = ({ onDataSaved, isMobile, isPreviewMode }) => {
    const [status, setStatus] = useState('idle');
    const fileRef = useRef(null);
    const auth = getAuth();
    const db = getFirestore();
    const styles = getStyles(isMobile);

    const handleProcess = async (file, mode) => {
        setStatus('processing');
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const processed = parseCustomCSV(e.target.result);
                
                if (mode === 'cloud') {
                    if (!auth.currentUser) await signInAnonymously(auth);
                    const docRef = doc(db, 'artifacts', 'ocl-dashboard', 'public', 'data', 'dashboards', 'latest');
                    await setDoc(docRef, { ...processed, updatedAt: new Date().toISOString() });
                    onDataSaved(processed);
                    setStatus('success-cloud');
                } else {
                    onDataSaved(processed);
                    setStatus('success-local');
                }
                
                setTimeout(() => setStatus('idle'), 3000);
            };
            reader.readAsText(file, 'UTF-8');
        } catch (e) { console.error(e); setStatus('idle'); alert('Erro ao processar'); }
    };

    return (
        <div style={{ ...styles.card, textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: isPreviewMode ? '#f0fdf4' : '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                {isPreviewMode ? <RefreshCw size={40} color="#16a34a" /> : <CloudLightning size={40} color="#004990" />}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                {isPreviewMode ? 'Simulador Local (Homolog)' : 'Central de Dados'}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
                {isPreviewMode ? 'Carregue um arquivo para testar visualmente nesta sessão.' : 'Gerencie a atualização dos indicadores.'}
            </p>
            <input type="file" ref={fileRef} onChange={(e) => handleProcess(e.target.files[0], 'cloud')} accept=".csv,.txt" style={{ display: 'none' }} />
            
            {/* Input secundário para ação local (apenas chama o handler com modo 'local') */}
            <input type="file" id="localUpload" onChange={(e) => handleProcess(e.target.files[0], 'local')} accept=".csv,.txt" style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button 
                    onClick={() => document.getElementById('localUpload').click()}
                    style={{ ...styles.button, backgroundColor: 'white', color: '#004990', border: '2px solid #004990', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Eye size={20} /> Simular Visualização (Local)
                </button>
                
                <button 
                    onClick={() => fileRef.current.click()}
                    disabled={isPreviewMode}
                    style={{ ...styles.button, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isPreviewMode ? 0.5 : 1, cursor: isPreviewMode ? 'not-allowed' : 'pointer' }}
                >
                    <Cloud size={20} /> Publicar na Nuvem (Cloud)
                </button>
            </div>

            {status === 'processing' && <p style={{ marginTop: '16px', color: '#2563eb', fontWeight: 'bold' }}>Processando...</p>}
            {status === 'success-cloud' && <p style={{ marginTop: '16px', color: '#16a34a', fontWeight: 'bold' }}>Sucesso! Dados publicados na nuvem.</p>}
            {status === 'success-local' && <p style={{ marginTop: '16px', color: '#004990', fontWeight: 'bold' }}>Sucesso! Visualização local carregada.</p>}
            {isPreviewMode && <p style={{ marginTop: '16px', fontSize: '12px', color: '#f59e0b' }}>* Publicação na nuvem indisponível no modo teste.</p>}
        </div>
    );
};

// --- COMPONENTE DE LOGIN (SIMULADO NA PREVIEW) ---
const LoginScreen = ({ onLogin, isMobile }) => {
  return <div>Login Screen (Oculto na Preview)</div>;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('CONSOLIDADO');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile, sidebarOpen);
  const currentTheme = COLORS.themes[activeTab] || COLORS.themes['CASH'];
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const mockDataFallback = parseCustomCSV(INITIAL_CSV_DATA);
    
    const initApp = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthChecking(false);
          if (currentUser) {
            const db = getFirestore(app);
            const docRef = doc(db, 'artifacts', 'ocl-dashboard', 'public', 'data', 'dashboards', 'latest');
            onSnapshot(docRef, (docSnap) => {
              setData(docSnap.exists() ? docSnap.data() : mockDataFallback);
              setLoading(false);
            }, (error) => { 
                console.warn("Modo Preview (Erro Firestore):", error);
                setIsPreviewMode(true);
                setData(mockDataFallback);
                setLoading(false); 
            });
          } else {
             // MODO TESTE ATIVADO: CARREGA DADOS MOCK SE NÃO TIVER USUÁRIO
             // (Para produção, basta remover esta linha 'setData' e deixar só setLoading)
             setIsPreviewMode(true);
             setData(mockDataFallback);
             setLoading(false);
          }
        });
        return () => unsubscribeAuth();
      } catch (e) { 
          console.warn("Modo Preview (Erro Init):", e); 
          setIsPreviewMode(true);
          setData(mockDataFallback);
          setLoading(false);
          setAuthChecking(false); 
      }
    };
    initApp();
  }, []);

  const handleLogout = async () => { const auth = getAuth(); await signOut(auth); };

  const menu = [
    { id: 'CONSOLIDADO', label: 'Resultados Consolidados', icon: Layers, spacing: true },
    { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
    { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
    { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
    { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
    { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
    { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
    { id: 'gestao', label: 'Gestão de Dados', icon: Upload, spacing: true },
  ];

  // Lógica de Navegação Mobile (Próxima Aba)
  const handleNextTab = () => {
      const currentIndex = menu.findIndex(item => item.id === activeTab);
      // Se não for a última aba (Gestão de Dados), avança
      if (currentIndex < menu.length - 2) { // -2 para não ir para Gestão automaticamente
          const nextTab = menu[currentIndex + 1];
          setActiveTab(nextTab.id);
          window.scrollTo(0,0);
      }
  };
  
  const currentMenuIndex = menu.findIndex(item => item.id === activeTab);
  const nextTabName = (currentMenuIndex < menu.length - 2) ? menu[currentMenuIndex + 1].label : null;

  // Lógica de Navegação Mobile (Aba Anterior)
  const handlePrevTab = () => {
      const currentIndex = menu.findIndex(item => item.id === activeTab);
      // Se não for a primeira aba, volta
      if (currentIndex > 0) {
          const prevTab = menu[currentIndex - 1];
          setActiveTab(prevTab.id);
          window.scrollTo(0,0);
      }
  };

  const prevTabName = (currentMenuIndex > 0) ? menu[currentMenuIndex - 1].label : null;


  if (authChecking) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}><Loader2 size={40} color="#004990" className="animate-spin" /></div>;
  
  // SE ESTIVER EM MODO DE TESTE (SEM USUÁRIO, MAS COM DADOS), MOSTRA O DASHBOARD
  if (!user && !data) return <LoginScreen isMobile={isMobile} />;

  if (loading) return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#004990' }}><Loader2 size={40} className="animate-spin" /><p style={{ marginTop: '16px' }}>Carregando dados...</p></div>;

  return (
    <div style={styles.container}>
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
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!isPreviewMode && (
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.2)', color: '#bfdbfe', cursor: 'pointer', fontSize: '14px' }}>
                    <Lock size={16} />
                    {sidebarOpen && <span style={{ marginLeft: '12px' }}>Sair do Sistema</span>}
                </button>
            )}
            {isPreviewMode && sidebarOpen && <div style={{ fontSize: '10px', color: '#fbbf24', textAlign: 'center' }}>Modo Homologação</div>}
        </div>
      </aside>
      <main style={styles.main}>
        <header style={styles.header}>
            <div style={styles.flexCenter}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', marginRight: '16px' }}><Menu size={20} color="#475569" /></button>
                {!isMobile && <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.main, marginRight: '12px' }}><currentTheme.icon size={24} /></div>}
                <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{menu.find(i => i.id === activeTab)?.label}</h1>
            </div>
            
            {/* Navegação Mobile no Header */}
            {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                        onClick={handlePrevTab} 
                        disabled={!prevTabName}
                        style={{ ...styles.navButton, opacity: !prevTabName ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={handleNextTab} 
                        disabled={!nextTabName}
                        style={{ ...styles.navButton, opacity: !nextTabName ? 0.3 : 1 }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {data && !isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b' }}><span style={styles.flexCenter}><Calendar size={14} style={{ marginRight: '4px' }}/> {data.dates && data.dates.length > 0 ? formatMonth(data.dates[data.dates.length -1]) : '-'}</span><span style={{ ...styles.flexCenter, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#334155' }}><Clock size={14} style={{ marginRight: '4px' }}/> {data.daysWorked}/{data.totalDays}</span></div>}
        </header>
        <div style={styles.content}>
            {activeTab === 'gestao' ? <FileUploader onDataSaved={setData} isMobile={isMobile} isPreviewMode={isPreviewMode} /> : <ProductExecutiveView productName={activeTab} data={data} dates={data.dates} daysWorked={data.daysWorked} totalDays={data.totalDays} theme={currentTheme} isMobile={isMobile} onNextTab={handleNextTab} nextTabName={nextTabName} />}
        </div>
      </main>
    </div>
  );
};

export default App;