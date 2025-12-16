import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Wallet, Handshake, Car, Gavel, Upload, FileText, TrendingUp, TrendingDown, 
  Calendar, Menu, Loader2, ShieldAlert, Table, Clock, Info, 
  Cloud, CloudLightning, X, Lock, Layers, RefreshCw, Eye, ArrowRight,
  ChevronLeft, ChevronRight, Database, LogOut, DollarSign, PieChart, Activity, Minus, Settings, Trash2, CheckCircle, AlertTriangle, Users
} from 'lucide-react';

const SYSTEM_VERSION = "v5.3 - Agreement Column in Table";

// --- CONFIGURAÇÃO DE AMBIENTE ---
const GET_ENV = (key) => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) { }
    return null;
};

const MANUAL_URL = "https://vjcgcoxujrixaznbyzvg.supabase.co"; 
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2djb3h1anJpeGF6bmJ5enZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTc1MDEsImV4cCI6MjA4MTM3MzUwMX0.JKi6ybypqqwZTeJH__QxB-ajA_gkAk67t-4NfmYcVmY";

const SUPABASE_URL = GET_ENV('NEXT_PUBLIC_SUPABASE_URL') || MANUAL_URL;
const SUPABASE_ANON_KEY = GET_ENV('NEXT_PUBLIC_SUPABASE_ANON_KEY') || MANUAL_KEY;

const LOGO_LIGHT_URL = "/logo-white.png"; 
const LOGO_DARK_URL = "/logo.png";        

// --- HOOKS ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- THEME & HELPERS ---
const THEME = { primary: '#003366', secondary: '#004990', accent: '#F59E0B', bg: '#F1F5F9', card: '#FFFFFF', text: '#1E293B', success: '#10B981', danger: '#EF4444' };

const parseCurrency = (valStr) => {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    let clean = valStr.toString().replace(/[R$\s]/g, '').trim();
    if (clean.includes(',') && clean.includes('.')) { clean = clean.replace(/\./g, '').replace(',', '.'); } 
    else if (clean.includes(',')) { clean = clean.replace(',', '.'); }
    return parseFloat(clean) || 0;
};

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(Math.round(val));
const formatMonth = (str) => { 
    if (!str) return "-"; 
    const [y, m] = str.split('-'); 
    return new Date(y, m - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase(); 
};

// --- DATA PROCESSING ---
const parseStructuredCSV = (csvText, manualDU, totalDays) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return null;

    const headers = lines[0].split(';').map(h => h.trim().toUpperCase());
    const colMap = {
        PRODUTO: headers.indexOf('PRODUTO'), REPASSE: headers.indexOf('REPASSE'), HO: headers.indexOf('HO'),
        DU: headers.indexOf('DU'), PERIODO: headers.indexOf('PERÍODO'), TIPO: headers.indexOf('TIPO'), RISCO: headers.indexOf('RISCO CONTENÇÃO')
    };

    const rawData = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(';');
        if (row.length < headers.length) continue;
        const du = parseInt(row[colMap.DU]) || 0;
        rawData.push({
            produto: row[colMap.PRODUTO]?.trim() || "Outros", 
            valor: parseCurrency(row[colMap.REPASSE]), ho: parseCurrency(row[colMap.HO]),
            du: du, periodo: row[colMap.PERIODO] || "", tipo: row[colMap.TIPO]?.trim() || "", risco: row[colMap.RISCO]?.trim() || ""
        });
    }

    const uniqueDates = [...new Set(rawData.map(d => d.periodo))].sort();
    let finalDU = manualDU ? parseInt(manualDU) : 1; 
    let finalTotalDays = totalDays ? parseInt(totalDays) : 22; 

    if (!manualDU) {
        const latestDate = uniqueDates[uniqueDates.length - 1];
        const currentMonthData = rawData.filter(d => d.periodo === latestDate);
        finalDU = Math.max(...currentMonthData.map(d => d.du), 1);
    }

    return { rawData, dates: uniqueDates, currentDU: finalDU, totalBusinessDays: finalTotalDays };
};

