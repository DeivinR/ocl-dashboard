import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Wallet, Handshake, Car, Gavel, Upload, FileText, TrendingUp, TrendingDown, 
  Calendar, Menu, Loader2, ShieldAlert, Table, Clock, Info, 
  Cloud, CloudLightning, X, Lock, Layers, RefreshCw, Eye, ArrowRight,
  ChevronLeft, ChevronRight, Database, LogOut, DollarSign, PieChart, Activity, Minus, Settings, Trash2, CheckCircle, AlertTriangle
} from 'lucide-react';

const SYSTEM_VERSION = "v4.3 - Vercel Env Support";

// --- CONFIGURAÇÃO DE AMBIENTE (AUTO-DETECÇÃO VERCEL) ---
// Tenta ler as variáveis do Vercel. Se não existirem, usa os placeholders.
const GET_ENV = (key) => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {
        // Ignora erro se process não existir
    }
    return null;
};

// PREENCHA AQUI MANUALMENTE APENAS SE NÃO ESTIVER USANDO A INTEGRAÇÃO DO VERCEL
const MANUAL_URL = "https://vjcgcoxujrixaznbyzvg.supabase.co"; 
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2djb3h1anJpeGF6bmJ5enZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTc1MDEsImV4cCI6MjA4MTM3MzUwMX0.JKi6ybypqqwZTeJH__QxB-ajA_gkAk67t-4NfmYcVmY"; 

const SUPABASE_URL = GET_ENV('NEXT_PUBLIC_SUPABASE_URL') || MANUAL_URL;
const SUPABASE_ANON_KEY = GET_ENV('NEXT_PUBLIC_SUPABASE_ANON_KEY') || MANUAL_KEY;

// --- CONFIGURAÇÃO DA LOGO ---
const LOGO_LIGHT_URL = "/logo-white.png"; 
const LOGO_DARK_URL = "/logo.png";        

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

// --- CORES & TEMA ---
const THEME = {
  primary: '#003366', 
  secondary: '#004990',
  accent: '#F59E0B',
  bg: '#F1F5F9',
  card: '#FFFFFF',
  text: '#1E293B',
  success: '#10B981',
  danger: '#EF4444'
};

// --- PARSERS & HELPERS ---

const parseCurrency = (valStr) => {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    let clean = valStr.toString().replace(/[R$\s]/g, '').trim();
    if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
};

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(Math.round(val));
const formatMonth = (str) => { 
    if (!str) return "-"; 
    const [y, m] = str.split('-'); 
    return new Date(y, m - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase(); 
};

// NOVA LÓGICA DE LEITURA DO CSV (Estruturada & Higienizada)
const parseStructuredCSV = (csvText, manualDU) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return null;

    const headers = lines[0].split(';').map(h => h.trim().toUpperCase());
    
    const colMap = {
        PRODUTO: headers.indexOf('PRODUTO'),
        REPASSE: headers.indexOf('REPASSE'),
        HO: headers.indexOf('HO'),
        DU: headers.indexOf('DU'),
        PERIODO: headers.indexOf('PERÍODO'),
        TIPO: headers.indexOf('TIPO'),
        RISCO: headers.indexOf('RISCO CONTENÇÃO')
    };

    const rawData = [];
    
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(';');
        if (row.length < headers.length) continue;

        const du = parseInt(row[colMap.DU]) || 0;

        rawData.push({
            produto: row[colMap.PRODUTO]?.trim() || "Outros", 
            valor: parseCurrency(row[colMap.REPASSE]),
            ho: parseCurrency(row[colMap.HO]),
            du: du,
            periodo: row[colMap.PERIODO] || "",
            tipo: row[colMap.TIPO]?.trim() || "",
            risco: row[colMap.RISCO]?.trim() || ""
        });
    }

    const uniqueDates = [...new Set(rawData.map(d => d.periodo))].sort();
    
    let finalDU = manualDU ? parseInt(manualDU) : 1; 
    
    if (!manualDU) {
        const latestDate = uniqueDates[uniqueDates.length - 1];
        const currentMonthData = rawData.filter(d => d.periodo === latestDate);
        finalDU = Math.max(...currentMonthData.map(d => d.du), 1);
    }

    return {
        rawData,
        dates: uniqueDates,
        currentDU: finalDU
    };
};

