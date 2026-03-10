import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface RenameConversationDialogProps {
  isOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function RenameConversationDialog({
  isOpen,
  initialTitle,
  onClose,
  onSubmit,
}: Readonly<RenameConversationDialogProps>) {
  const [value, setValue] = useState(initialTitle);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialTitle);
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, initialTitle]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  };

  if (!isOpen) return null;

  const dialog = (
    <dialog
      ref={dialogRef}
      className="mx-auto max-w-sm rounded-xl border-0 bg-white p-4 shadow-xl backdrop:bg-black/40"
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="rename-dialog-title"
    >
      <h3 id="rename-dialog-title" className="text-sm font-semibold text-slate-900">
        Mudar nome da conversa
      </h3>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder="Nome da conversa"
        className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-ocl-primary/40"
        autoFocus
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="rounded-lg bg-ocl-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-ocl-dark disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </dialog>
  );

  return createPortal(dialog, document.body);
}
