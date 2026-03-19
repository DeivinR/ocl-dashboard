import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';

const LOGO_DARK_URL = '/logo.png';
const VERIFIED_KEY = 'pwd_reset_verified';

interface PasswordChangePageProps {
  supabase: SupabaseClient | null;
}

function clearVerifiedFlag() {
  sessionStorage.removeItem(VERIFIED_KEY);
}

function parseRecoveryParams(search: string, hash: string) {
  const fromSearch = new URLSearchParams(search);
  if (fromSearch.has('token_hash') || fromSearch.has('type')) return fromSearch;
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
}

function mapUpdateError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('expired')) return 'Link expirado. Solicite um novo e-mail.';
  if (lower.includes('same password')) return 'A nova senha deve ser diferente da anterior.';
  if (lower.includes('weak')) return 'Senha fraca. Use pelo menos 6 caracteres.';
  return 'Erro inesperado ao alterar senha.';
}

export const PasswordChangePage = ({ supabase }: Readonly<PasswordChangePageProps>) => {
  const navigate = useNavigate();
  const location = useLocation();

  const alreadyVerified = sessionStorage.getItem(VERIFIED_KEY) === '1';
  const [tokenLoading, setTokenLoading] = useState(!alreadyVerified);
  const [tokenVerified, setTokenVerified] = useState(alreadyVerified);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const params = useMemo(() => parseRecoveryParams(location.search, location.hash), [location.search, location.hash]);
  const tokenHash = params.get('token_hash');
  const tokenType = (params.get('type') ?? '').toLowerCase();

  useEffect(() => {
    if (alreadyVerified) return;

    const controller = new AbortController();

    (async () => {
      if (!supabase || !tokenHash || tokenType !== 'recovery') {
        const msg = supabase
          ? 'Link inválido. Solicite um novo e-mail de redefinição.'
          : 'Erro crítico: Supabase indisponível.';
        setTokenVerified(false);
        setTokenLoading(false);
        setErrorMsg(msg);
        return;
      }

      setTokenLoading(true);
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
      if (controller.signal.aborted) return;

      if (error) {
        const lower = error.message.toLowerCase();
        setErrorMsg(
          lower.includes('expired') || lower.includes('otp_expired')
            ? 'Link expirado. Solicite um novo e-mail.'
            : 'Link inválido ou já utilizado. Solicite um novo e-mail.',
        );
        setTokenVerified(false);
        setTokenLoading(false);
        return;
      }

      sessionStorage.setItem(VERIFIED_KEY, '1');
      setTokenVerified(true);
      setTokenLoading(false);
      navigate('/change-password', { replace: true });
    })();

    return () => controller.abort();
  }, [alreadyVerified, navigate, supabase, tokenHash, tokenType]);

  const isValid = password.length >= 6 && password === confirmPassword && !loading && tokenVerified;
  const inputsDisabled = loading || tokenLoading || !tokenVerified;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || !tokenVerified) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não conferem.');
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
        const errorLower = error.message.toLowerCase();
        const isSessionExpiredAfterUpdate = errorLower.includes('session') || errorLower.includes('expired');

        if (isSessionExpiredAfterUpdate) {
          clearVerifiedFlag();
          setSuccessMsg('Senha alterada com sucesso. Redirecionando para o login...');
          setPassword('');
          setConfirmPassword('');
          await supabase.auth.signOut();
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setLoading(false);
        setErrorMsg(mapUpdateError(error.message));
        return;
      }

      clearVerifiedFlag();
      setSuccessMsg('Senha alterada com sucesso. Redirecionando para o login...');
      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setErrorMsg('Erro inesperado ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  let buttonLabel: React.ReactNode = 'Atualizar senha';
  if (tokenLoading) {
    buttonLabel = (
      <span className="inline-flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" /> Validando link...
      </span>
    );
  } else if (loading) {
    buttonLabel = <Loader2 className="mx-auto animate-spin" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-12">
        <img src={LOGO_DARK_URL} alt="OCL" className="mx-auto mb-8 h-16 object-contain" />

        <h1 className="mb-2 text-left text-xl font-semibold text-slate-800">Criar nova senha</h1>
        <p className="mb-6 text-left text-sm text-slate-500">Defina abaixo a sua nova senha de acesso.</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              <span>Nova senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={inputsDisabled}
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
                disabled={inputsDisabled}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-ocl-primary focus:outline-none"
                placeholder="••••••••"
              />
            </label>
            {passwordMismatch && <p className="mt-1 text-xs text-red-600">As senhas devem ser iguais.</p>}
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
            disabled={!isValid}
            className="w-full transform rounded-xl bg-ocl-primary py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-ocl-hover"
          >
            {buttonLabel}
          </button>
        </form>

        {!tokenLoading && !tokenVerified && (
          <button
            type="button"
            onClick={() => {
              clearVerifiedFlag();
              navigate('/forgot-password');
            }}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Solicitar novo link
          </button>
        )}

        <a
          href="/login"
          onClick={clearVerifiedFlag}
          className="mt-4 inline-block text-xs font-semibold text-ocl-primary hover:underline"
        >
          Voltar para login
        </a>

        <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} OCL Advogados Associados</p>
      </div>
    </div>
  );
};