// --- CÁLCULO DE KPIS ---
const calculateKPIs = (data, category) => {
    if (!data || !data.rawData) return { current: 0, prev: 0, avg3: 0, avg6: 0, history: [] };

    const { rawData, dates, currentDU } = data;
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

    const currentVal = sumUntilDU(currentDate, currentDU);
    const prevVal = sumUntilDU(prevDate, currentDU);

    const last3 = dates.slice(Math.max(0, n - 4), n - 1);
    const last6 = dates.slice(Math.max(0, n - 7), n - 1);

    const avg3Val = last3.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last3.length || 1);
    const avg6Val = last6.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last6.length || 1);

    const history = dates.map(d => ({
        date: d,
        label: formatMonth(d),
        value: sumTotalMonth(d),
        valueAtDU: sumUntilDU(d, currentDU),
        isCurrent: d === currentDate
    })).reverse();

    return {
        current: currentVal,
        prev: prevVal,
        avg3: avg3Val,
        avg6: avg6Val,
        history,
        currentDU
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
             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {Icon && <Icon size={80} color="#003366" />}
            </div>
            
            {/* Conteúdo Principal */}
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-[#003366]">{format(value)}</h3>
            </div>

            {/* Rodapé do Card: Subtexto na esq, Badge na direita inferior */}
            <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-50/50">
                <div className="text-xs text-slate-400 max-w-[60%]">
                    {subtext || "Comparativo no período"}
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {comparison !== null && (
                        <>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(comparison).toFixed(1)}%
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};

const AnalyticalTable = ({ history, currentDU, type }) => {
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
                  <th className="px-6 py-4 font-semibold">Referência</th>
                  <th className="px-6 py-4 font-semibold text-right">Resultado (D.U. {currentDU})</th>
                  <th className="px-6 py-4 font-semibold text-right">Fechamento Mês</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((row, index) => (
                  <tr key={index} className={`hover:bg-slate-50 transition-colors ${row.isCurrent ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      {row.label}
                      {row.isCurrent && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">ATUAL</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#003366]">
                      {format(row.valueAtDU)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {row.isCurrent ? <span className="text-xs italic text-slate-400">Em andamento</span> : format(row.value)}
                    </td>
                     <td className="px-6 py-4 text-center">
                         {row.isCurrent ? (
                             <Activity size={16} className="mx-auto text-blue-500 animate-pulse" />
                         ) : (
                             <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto"></div>
                         )}
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

// --- TELA PRINCIPAL DO PRODUTO ---
const ProductDashboard = ({ category, data, isMobile, onNext, nextName }) => {
    const kpis = useMemo(() => calculateKPIs(data, category), [data, category]);
    const isContencao = category === 'CONTENÇÃO';
    const type = isContencao ? 'number' : 'currency';
    
    const varPrev = kpis.prev > 0 ? ((kpis.current - kpis.prev) / kpis.prev) * 100 : 0;
    const varAvg3 = kpis.avg3 > 0 ? ((kpis.current - kpis.avg3) / kpis.avg3) * 100 : 0;

    return (
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-[#003366] to-[#004990] rounded-3xl p-6 md:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                         {category === 'CASH' && <Wallet size={20}/>}
                         {category === 'RENEGOCIAÇÃO' && <Handshake size={20}/>}
                         {category === 'ENTREGA AMIGÁVEL' && <Car size={20}/>}
                         {category === 'CONSOLIDADO' && <Layers size={20}/>}
                        <span className="text-sm font-semibold tracking-widest uppercase">{category}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{type === 'currency' ? formatCurrency(kpis.current) : formatNumber(kpis.current)}</h1>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
                        <Clock size={14} />
                        <span>Acumulado até o {kpis.currentDU}º Dia Útil</span>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform translate-x-10"></div>
                <div className="absolute -right-10 -bottom-20 opacity-10">
                    <PieChart size={300} />
                </div>
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard 
                    title="vs. Mês Anterior" 
                    value={kpis.prev} 
                    comparison={varPrev} 
                    type={type}
                    icon={Calendar}
                    subtext="Comparativo no mesmo Dia Útil"
                />
                <MetricCard 
                    title="Média Trimestral" 
                    value={kpis.avg3} 
                    comparison={varAvg3} 
                    type={type}
                    icon={Activity}
                    subtext="Tendência curto prazo"
                />
                 <MetricCard 
                    title="Média Semestral" 
                    value={kpis.avg6} 
                    comparison={((kpis.current - kpis.avg6)/kpis.avg6)*100} 
                    type={type}
                    icon={TrendingUp}
                    subtext="Tendência longo prazo"
                />
            </div>

            <AnalyticalTable history={kpis.history} currentDU={kpis.currentDU} type={type} />
            
            {/* Nav Mobile Bottom */}
            {isMobile && nextName && (
                <button onClick={onNext} className="w-full mt-8 bg-white border border-slate-200 text-[#003366] p-4 rounded-xl font-bold flex items-center justify-between shadow-sm">
                    <span>Próximo: {nextName}</span>
                    <ArrowRight size={20} />
                </button>
            )}
        </div>
    );
};

// --- UPLOADER (GESTÃO) - SUPABASE VERSION ---
const FileUploader = ({ supabase, onDataSaved, isMobile, isHomolog }) => {
    const [status, setStatus] = useState('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [manualDU, setManualDU] = useState('1'); 
    
    const handleFile = async (e, mode) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!manualDU || parseInt(manualDU) < 1) {
            alert("Por favor, informe o Dia Útil atual (DU) antes de carregar.");
            e.target.value = null;
            return;
        }
        
        setStatus('processing');
        setStatusMsg("Lendo arquivo...");

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const processed = parseStructuredCSV(text, manualDU);
            
            if (!processed || processed.rawData.length === 0) {
                alert("Erro: CSV vazio ou inválido.");
                setStatus('idle');
                return;
            }

            if (mode === 'cloud' && !isHomolog) {
                if (!supabase) {
                    alert("Supabase não inicializado. Verifique a configuração.");
                    setStatus('idle');
                    return;
                }

                setStatusMsg("Enviando dados para o Supabase...");
                
                try {
                    // SUPABASE UPLOAD: Substitui ou cria o registro 'latest' na tabela 'dashboards'
                    const { error } = await supabase
                        .from('dashboards')
                        .upsert({ 
                            id: 'latest', 
                            content: processed, // Salva todo o JSON processado na coluna 'content'
                            updated_at: new Date().toISOString()
                        });

                    if (error) throw error;

                    onDataSaved(processed);
                    setStatus('success-cloud');
                    setStatusMsg("Sucesso! Base de dados atualizada.");
                } catch(err) {
                    console.error("Erro Supabase:", err);
                    alert("Erro ao salvar no Supabase: " + err.message);
                    setStatus('idle');
                }
            } else {
                onDataSaved(processed);
                setStatus('success-local');
                setStatusMsg("Simulação local carregada.");
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
                
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left w-full md:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        <Settings size={14} className="inline mr-1"/> Defina o Dia Útil (D.U.) Atual
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="1" 
                            max="31"
                            value={manualDU}
                            onChange={(e) => setManualDU(e.target.value)}
                            className="p-3 w-24 border border-slate-300 rounded-lg text-center font-bold text-[#003366] focus:outline-none focus:border-[#003366]"
                        />
                        <div className="text-xs text-slate-400 max-w-[200px] flex items-center leading-tight">
                            Este valor será usado para calcular os comparativos de todos os meses anteriores.
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <label className={`cursor-pointer bg-[#003366] text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isHomolog ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002244]'}`}>
                        <Cloud size={20} />
                        Publicar na Nuvem (Oficial)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'cloud')} disabled={isHomolog} />
                    </label>
                    
                    <label className="cursor-pointer bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <Eye size={20} />
                        Simular Visualização (Local)
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'local')} />
                    </label>
                </div>
                
                {status === 'processing' && <p className="mt-4 text-blue-600 font-bold animate-pulse">{statusMsg}</p>}
                {status === 'success-cloud' && <p className="mt-4 text-green-600 font-bold">{statusMsg}</p>}
                {status === 'success-local' && <p className="mt-4 text-[#003366] font-bold">{statusMsg}</p>}
            </Card>
        </div>
    );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ supabase, onLogin, onHomolog, configError }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mode, setMode] = useState('prod');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (mode === 'homolog') {
            if (email === "admin@avocati.adv.br" && pass === "abc@123") {
                onHomolog();
            } else {
                setErrorMsg("Credenciais de homologação inválidas");
                setLoading(false);
            }
        } else {
            if (!supabase) {
                setErrorMsg("Erro crítico: Cliente Supabase não iniciado.");
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: pass,
                });
                
                if (error) throw error;
                // Sucesso
            } catch (err) {
                console.error("Login Error:", err);
                let msg = "Erro desconhecido.";
                if (err.message.includes("Invalid login credentials")) msg = "E-mail ou senha incorretos.";
                if (err.message.includes("Email not confirmed")) msg = "E-mail não confirmado. Verifique sua caixa de entrada.";
                setErrorMsg(msg);
                setLoading(false);
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

                {configError && mode === 'prod' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-left">
                        <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-2">
                            <AlertTriangle size={16}/> Configuração Necessária
                        </h4>
                        <p className="text-amber-700 text-xs leading-relaxed">
                            O sistema detectou chaves de exemplo. Se você estiver no Vercel, certifique-se de que a integração Supabase está ativa e as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>ANON_KEY</code> foram criadas.
                        </p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="usuario@ocl.adv.br" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
                        <input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="••••••••" />
                    </div>
                    
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                            <ShieldAlert size={16} /> {errorMsg}
                        </div>
                    )}

                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] ${mode === 'homolog' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#003366] hover:bg-[#002244]'}`}>
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : (mode === 'homolog' ? 'Acessar Homologação' : 'Entrar')}
                    </button>
                </form>
                <p className="mt-8 text-xs text-slate-400">© 2025 OCL Advogados Associados</p>
            </div>
        </div>
    );
};

