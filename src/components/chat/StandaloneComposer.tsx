import { useState, useCallback, type KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface StandaloneComposerProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function StandaloneComposer({
  onSubmit,
  disabled = false,
  placeholder = 'Pergunte sobre honorários, performance ou métricas…',
}: Readonly<StandaloneComposerProps>) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  }, [value, disabled, onSubmit]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = !value.trim();

  return (
    <div className="px-4 py-4">
      <div className="group mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-slate-200 transition-all duration-200 ease-in-out focus-within:shadow-lg focus-within:shadow-ocl-primary/5 focus-within:ring-2 focus-within:ring-ocl-primary/40">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        {!isEmpty && (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocl-primary text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-ocl-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 disabled:grayscale"
            aria-label="Enviar"
          >
            <SendHorizontal size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] font-medium tracking-wide text-slate-400/80">
        A IA pode cometer erros. Verifique informações importantes.
      </p>
    </div>
  );
}
