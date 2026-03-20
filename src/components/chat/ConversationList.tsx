import { MessageSquarePlus, MessageCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import type { Conversation } from '../../types';
import { ConversationListSkeleton } from '../ui/Skeleton';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  } catch {
    return '';
  }
}

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (conversationId: string | null) => void;
  onDelete?: (conversationId: string) => void;
  creating?: boolean;
  deletingId?: string | null;
}

export function ConversationList({
  conversations,
  loading,
  error,
  selectedId,
  onSelect,
  onDelete,
  creating = false,
  deletingId = null,
}: Readonly<ConversationListProps>) {
  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="p-3">
        <button
          type="button"
          onClick={() => onSelect(null)}
          disabled={creating || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 hover:text-ocl-primary disabled:opacity-50"
        >
          <MessageSquarePlus size={18} className={creating ? 'animate-pulse' : ''} />
          <span>{creating ? 'Criando...' : 'Nova conversa'}</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
        {error && (
          <div className="m-2 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {loading ? (
          <ConversationListSkeleton />
        ) : (
          <ul className="space-y-1 pb-4">
            {!error && conversations.length === 0 ? (
              <div className="mt-8 text-center text-xs text-slate-400">Nenhuma conversa encontrada.</div>
            ) : (
              conversations.map((c) => {
                const title = c.title?.trim() || 'Nova conversa';
                const isSelected = selectedId === c.id;

                const isDeleting = deletingId === c.id;

                return (
                  <li key={c.id}>
                    <div
                      className={cn(
                        'group relative flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2.5 transition-all',
                        isSelected
                          ? 'bg-white shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
                      >
                        {isSelected && (
                          <div className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-ocl-primary" />
                        )}

                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <MessageCircle
                              size={14}
                              className={cn('flex-shrink-0', isSelected ? 'text-ocl-primary' : 'text-slate-400')}
                            />
                            <span
                              className={cn(
                                'truncate text-sm font-medium',
                                isSelected ? 'text-slate-900' : 'text-slate-500',
                              )}
                            >
                              {title}
                            </span>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-tighter text-slate-400">
                            {formatDate(c.updated_at)}
                          </span>
                        </div>
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          disabled={isDeleting}
                          aria-label="Excluir conversa"
                          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 opacity-0 transition-colors ${isDeleting && 'hover:text-red-600'} text-red-600 disabled:opacity-100 group-hover:opacity-100`}
                        >
                          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}
