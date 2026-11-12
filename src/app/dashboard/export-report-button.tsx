'use client';

import { Button } from '@/components/ui/button';

export function ExportReportButton() {
  const download = (format: 'jsonl' | 'pdf') => {
    window.location.href = `/api/report/${format}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => download('jsonl')}>
        导出 JSONL
      </Button>
      <Button variant="outline" size="sm" onClick={() => download('pdf')}>
        导出 PDF
      </Button>
    </div>
  );
}