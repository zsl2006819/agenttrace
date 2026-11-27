'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import type { ComponentProps } from 'react';

type CodeComponentProps = ComponentProps<'code'>;

const components = {
  code: (props: CodeComponentProps) => {
    const { children, className } = props;
    const language = className?.replace('language-', '') || 'typescript';
    const code = typeof children === 'string' ? children : '';
    return <CodeBlock code={code} language={language} />;
  },
  pre: () => {
    return <div className="my-4" />;
  },
};

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}