import { useState } from 'react';
import { Loader2, ShieldAlert, AlertTriangle } from 'lucide-react';

const LOGO_DARK_URL = '/logo.png';

interface SupabaseAuthClient {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  };
}

interface LoginScreenProps {
  supabase: SupabaseAuthClient | null;
  onHomolog: () => void;
  configError: boolean;
}

export const LoginScreen = ({ supabase, onHomolog, configError }: Readonly<LoginScreenProps>) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'prod' | 'homolog'>('prod');

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    if (mode === 'homolog') {
      if (email === 'admin@avocati.adv.br' && pass === 'abc@123') {
        onHomolog();
        setLoading(false);
      } else {
        setErrorMsg('Credenciais inválidas');
        setLoading(false);
      }
    } else {
      if (!supabase) {
        setErrorMsg('Erro crítico: Supabase off.');
        setLoading(false);
        return;
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        setLoading(false);
      } catch (err) {
        let msg = 'Erro desconhecido.';
        if ((err as Error).message.includes('Invalid login')) msg = 'E-mail ou senha incorretos.';
        setErrorMsg(msg);
        setLoading(false);
      }
    }
  };

  const modeLabel = mode === 'homolog' ? 'Acessar Homologação' : 'Entrar';
  const buttonLabel = loading ? <Loader2 className="mx-auto animate-spin" /> : modeLabel;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-12">
        <img src={LOGO_DARK_URL} alt="OCL" className="mx-auto mb-8 h-16 object-contain" />
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setMode('prod')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${mode === 'prod' ? 'bg-white text-ocl-primary shadow' : 'text-slate-400'}`}
          >
            Oficial
          </button>
          <button
            onClick={() => setMode('homolog')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${mode === 'homolog' ? 'bg-white text-amber-600 shadow' : 'text-slate-400'}`}
          >
            Teste
          </button>
        </div>
        {configError && mode === 'prod' && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle size={16} /> Configuração
            </h4>
            <p className="text-xs text-amber-700">Verifique variáveis de ambiente no Vercel.</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
                placeholder="usuario@ocl.adv.br"
              />
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              <span>Senha</span>
              <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
                placeholder="••••••••"
              />
            </label>
          </div>
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <ShieldAlert size={16} /> {errorMsg}
            </div>
          )}
          <button
            type="submit"
            className={`w-full transform rounded-xl py-4 font-bold text-white transition-all hover:scale-[1.02] ${mode === 'homolog' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-ocl-primary hover:bg-ocl-hover'}`}
          >
            {buttonLabel}
          </button>
        </form>
        <p className="mt-8 text-xs text-slate-400">© 2026 OCL Advogados Associados</p>
      </div>
    </div>
  );
};