// --- APP MAIN ---
const App = () => {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('CONSOLIDADO');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isHomolog, setIsHomolog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState(null);
    const isMobile = useIsMobile();
    
    // Check config status
    const isConfigured = !SUPABASE_URL.includes("xyzcompany");

    // Menu Definition
    const MENU = [
        { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
        { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
        { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
        { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
        { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
        { id: 'CONTENÇÃO', label: 'Contenção de Risco', icon: ShieldAlert, spacing: true },
        { id: 'gestao', label: 'Gestão de Dados', icon: Database, spacing: true },
    ];

    // INJEÇÃO AUTOMÁTICA DE ESTILOS (PARA AMBIENTES STANDALONE)
    useEffect(() => {
        if (!document.getElementById('tailwind-script')) {
            const script = document.createElement('script');
            script.id = 'tailwind-script';
            script.src = "https://cdn.tailwindcss.com";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // INICIALIZAÇÃO ASSÍNCRONA DO SUPABASE (CDN)
    useEffect(() => {
        const loadSupabase = async () => {
            // Verifica se o Supabase já está no window (caso de reload)
            if (window.supabase) {
                const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                setSupabase(client);
                return;
            }

            // Injeta o script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                if (window.supabase) {
                    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    setSupabase(client);
                }
            };
            document.head.appendChild(script);
        };
        loadSupabase();
    }, []);

    // LISTENER DE AUTH (Só roda quando 'supabase' estiver pronto)
    useEffect(() => {
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
                setIsHomolog(false);
                setLoading(true);
                
                // Carregar Dados do Supabase
                supabase
                    .from('dashboards')
                    .select('content')
                    .eq('id', 'latest')
                    .single()
                    .then(({ data: dbData, error }) => {
                        if (dbData && dbData.content) {
                            setData(dbData.content);
                        } else {
                            console.log("Nenhum dado encontrado no Supabase.");
                        }
                        setLoading(false);
                    });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
        setIsHomolog(false);
        setData(null);
    };

    // Navigation Helpers
    const currentIndex = MENU.findIndex(m => m.id === activeTab);
    const nextTab = currentIndex < MENU.length - 1 && MENU[currentIndex + 1].id !== 'gestao' ? MENU[currentIndex + 1] : null;
    const prevTab = currentIndex > 0 ? MENU[currentIndex - 1] : null;

    if (loading) return <div className="flex items-center justify-center bg-[#F1F5F9]" style={{ minHeight: '100vh' }}><Loader2 size={40} className="text-[#003366] animate-spin"/></div>;
    
    if (!user && !isHomolog) return <LoginScreen supabase={supabase} onLogin={() => {}} onHomolog={() => { setIsHomolog(true); setLoading(false); }} configError={!isConfigured} />;

    return (
        <div className="flex flex-col md:flex-row bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden" style={{ minHeight: '100vh' }}>
             {/* Sidebar Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#003366] to-[#001a33] text-white transition-all duration-300 shadow-2xl flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'} ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}>
                <div className="p-6 flex items-center justify-center h-24 border-b border-white/10 relative">
                    {isSidebarOpen ? <img src={LOGO_LIGHT_URL} alt="OCL" className="h-10 object-contain"/> : <img src={LOGO_LIGHT_URL} className="h-8"/>}
                    {isMobile && <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-8 text-white/50"><X/></button>}
                </div>

                <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                    {MENU.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'bg-white text-[#003366] shadow-lg translate-x-1 font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm">Sair do Sistema</span>}
                    </button>
                    {isSidebarOpen && isHomolog && <div className="text-center text-[10px] text-amber-400 mt-2 font-mono">AMBIENTE DE TESTE</div>}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-72' : 'ml-20')}`} style={{ minHeight: '100vh' }}>
                {/* Header Mobile/Desktop */}
                <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex justify-between items-center shadow-sm h-16">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                            <Menu size={20} />
                        </button>
                        <h2 className="font-bold text-[#003366] text-lg hidden md:block">{MENU.find(m => m.id === activeTab)?.label}</h2>
                     </div>
                     
                     {/* Data Info */}
                     <div className="flex items-center gap-3">
                         {isMobile && (
                             <div className="flex gap-1">
                                 <button onClick={() => {if(prevTab) setActiveTab(prevTab.id)}} disabled={!prevTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronLeft size={16}/></button>
                                 <button onClick={() => {if(nextTab) setActiveTab(nextTab.id)}} disabled={!nextTab} className="p-2 bg-slate-100 rounded-lg disabled:opacity-30"><ChevronRight size={16}/></button>
                             </div>
                         )}
                         {data && (
                             <div className="bg-blue-50 text-[#003366] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100">
                                 <Calendar size={14}/>
                                 {data.currentDU}º Dia Útil
                             </div>
                         )}
                     </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Overlay Mobile */}
                    {isMobile && isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}></div>}
                    
                    {activeTab === 'gestao' ? (
                        <FileUploader supabase={supabase} onDataSaved={setData} isMobile={isMobile} isHomolog={isHomolog} />
                    ) : (
                        data ? (
                            <ProductDashboard 
                                category={activeTab} 
                                data={data} 
                                isMobile={isMobile} 
                                onNext={() => { if(nextTab) { setActiveTab(nextTab.id); window.scrollTo(0,0); }}} 
                                nextName={nextTab?.label}
                            />
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                 <Database size={64} className="mb-4 opacity-20"/>
                                 <p>Nenhum dado carregado.</p>
                                 <button onClick={() => setActiveTab('gestao')} className="mt-4 text-[#003366] font-bold hover:underline">Ir para Gestão de Dados</button>
                             </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;