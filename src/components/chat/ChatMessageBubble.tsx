import { Bot } from 'lucide-react';
import { useAuiState } from '@assistant-ui/react';
import { Markdown } from './Markdown';
import { TypingDots } from './TypingDots';

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return content
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function UserBubble({ text }: Readonly<{ text: string }>) {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 py-2">
      <div className="flex max-w-[85%] flex-col items-end">
        <div className="rounded-full rounded-tr-sm bg-ocl-primary px-4 py-2.5 text-white shadow-sm transition-all">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ text, isRunning }: Readonly<{ text: string; isRunning: boolean }>) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-start gap-3 px-4 py-3">
      <div className="mt-1 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocl-primary to-ocl-secondary text-white shadow-sm ring-2 ring-white">
          <Bot size={16} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex max-w-[85%] flex-col">
        <div className="rounded-full rounded-tl-sm bg-white px-5 py-3 shadow-sm ring-1 ring-slate-100 transition-all">
          {isRunning && text === '' ? (
            <div className="py-1">
              <TypingDots />
            </div>
          ) : (
            <div className="prose-sm prose-slate max-w-none text-slate-800">
              <Markdown text={text} />
              {isRunning && (
                <div className="mt-4 flex justify-start border-t border-slate-50 pt-2">
                  <TypingDots />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageBubble() {
  const message = useAuiState((s) => s.message);
  const text = extractText(message.content);
  const isRunning = message.status?.type === 'running';

  if (message.role === 'user') {
    return <UserBubble text={text} />;
  }

  return <AssistantBubble text={text} isRunning={!!isRunning} />;
}
