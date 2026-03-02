import { SendHorizontal } from 'lucide-react';
import { ComposerPrimitive, useAuiState } from '@assistant-ui/react';

export function ChatComposer() {
  const isRunning = useAuiState((s) => s.thread).isRunning;

  return (
    <div className="border-t border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-sm">
      <ComposerPrimitive.Root className="group mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-slate-100/50 px-4 py-2.5 ring-1 ring-slate-200 transition-all duration-200 ease-in-out focus-within:bg-white focus-within:shadow-lg focus-within:shadow-ocl-primary/5 focus-within:ring-2 focus-within:ring-ocl-primary/40">
        <ComposerPrimitive.Input
          placeholder="Pergunte sobre honorários, performance ou métricas…"
          className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
          rows={1}
        />

        <ComposerPrimitive.Send
          disabled={isRunning}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocl-primary text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-ocl-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 disabled:grayscale disabled:hover:scale-100"
        >
          <SendHorizontal size={18} strokeWidth={2.5} className={isRunning ? 'animate-pulse' : ''} />
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>

      <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] font-medium tracking-wide text-slate-400/80">
        A IA pode cometer erros. Verifique informações importantes.
      </p>
    </div>
  );
}
