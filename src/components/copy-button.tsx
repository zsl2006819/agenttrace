'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
  variant = 'outline',
  size = 'sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默失败
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{label}</span>
        </>
      )}
    </Button>
  );
}