// --- KPI CALCULATION ---
const calculateKPIs = (data, category) => {
    if (!data || !data.rawData) return { current: 0, count: 0, prev: 0, prevCount: 0, avg3: 0, avg3Count: 0, avg6: 0, avg6Count: 0, history: [] };

    const { rawData, dates, currentDU, totalBusinessDays } = data;
    const n = dates.length;
    const currentDate = dates[n - 1];
    const prevDate = dates[n - 2];
    
    const filterByCategory = (item) => {
        if (category === 'CONSOLIDADO') return true; 
        if (category === 'CONTENÇÃO') return item.risco && item.risco.length > 2; 
        const prod = item.produto?.toUpperCase();
        if (category === 'CASH') return ['PARCIAL', 'ATUALIZAÇÃO', 'QUITAÇÃO', 'VAP'].some(p => prod?.includes(p));
        if (category === 'RENEGOCIAÇÃO') return prod === 'RENEGOCIAÇÃO';
        if (category === 'ENTREGA AMIGÁVEL') return prod === 'ENTREGA AMIGÁVEL';
        if (category === 'APREENSÃO') return prod === 'APREENSÃO';
        if (category === 'RETOMADAS') return prod === 'ENTREGA AMIGÁVEL' || prod === 'APREENSÃO';
        return false;
    };

    const getValueToSum = (item) => {
        if (category === 'CONTENÇÃO') return 1; 
        return item.ho; 
    };

    const countUntilDU = (targetDate, limitDU) => {
        return rawData.filter(d => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d)).length;
    };

    const sumUntilDU = (targetDate, limitDU) => {
        return rawData
            .filter(d => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d))
            .reduce((acc, curr) => acc + getValueToSum(curr), 0);
    };

    const sumTotalMonth = (targetDate) => {
        return rawData
            .filter(d => d.periodo === targetDate && filterByCategory(d))
            .reduce((acc, curr) => acc + getValueToSum(curr), 0);
    };

    // VALORES ATUAIS E ANTERIORES
    const currentVal = sumUntilDU(currentDate, currentDU);
    const currentCount = countUntilDU(currentDate, currentDU);
    
    const prevVal = sumUntilDU(prevDate, currentDU);
    const prevCount = countUntilDU(prevDate, currentDU);

    // MÉDIAS (VALOR E CONTAGEM)
    const last3 = dates.slice(Math.max(0, n - 4), n - 1);
    const last6 = dates.slice(Math.max(0, n - 7), n - 1);

    const avg3Val = last3.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last3.length || 1);
    const avg3Count = last3.reduce((acc, d) => acc + countUntilDU(d, currentDU), 0) / (last3.length || 1);

    const avg6Val = last6.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last6.length || 1);
    const avg6Count = last6.reduce((acc, d) => acc + countUntilDU(d, currentDU), 0) / (last6.length || 1);

    const calculateProjection = (accumulated, currentDay, totalDays) => {
        if (currentDay === 0) return 0;
        return (accumulated / currentDay) * totalDays;
    };

    const history = dates.map(d => {
        const isCurrent = d === currentDate;
        const totalMonthVal = sumTotalMonth(d);
        const closingValue = isCurrent ? calculateProjection(currentVal, currentDU, totalBusinessDays || 22) : totalMonthVal;

        return {
            date: d,
            label: formatMonth(d),
            value: closingValue, 
            valueAtDU: sumUntilDU(d, currentDU),
            countAtDU: countUntilDU(d, currentDU), // CONTAGEM HISTÓRICA NO MESMO DU
            isCurrent: isCurrent
        };
    }).reverse();

    return { 
        current: currentVal, 
        count: currentCount, 
        prev: prevVal, 
        prevCount: prevCount,
        avg3: avg3Val, 
        avg3Count: avg3Count,
        avg6: avg6Val, 
        avg6Count: avg6Count,
        history, 
        currentDU, 
        totalBusinessDays 
    };
};

// --- COMPONENTES UI ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,51,102,0.1)] border border-slate-100 transition-all duration-300 flex flex-col justify-between ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ title, value, type = "currency", comparison, icon: Icon, subtext }) => {
    const isPositive = comparison >= 0;
    const format = type === 'currency' ? formatCurrency : formatNumber;
    return (
        <Card className="p-6 relative overflow-hidden group hover:shadow-lg h-full">
             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">{Icon && <Icon size={80} color="#003366" />}</div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-[#003366]">{format(value)}</h3>
            </div>
            <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-50/50">
                <div className="text-xs text-slate-400 font-medium max-w-[60%] flex items-center gap-1">
                    <Users size={12} className="text-slate-300"/> {subtext}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {comparison !== null && (<>{isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(comparison).toFixed(1)}%</>)}
                </div>
            </div>
        </Card>
    );
};

