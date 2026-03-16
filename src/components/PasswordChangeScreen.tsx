import { useState } from 'react';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_DARK_URL = '/logo.png';

interface SupabaseAuthClient {
  auth: {
    updateUser: (attributes: { password: string }) => Promise<{ data: unknown; error: Error | null }>;
  };
}

interface PasswordChangeScreenProps {
  supabase: SupabaseAuthClient | null;
}

export const PasswordChangeScreen = ({ supabase }: Readonly<PasswordChangeScreenProps>) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const validatePassword = () => {
    if (!password || password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (password !== confirmPassword) return 'As senhas não conferem.';
    return null;
  };

  const isValid = password.length >= 8 && password === confirmPassword && !loading;

  const handleChange = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg('');
    setSuccessMsg('');

    const validationError = validatePassword();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (!supabase) {
      setErrorMsg('Erro crítico: Supabase indisponível.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.includes('expired')) {
          setErrorMsg('Link expirado. Solicite um novo e-mail.');
        } else if (error.message.includes('same password')) {
          setErrorMsg('A nova senha deve ser diferente da anterior.');
        } else {
          setErrorMsg('Erro inesperado ao alterar senha.');
        }
        return;
      }

      setSuccessMsg('Senha alterada com sucesso. Redirecionando para o login...');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setErrorMsg('Erro inesperado ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading ? <Loader2 className="mx-auto animate-spin" /> : 'Atualizar senha';

  return (
    <div className="flex min-h-screen items-center justify-center overflow-auto bg-brand-bg p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-12">
        <img src={LOGO_DARK_URL} alt="OCL" className="mx-auto mb-8 h-16 object-contain" />

        <h1 className="mb-2 text-left text-xl font-semibold text-slate-800">Criar nova senha</h1>

        <p className="mb-6 text-left text-sm text-slate-500">
          Esta página foi acessada a partir de um link enviado para o seu e-mail. Defina abaixo a sua nova senha de
          acesso.
        </p>

        <form onSubmit={handleChange} noValidate className="space-y-4 text-left">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              <span>Nova senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
                placeholder="••••••••"
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              <span>Confirmar nova senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
                placeholder="••••••••"
              />
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <ShieldAlert size={16} />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full transform rounded-xl bg-ocl-primary py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-ocl-hover disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 text-xs font-semibold text-ocl-primary hover:underline"
        >
          Voltar para login
        </button>

        <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} OCL Advogados Associados</p>
      </div>
    </div>
  );
};
