import { useState } from 'react';
import { Loader2, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { logger } from '../lib/logger';

const LOGO_DARK_URL = '/logo.png';

interface SupabaseAuthClient {
  auth: {
    resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ error: Error | null }>;
  };
}

interface ForgotPasswordPageProps {
  supabase: SupabaseAuthClient | null;
  configError: boolean;
  redirectTo?: string;
}

export const ForgotPasswordPage = ({ supabase, configError, redirectTo }: Readonly<ForgotPasswordPageProps>) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!supabase) {
      setErrorMsg('Erro crítico: Supabase off.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
      if (error) throw error;
      setSuccessMsg('Enviamos um link para redefinir sua senha. Verifique seu e-mail.');
    } catch (err) {
      logger.error('Failed to send password reset email', err as Error, { email });
      let msg = 'Erro ao enviar link de redefinição.';
      if ((err as Error).message.includes('rate limit'))
        msg = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading ? <Loader2 className="mx-auto animate-spin" /> : 'Enviar';

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-12">
        <img src={LOGO_DARK_URL} alt="OCL" className="mx-auto mb-8 h-16 object-contain" />

        {configError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle size={16} /> Configuração
            </h4>
            <p className="text-xs text-amber-700">Verifique variáveis de ambiente.</p>
          </div>
        )}

        <h1 className="mb-2 text-left text-xl font-semibold text-slate-800">Esqueci minha senha</h1>
        <p className="mb-6 text-left text-sm text-slate-500">
          Informe o e-mail cadastrado para receber um link de redefinição de senha.
        </p>

        <form onSubmit={handleReset} className="space-y-4 text-left">
          <div>
            <label htmlFor="forgot-email" className="mb-1 block text-xs font-bold uppercase text-slate-500">
              E-mail
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
              placeholder="usuario@avocati.adv.br"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <ShieldAlert size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full transform rounded-xl bg-ocl-primary py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-ocl-hover disabled:opacity-50"
            disabled={loading}
          >
            {buttonLabel}
          </button>
        </form>

        <a href="/login" className="mt-4 inline-block text-xs font-semibold text-ocl-primary hover:underline">
          Voltar para login
        </a>

        <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} OCL Advogados Associados</p>
      </div>
    </div>
  );
};
