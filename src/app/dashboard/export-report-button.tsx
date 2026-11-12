'use client';

import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AuditEvent {
  id: string;
  tenant_id: string;
  agent_id: string;
  session_id: string;
  sequence: number;
  tool_name: string;
  input_hash?: string | null;
  output_hash?: string | null;
  error_code?: string | null;
  human_override: boolean;
  created_at: string;
}

interface ExportReportButtonProps {
  records: AuditEvent[];
}

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export function ExportReportButton({ records }: ExportReportButtonProps) {
  const downloadJSONL = () => {
    window.location.href = '/api/report/jsonl';
  };

  const downloadPDF = () => {
    if (records.length === 0) {
      alert('暂无数据可导出');
      return;
    }

    const doc = new jsPDF('landscape');
    
    // 设置中文字体 - 使用浏览器自带的字体
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('AgentTrace 合规审计报告', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    const headers = [
      'Event ID',
      '时间',
      'Agent ID',
      'Tool Name',
      'Sequence',
      'Status',
    ];

    const data = records.map((record) => [
      record.id.substring(0, 8) + '...',
      formatTime(record.created_at),
      record.agent_id,
      record.tool_name,
      record.sequence.toString(),
      record.human_override ? '人工覆盖' : '正常',
    ]);

    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 25,
      styles: {
        font: 'helvetica',
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { top: 25 },
    });

    // 添加免责声明
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      '免责声明：本报告由 AgentTrace 自动生成，仅供合规审计参考，不构成正式法律建议。' +
      '数据来源为 Supabase audit_events 表。所有记录均受防篡改哈希链保护，任何篡改均可被检测。',
      doc.internal.pageSize.getWidth() / 2,
      finalY,
      { align: 'center' }
    );

    doc.save('audit-report.pdf');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={downloadJSONL}>
        导出 JSONL
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPDF}>
        导出 PDF
      </Button>
    </div>
  );
}