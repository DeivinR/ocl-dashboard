import { SendHorizontal, Square } from 'lucide-react';
import { ComposerPrimitive, useAui, useAuiState } from '@assistant-ui/react';

export function ChatComposer() {
  const isRunning = useAuiState((s) => s.thread).isRunning;
  const composerText = useAuiState((s) => s.composer.text);
  const hasText = composerText.trim().length > 0;
  const aui = useAui();

  return (
    <div className="px-4 py-4">
      <ComposerPrimitive.Root className="group mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-slate-200 transition-all duration-200 ease-in-out focus-within:shadow-lg focus-within:shadow-ocl-primary/5 focus-within:ring-2 focus-within:ring-ocl-primary/40">
        <ComposerPrimitive.Input
          placeholder="Pergunte sobre honorários, performance ou métricas…"
          className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
          rows={1}
        />

        {isRunning && (
          <button
            type="button"
            onClick={() => aui.thread().cancelRun()}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition-all duration-200 hover:bg-red-500 hover:shadow-md hover:shadow-red-200 active:scale-90"
          >
            <span className="absolute inset-0 animate-ping rounded-xl bg-slate-400 opacity-20" />
            <Square size={12} strokeWidth={4} fill="currentColor" className="relative z-10" />
          </button>
        )}
        {!isRunning && hasText && (
          <ComposerPrimitive.Send className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocl-primary text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-ocl-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 disabled:grayscale">
            <SendHorizontal size={18} strokeWidth={2.5} />
          </ComposerPrimitive.Send>
        )}
      </ComposerPrimitive.Root>

      <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] font-medium tracking-wide text-slate-400/80">
        A IA pode cometer erros. Verifique informações importantes.
      </p>
    </div>
  );
}
