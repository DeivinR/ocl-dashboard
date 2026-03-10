import { Sparkles } from 'lucide-react';
import { useChatActions } from './SocketChatRuntime';

const SUGGESTIONS = ['Repasse de cash no mês', 'Batimento de meta por região', 'Retomadas realizadas no mês'];

interface EmptyStateProps {
  onSuggest?: (text: string) => void;
}

export function EmptyState({ onSuggest: onSuggestProp }: Readonly<EmptyStateProps>) {
  const actions = useChatActions();
  const onSuggest = onSuggestProp ?? actions?.sendMessage ?? (() => {});

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ocl-primary to-ocl-secondary text-white shadow-lg">
          <Sparkles size={30} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Assistente OCL</h2>
          <p className="mt-1 text-sm text-slate-500">Faça uma pergunta ou escolha uma sugestão abaixo</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-ocl-primary/30 hover:bg-ocl-primary/5 hover:text-ocl-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
