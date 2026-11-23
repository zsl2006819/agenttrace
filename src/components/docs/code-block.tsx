'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

function tokenize(code: string, language: string): JSX.Element {
  const rules: [RegExp, string][] = [
    [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|async|await|import|export|from|class|new|this|typeof|instanceof|in|of|void|delete)\b/g, 'text-purple-400'],
    [/\b(true|false|null|undefined)\b/g, 'text-orange-400'],
    [/".*?"|'.*?'|`.*?`/g, 'text-green-400'],
    [/\/\/.*|\/\*[\s\S]*?\*\//g, 'text-gray-500 italic'],
    [/\b\d+\.?\d*\b/g, 'text-pink-400'],
    [/\b(String|Number|Boolean|Object|Array|Promise|Map|Set|Date|RegExp|Error|JSON|Math|console|process|window|document|localStorage|fetch|Response|Request|Headers)\b/g, 'text-blue-400'],
    [/\b([A-Z][A-Za-z0-9_]*)\b/g, 'text-yellow-300'],
    [/([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, 'text-cyan-400'],
  ];

  let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  rules.forEach(([regex, cls]) => {
    html = html.replace(regex, (m) => `<span class="${cls}">${m}</span>`);
  });

  return (
    <>
      {html.split('\n').map((line, i) => (
        <div key={i} className="flex">
          <div dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ))}
    </>
  );
}

export function CodeBlock({ code, language = 'typescript', showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900 shadow-sm overflow-hidden mb-8 dark:border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-950/80">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500/80" />
          <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
          <span className="h-2 w-2 rounded-full bg-green-500/80" />
          <span className="ml-2.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="text-gray-400 hover:text-white hover:bg-zinc-800"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className={cn('p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-gray-300', showLineNumbers ? 'pl-12' : '')}>
        <code className="block">
          {tokenize(code, language)}
        </code>
      </pre>
    </div>
  );
}