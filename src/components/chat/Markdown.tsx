import {
  Component,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MdProps<T extends HTMLElement = HTMLElement> = HTMLAttributes<T> &
  ExtraProps & {
    children?: ReactNode;
  };

function isSafeHref(rawHref: string): boolean {
  const href = rawHref.trim();
  if (href === '' || href.startsWith('#')) return true;
  if (href.startsWith('/')) return true;
  if (href.startsWith('./') || href.startsWith('../')) return true;

  try {
    const url = new URL(href);
    const protocol = url.protocol.toLowerCase();
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
  } catch {
    return false;
  }
}

function isExternalHref(rawHref: string): boolean {
  const href = rawHref.trim();
  try {
    const url = new URL(href);
    return url.origin !== globalThis.location?.origin;
  } catch {
    return false;
  }
}

function MdLink({
  node: _n,
  children,
  ...props
}: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps>) {
  const href = typeof props.href === 'string' ? props.href : undefined;
  const safeHref = href && isSafeHref(href) ? href : undefined;
  const external = safeHref ? isExternalHref(safeHref) : false;

  return (
    <a
      {...props}
      href={safeHref}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
    >
      {children}
    </a>
  );
}

function MdP({ node: _n, children, ...p }: MdProps<HTMLParagraphElement>) {
  return (
    <p {...p} className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
      {children}
    </p>
  );
}

function MdUl({ node: _n, children, ...p }: MdProps<HTMLUListElement>) {
  return (
    <ul {...p} className="mb-4 ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-800 [&_p]:mb-0">
      {children}
    </ul>
  );
}

function MdOl({ node: _n, children, ...p }: MdProps<HTMLOListElement>) {
  return (
    <ol {...p} className="mb-4 ml-5 list-decimal space-y-1 text-sm leading-relaxed text-slate-800">
      {children}
    </ol>
  );
}

function MdLi({ node: _n, children, ...p }: MdProps<HTMLLIElement>) {
  return (
    <li {...p} className="text-sm leading-relaxed text-slate-800">
      {children}
    </li>
  );
}

function MdH1({ node: _n, children, ...p }: MdProps<HTMLHeadingElement>) {
  return (
    <h3 {...p} className="mb-3 mt-6 text-base font-bold text-slate-900">
      {children}
    </h3>
  );
}

function MdH2({ node: _n, children, ...p }: MdProps<HTMLHeadingElement>) {
  return (
    <h4 {...p} className="mb-2 mt-5 text-sm font-bold text-slate-900">
      {children}
    </h4>
  );
}

function MdBlockquote({ node: _n, children, ...p }: MdProps<HTMLQuoteElement>) {
  return (
    <blockquote {...p} className="my-4 border-l-4 border-slate-200 pl-4 text-sm italic text-slate-600">
      {children}
    </blockquote>
  );
}

function MdTable({ children }: MdProps<HTMLTableElement>) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-max border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

function MdThead({ children }: MdProps<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-slate-900">{children}</thead>;
}

function MdTh({ children }: MdProps<HTMLTableCellElement>) {
  return <th className="border-b border-slate-200 px-4 py-2.5 font-semibold">{children}</th>;
}

function MdTd({ children }: MdProps<HTMLTableCellElement>) {
  return <td className="border-b border-slate-100 px-4 py-2 text-slate-700">{children}</td>;
}

function MdCode({ node: _n, children, ...p }: MdProps) {
  return (
    <code {...p} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] font-medium text-slate-900">
      {children}
    </code>
  );
}

function MdPre({ node: _n, children, ...p }: MdProps<HTMLPreElement>) {
  return (
    <pre
      {...p}
      className="my-5 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-slate-200 shadow-sm [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
    >
      {children}
    </pre>
  );
}

function MdHr({ node: _n, ...p }: Readonly<Omit<MdProps<HTMLHRElement>, 'children'>>) {
  return <hr {...p} className="my-6 border-slate-200" />;
}

const COMPONENTS = {
  a: MdLink,
  p: MdP,
  ul: MdUl,
  ol: MdOl,
  li: MdLi,
  h1: MdH1,
  h2: MdH2,
  blockquote: MdBlockquote,
  table: MdTable,
  thead: MdThead,
  th: MdTh,
  td: MdTd,
  code: MdCode,
  pre: MdPre,
  hr: MdHr,
};

class MarkdownErrorBoundary extends Component<
  Readonly<{ fallbackText: string; children: ReactNode }>,
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{this.props.fallbackText}</p>;
    }
    return this.props.children;
  }
}

export function Markdown({ text }: Readonly<{ text: string }>) {
  return (
    <MarkdownErrorBoundary fallbackText={text}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {text}
      </ReactMarkdown>
    </MarkdownErrorBoundary>
  );
}
