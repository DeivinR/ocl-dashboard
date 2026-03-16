const DOTS = [0, 1, 2];

export function TypingDots() {
  return (
    <span className="inline-flex items-end gap-[3px]">
      {DOTS.map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
          style={{ animation: `aui-typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}
