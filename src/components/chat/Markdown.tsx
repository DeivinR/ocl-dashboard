import {
  Component,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MdProps<T extends HTMLElement = HTMLElement> = HTMLAttributes<T> & {
  node?: unknown;
  children?: ReactNode;
};

function MdLink({ node: _n, children, ...props }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }>) {
  return (
    <a {...props} target="_blank" rel="noreferrer" className="font-medium text-ocl-primary underline underline-offset-2 hover:text-ocl-dark">
      {children}
    </a>
  );
}

function MdP({ node: _n, children, ...p }: MdProps<HTMLParagraphElement>) {
  return <p {...p} className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{children}</p>;
}

function MdUl({ node: _n, children, ...p }: MdProps<HTMLUListElement>) {
  return <ul {...p} className="ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-800">{children}</ul>;
}

function MdOl({ node: _n, children, ...p }: MdProps<HTMLOListElement>) {
  return <ol {...p} className="ml-5 list-decimal space-y-1 text-sm leading-relaxed text-slate-800">{children}</ol>;
}

function MdLi({ node: _n, children, ...p }: MdProps<HTMLLIElement>) {
  return <li {...p} className="text-sm leading-relaxed text-slate-800">{children}</li>;
}

function MdH1({ node: _n, children, ...p }: MdProps<HTMLHeadingElement>) {
  return <h3 {...p} className="mb-2 text-base font-semibold text-slate-900">{children}</h3>;
}

function MdH2({ node: _n, children, ...p }: MdProps<HTMLHeadingElement>) {
  return <h4 {...p} className="mb-2 text-sm font-semibold text-slate-900">{children}</h4>;
}

function MdH3({ node: _n, children, ...p }: MdProps<HTMLHeadingElement>) {
  return <h5 {...p} className="mb-1 text-sm font-semibold text-slate-900">{children}</h5>;
}

function MdBlockquote({ node: _n, children, ...p }: MdProps<HTMLQuoteElement>) {
  return <blockquote {...p} className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-700">{children}</blockquote>;
}

function MdCode({ node: _n, children, ...p }: MdProps) {
  return <code {...p} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px] text-slate-900">{children}</code>;
}

function MdPre({ node: _n, children, ...p }: MdProps<HTMLPreElement>) {
  return <pre {...p} className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-slate-50">{children}</pre>;
}

function MdHr({ node: _n, ...p }: Readonly<Omit<MdProps<HTMLHRElement>, 'children'>>) {
  return <hr {...p} className="my-3 border-slate-200" />;
}

const COMPONENTS = {
  a: MdLink,
  p: MdP,
  ul: MdUl,
  ol: MdOl,
  li: MdLi,
  h1: MdH1,
  h2: MdH2,
  h3: MdH3,
  blockquote: MdBlockquote,
  code: MdCode,
  pre: MdPre,
  hr: MdHr,
} as const;

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