const AnalyticalTable = ({ history, currentDU, type, category }) => {
    const format = type === 'currency' ? formatCurrency : formatNumber;
    return (
      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-[#003366]" />
          <h3 className="text-lg font-bold text-slate-800">Visão Analítica - Evolução Dia Útil {currentDU}</h3>
        </div>
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Referência</th>
                  {/* COLUNA EXTRA DE ACORDOS - EXCETO CONTENÇÃO */}
                  {category !== 'CONTENÇÃO' && (
                      <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acordos (Qtd)</th>
                  )}
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Resultado (D.U. {currentDU})</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap text-blue-600">Média Diária (Ticket)</th>
                  <th className="px-6 py-4 font-bold text-right whitespace-nowrap bg-slate-50/80">FECHAMENTO / PROJEÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((row, index) => (
                  <tr key={index} className={`hover:bg-slate-50 transition-colors ${row.isCurrent ? 'bg-blue-100' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/> {row.label}
                    </td>
                    
                    {/* DADO EXTRA DE ACORDOS */}
                    {category !== 'CONTENÇÃO' && (
                        <td className="px-6 py-4 text-right text-slate-600 font-medium whitespace-nowrap">
                            {row.countAtDU}
                        </td>
                    )}

                    <td className="px-6 py-4 text-right font-bold text-[#003366] whitespace-nowrap">{format(row.valueAtDU)}</td>
                    
                    <td className="px-6 py-4 text-right text-slate-600 whitespace-nowrap font-medium">
                        {format(row.valueAtDU / currentDU)}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-slate-700 whitespace-nowrap bg-slate-50/30">
                      {row.isCurrent ? (
                          <div className="flex flex-col items-end">
                              <span className="text-[#003366] text-lg">{format(row.value)}</span>
                              <span className="text-[10px] uppercase tracking-widest text-[#003366]/70 font-bold">PROJEÇÃO</span>
                          </div>
                      ) : format(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
};

const ProductDashboard = ({ category, data, isMobile, onNext, nextName }) => {
    const kpis = useMemo(() => calculateKPIs(data, category), [data, category]);
    const isContencao = category === 'CONTENÇÃO';
    const type = isContencao ? 'number' : 'currency';
    const varPrev = kpis.prev > 0 ? ((kpis.current - kpis.prev) / kpis.prev) * 100 : 0;
    const varAvg3 = kpis.avg3 > 0 ? ((kpis.current - kpis.avg3) / kpis.avg3) * 100 : 0;

    const projectionVal = (kpis.current / (kpis.currentDU || 1)) * (kpis.totalBusinessDays || 22);

    return (
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            <div className="bg-gradient-to-r from-[#003366] to-[#004990] rounded-3xl p-6 md:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                    <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-80">
                             {category === 'CASH' && <Wallet size={20}/>}
                             {category === 'RENEGOCIAÇÃO' && <Handshake size={20}/>}
                             {category === 'ENTREGA AMIGÁVEL' && <Car size={20}/>}
                             {category === 'CONSOLIDADO' && <Layers size={20}/>}
                            <span className="text-sm font-semibold tracking-widest uppercase">{category}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{type === 'currency' ? formatCurrency(kpis.current) : formatNumber(kpis.current)}</h1>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
                                <Clock size={14} /> <span>Acumulado até o {kpis.currentDU}º Dia Útil</span>
                            </div>
                            <div className="inline-flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-white/90">
                                <Users size={12} /> <span>{kpis.count} acordos</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-right bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full md:w-auto md:min-w-[200px]">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-end gap-2">
                            <TrendingUp size={14}/> Projeção (Est.)
                        </p>
                        <h2 className="text-3xl font-bold text-white">{type === 'currency' ? formatCurrency(projectionVal) : formatNumber(projectionVal)}</h2>
                        <p className="text-[10px] text-white/50 mt-1">Base: {kpis.totalBusinessDays} dias úteis</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform translate-x-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard 
                    title="vs. Mês Anterior" 
                    value={kpis.prev} 
                    comparison={varPrev} 
                    type={type} 
                    icon={Calendar} 
                    subtext={`${Math.round(kpis.prevCount)} acordos`}
                />
                <MetricCard 
                    title="VS. MÉDIA TRIMESTRAL" 
                    value={kpis.avg3} 
                    comparison={varAvg3} 
                    type={type} 
                    icon={Activity} 
                    subtext={`Média: ${Math.round(kpis.avg3Count)} acordos`}
                />
                 <MetricCard 
                    title="VS. MÉDIA SEMESTRAL" 
                    value={kpis.avg6} 
                    comparison={((kpis.current - kpis.avg6)/kpis.avg6)*100} 
                    type={type} 
                    icon={TrendingUp} 
                    subtext={`Média: ${Math.round(kpis.avg6Count)} acordos`}
                />
            </div>
            <AnalyticalTable history={kpis.history} currentDU={kpis.currentDU} type={type} category={category} />
            {isMobile && nextName && (
                <button onClick={onNext} className="w-full mt-8 bg-white border border-slate-200 text-[#003366] p-4 rounded-xl font-bold flex items-center justify-between shadow-sm">
                    <span>Próximo: {nextName}</span> <ArrowRight size={20} />
                </button>
            )}
        </div>
    );
};

const FileUploader = ({ supabase, onDataSaved, isMobile, isHomolog }) => {
    const [status, setStatus] = useState('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [manualDU, setManualDU] = useState('1'); 
    const [totalDays, setTotalDays] = useState('22'); 
    
    const handleFile = async (e, mode) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!manualDU || parseInt(manualDU) < 1) {
            alert("Por favor, informe o Dia Útil atual (DU).");
            e.target.value = null; return;
        }
        if (!totalDays || parseInt(totalDays) < manualDU) {
            alert("Dias Úteis Totais inválido.");
            e.target.value = null; return;
        }
        
        setStatus('processing');
        setStatusMsg("Lendo arquivo...");

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const processed = parseStructuredCSV(text, manualDU, totalDays);
            
            if (!processed || processed.rawData.length === 0) {
                alert("Erro: CSV vazio ou inválido."); setStatus('idle'); return;
            }

            if (mode === 'cloud' && !isHomolog) {
                if (!supabase) { alert("Supabase não inicializado."); setStatus('idle'); return; }
                setStatusMsg("Enviando dados para o Supabase...");
                try {
                    const { error } = await supabase.from('dashboards').upsert({ id: 'latest', content: processed, updated_at: new Date().toISOString() });
                    if (error) throw error;
                    onDataSaved(processed); setStatus('success-cloud'); setStatusMsg("Sucesso! Base de dados atualizada.");
                } catch(err) {
                    console.error("Erro Supabase:", err); alert("Erro ao salvar: " + err.message); setStatus('idle');
                }
            } else {
                onDataSaved(processed); setStatus('success-local'); setStatusMsg("Simulação local carregada.");
            }
            setTimeout(() => { setStatus('idle'); setStatusMsg(''); }, 3000);
        };
        reader.readAsText(file, 'UTF-8'); 
    };

    return (
        <div className="max-w-2xl mx-auto pt-10 text-center pb-20">
            <Card className="p-10">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CloudLightning size={40} className="text-[#003366]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestão de Dados (Supabase)</h2>
                <p className="text-slate-500 mb-8">Importe o arquivo CSV completo para atualizar os indicadores.</p>
                
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-4 text-[#003366] font-bold border-b border-slate-200 pb-2">
                        <Settings size={18}/> Parâmetros do Mês Atual
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dia Útil (D.U.) Atual</label>
                            <input type="number" min="1" max="31" value={manualDU} onChange={(e) => setManualDU(e.target.value)}
                                className="p-3 w-full border border-slate-300 rounded-lg text-center font-bold text-[#003366] focus:outline-none focus:border-[#003366]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">D.U. Totais (Mês)</label>
                            <input type="number" min="1" max="31" value={totalDays} onChange={(e) => setTotalDays(e.target.value)}
                                className="p-3 w-full border border-slate-300 rounded-lg text-center font-bold text-[#003366] focus:outline-none focus:border-[#003366]" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 italic">* Usado para cálculo de projeção do mês corrente.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <label className={`cursor-pointer bg-[#003366] text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isHomolog ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002244]'}`}>
                        <Cloud size={20} /> Publicar na Nuvem (Oficial)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'cloud')} disabled={isHomolog} />
                    </label>
                    <label className="cursor-pointer bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <Eye size={20} /> Simular Visualização (Local)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'local')} />
                    </label>
                </div>
                {status !== 'idle' && <p className={`mt-4 font-bold ${status.includes('success') ? 'text-green-600' : 'text-blue-600'}`}>{statusMsg}</p>}
            </Card>
        </div>
    );
};

const LoginScreen = ({ supabase, onLogin, onHomolog, configError }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mode, setMode] = useState('prod');

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setErrorMsg('');
        if (mode === 'homolog') {
            if (email === "admin@avocati.adv.br" && pass === "abc@123") { onHomolog(); } 
            else { setErrorMsg("Credenciais inválidas"); setLoading(false); }
        } else {
            if (!supabase) { setErrorMsg("Erro crítico: Supabase off."); setLoading(false); return; }
            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
                if (error) throw error;
            } catch (err) {
                let msg = "Erro desconhecido.";
                if (err.message.includes("Invalid login")) msg = "E-mail ou senha incorretos.";
                setErrorMsg(msg); setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-center">
                <img src={LOGO_DARK_URL} alt="OCL" className="h-16 mx-auto mb-8 object-contain" />
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                    <button onClick={() => setMode('prod')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'prod' ? 'bg-white shadow text-[#003366]' : 'text-slate-400'}`}>Oficial</button>
                    <button onClick={() => setMode('homolog')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'homolog' ? 'bg-white shadow text-amber-600' : 'text-slate-400'}`}>Teste</button>
                </div>
                {configError && mode === 'prod' && <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-left"><h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Configuração</h4><p className="text-amber-700 text-xs">Verifique variáveis de ambiente no Vercel.</p></div>}
                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="usuario@ocl.adv.br" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label><input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="••••••••" /></div>
                    {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2"><ShieldAlert size={16} /> {errorMsg}</div>}
                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] ${mode === 'homolog' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#003366] hover:bg-[#002244]'}`}>{loading ? <Loader2 className="animate-spin mx-auto"/> : (mode === 'homolog' ? 'Acessar Homologação' : 'Entrar')}</button>
                </form>
                <p className="mt-8 text-xs text-slate-400">© 2025 OCL Advogados Associados</p>
            </div>
        </div>
    );
};

const App = () => {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('CONSOLIDADO');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isHomolog, setIsHomolog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState(null);
    const isMobile = useIsMobile();
    const isConfigured = !SUPABASE_URL.includes("xyzcompany");

    const MENU = [
        { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
        { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
        { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
        { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
        { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
        { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
        { id: 'gestao', label: 'Gestão de Dados', icon: Database, spacing: true },
    ];

    useEffect(() => {
        if (!document.getElementById('tailwind-script')) {
            const script = document.createElement('script');
            script.id = 'tailwind-script';
            script.src = "https://cdn.tailwindcss.com";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        const loadSupabase = async () => {
            if (window.supabase) { 
                setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: { storage: window.sessionStorage }
                })); 
                return; 
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => { 
                if (window.supabase) {
                    setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: { storage: window.sessionStorage }
                    }));
                }
            };
            document.head.appendChild(script);
        };
        loadSupabase();
    }, []);

    useEffect(() => {
        if (!user || !supabase) return;
        const INACTIVITY_LIMIT = 10 * 60 * 1000;
        let timeout;
        const handleLogoutTimer = () => { handleLogout(); };
        const resetTimer = () => { clearTimeout(timeout); timeout = setTimeout(handleLogoutTimer, INACTIVITY_LIMIT); };
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer();
        return () => { clearTimeout(timeout); events.forEach(event => document.removeEventListener(event, resetTimer)); };
    }, [user, supabase]);

    useEffect(() => {
        if (!supabase) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user); setIsHomolog(false); setLoading(true);
                supabase.from('dashboards').select('content').eq('id', 'latest').single().then(({ data: dbData }) => {
                        if (dbData && dbData.content) setData(dbData.content);
                        setLoading(false);
                    });
            } else { setUser(null); setLoading(false); }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => { if (supabase) await supabase.auth.signOut(); setIsHomolog(false); setData(null); setUser(null); };
    const currentIndex = MENU.findIndex(m => m.id === activeTab);
    const nextTab = currentIndex < MENU.length - 1 && MENU[currentIndex + 1].id !== 'gestao' ? MENU[currentIndex + 1] : null;
    const prevTab = currentIndex > 0 ? MENU[currentIndex - 1] : null;

    if (loading) return <div className="flex items-center justify-center bg-[#F1F5F9]" style={{ minHeight: '100vh' }}><Loader2 size={40} className="text-[#003366] animate-spin"/></div>;
    if (!user && !isHomolog) return <LoginScreen supabase={supabase} onLogin={() => {}} onHomolog={() => { setIsHomolog(true); setLoading(false); }} configError={!isConfigured} />;

    return (
        <div className="flex flex-col md:flex-row bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden" style={{ minHeight: '100vh' }}>
            <aside className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#003366] to-[#001a33] text-white transition-all duration-300 shadow-2xl flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'} ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}>
                <div className="p-6 flex items-center justify-center h-24 border-b border-white/10 relative">
                    {isSidebarOpen ? <img src={LOGO_LIGHT_URL} alt="OCL" className="h-10 object-contain"/> : <img src={LOGO_LIGHT_URL} className="h-8"/>}
                    {isMobile && <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-8 text-white/50"><X/></button>}
                </div>
                <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                    {MENU.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'bg-white text-[#003366] shadow-lg translate-x-1 font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                            <item.icon size={20} /> {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${!isSidebarOpen && 'justify-center'}`}><LogOut size={20} />{isSidebarOpen && <span className="text-sm">Sair do Sistema</span>}</button>
                    {isSidebarOpen && isHomolog && <div className="text-center text-[10px] text-amber-400 mt-2 font-mono">AMBIENTE DE TESTE</div>}
                </div>
            </aside>
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-72' : 'ml-20')}`} style={{ minHeight: '100vh' }}>
                <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex justify-between items-center shadow-sm h-16">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Menu size={20} /></button>
                        <h2 className="font-bold text-[#003366] text-lg hidden md:block">{MENU.find(m => m.id === activeTab)?.label}</h2>
                     </div>
                     <div className="flex items-center gap-3">
                         {isMobile && (
                             <div className="flex gap-1">
                                 {/* BOTÃO LOGOUT MOBILE */}
                                 <button onClick={handleLogout} className="p-2 bg-red-50 text-red-600 rounded-lg mr-2" title="Sair"><LogOut size={16}/></button>
                                 <button onClick={() => {if(prevTab) setActiveTab(prevTab.id)}} disabled={!prevTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronLeft size={16}/></button>
                                 <button onClick={() => {if(nextTab) setActiveTab(nextTab.id)}} disabled={!nextTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronRight size={16}/></button>
                             </div>
                         )}
                         {data && (<div className="bg-blue-50 text-[#003366] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100"><Calendar size={14}/> {data.currentDU}º Dia Útil</div>)}
                     </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {isMobile && isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}></div>}
                    {activeTab === 'gestao' ? (<FileUploader supabase={supabase} onDataSaved={setData} isMobile={isMobile} isHomolog={isHomolog} />) : (data ? (<ProductDashboard category={activeTab} data={data} isMobile={isMobile} onNext={() => { if(nextTab) { setActiveTab(nextTab.id); window.scrollTo(0,0); }}} nextName={nextTab?.label} />) : (<div className="flex flex-col items-center justify-center h-full text-slate-400"><Database size={64} className="mb-4 opacity-20"/><p>Nenhum dado carregado.</p><button onClick={() => setActiveTab('gestao')} className="mt-4 text-[#003366] font-bold hover:underline">Ir para Gestão de Dados</button></div>))}
                </div>
            </main>
        </div>
    );
};

export default App;