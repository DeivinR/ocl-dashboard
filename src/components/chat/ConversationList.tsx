import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, MoreVertical, Trash2, Loader2, Pencil, CirclePlus, Ellipsis } from 'lucide-react';
import type { Conversation } from '../../interfaces/conversation';
import { ConversationListSkeleton } from '../ui/Skeleton';
import { RenameConversationDialog } from './RenameConversationDialog';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (conversationId: string | null) => void;
  onDelete?: (conversationId: string) => void;
  onRename?: (conversationId: string, title: string) => void;
  creating?: boolean;
  deletingId?: string | null;
  embedded?: boolean;
}

export function ConversationList({
  conversations,
  loading,
  error,
  selectedId,
  onSelect,
  onDelete,
  onRename,
  creating = false,
  deletingId = null,
  embedded = false,
}: Readonly<ConversationListProps>) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; currentTitle: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!openMenuId) {
      setMenuPosition(null);
      return;
    }
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setMenuPosition({ top: rect.bottom + 4, left: rect.right - 140 });
    };
    updatePosition();
    const scrollEl = listScrollRef.current;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    scrollEl?.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      scrollEl?.removeEventListener('scroll', updatePosition);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuId]);

  return (
    <aside
      className={cn(
        'flex flex-col',
        embedded ? 'min-h-0 flex-1' : 'w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/50',
      )}
    >
      <div className="p-3">
        <button
          type="button"
          onClick={() => onSelect(null)}
          disabled={creating || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 hover:text-ocl-primary disabled:opacity-50"
        >
          <CirclePlus size={18} className={creating ? 'animate-pulse' : ''} />
          <span>{creating ? 'Criando...' : 'Nova conversa'}</span>
        </button>
      </div>

      <div ref={listScrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
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

                return (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        'group relative flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2.5 transition-all',
                        isSelected
                          ? 'bg-white shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                        {isSelected && (
                          <div className="absolute bottom-2 left-0 top-0 h-full w-1 rounded-s-full bg-ocl-primary" />
                        )}
                        <div className="flex w-full items-center justify-between gap-2">
                          <span
                            className={cn(
                              'truncate text-sm font-normal',
                              isSelected ? 'text-slate-900' : 'text-slate-500',
                            )}
                          >
                            {title}
                          </span>
                        </div>
                      </div>
                      {(onDelete || onRename) && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2">
                          <button
                            ref={openMenuId === c.id ? triggerRef : undefined}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((id) => (id === c.id ? null : c.id));
                            }}
                            aria-label="Opções"
                            className={cn(
                              'rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700',
                              openMenuId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                            )}
                          >
                            <Ellipsis size={20} />
                          </button>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {openMenuId &&
        menuPosition &&
        (() => {
          const c = conversations.find((x) => x.id === openMenuId);
          if (!c) return null;
          const title = c.title?.trim() || 'Nova conversa';
          const isDeleting = deletingId === c.id;
          return createPortal(
            <div
              ref={menuRef}
              role="menu"
              tabIndex={0}
              className="fixed z-50 min-w-[140px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
              style={{ top: menuPosition.top, left: menuPosition.left }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setOpenMenuId(null)}
            >
              {onRename && (
                <button
                  type="button"
                  onClick={() => {
                    setRenameTarget({ id: c.id, currentTitle: title });
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Pencil size={14} />
                  Mudar nome
                </button>
              )}
              <div className="mx-auto my-1.5 h-px w-11/12 bg-slate-200" />
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(c.id);
                    setOpenMenuId(null);
                  }}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Excluir
                </button>
              )}
            </div>,
            document.body,
          );
        })()}

      <RenameConversationDialog
        isOpen={!!renameTarget}
        initialTitle={renameTarget?.currentTitle ?? ''}
        onClose={() => setRenameTarget(null)}
        onSubmit={(newTitle) => {
          if (renameTarget) onRename?.(renameTarget.id, newTitle);
          setRenameTarget(null);
        }}
      />
    </aside>
  );
}
