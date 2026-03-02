import { Bot, User } from 'lucide-react';
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
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-2 pt-4">
      <div className="flex max-w-[80%] items-end gap-2">
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-2xl rounded-br-sm bg-ocl-primary px-4 py-3 text-white shadow-md">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocl-secondary text-white shadow-sm">
            <User size={15} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ text, isRunning }: Readonly<{ text: string; isRunning: boolean }>) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 pb-2 pt-4">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocl-primary to-ocl-secondary text-white shadow-sm">
          <Bot size={15} />
        </div>
      </div>
      <div className="flex max-w-[80%] flex-col gap-1">
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-md ring-1 ring-slate-200">
          {isRunning && text === '' ? (
            <TypingDots />
          ) : (
            <div className="text-slate-800">
              <Markdown text={text} />
              {isRunning && (
                <div className="mt-2">
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
