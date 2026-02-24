import { useState } from 'react';
import { Loader2, ShieldAlert, AlertTriangle } from 'lucide-react';

const LOGO_DARK_URL = "/logo.png";

export const LoginScreen = ({ supabase, onLogin, onHomolog, configError }) => {
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
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="usuario@ocl.adv.br" /></label></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha<input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#003366]" placeholder="••••••••" /></label></div>
                    {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2"><ShieldAlert size={16} /> {errorMsg}</div>}
                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] ${mode === 'homolog' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#003366] hover:bg-[#002244]'}`}>{loading ? <Loader2 className="animate-spin mx-auto"/> : (mode === 'homolog' ? 'Acessar Homologação' : 'Entrar')}</button>
                </form>
                <p className="mt-8 text-xs text-slate-400">© 2025 OCL Advogados Associados</p>
            </div>
        </div>
    );
};
