import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'SimSun',
  fonts: [
    { src: 'C:\\Windows\\Fonts\\simsunb.ttf', fontWeight: 'normal' },
    { src: 'C:\\Windows\\Fonts\\simsunb.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  section: {
    margin: 40,
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'SimSun',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#999999',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#cccccc',
  },
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#cccccc',
    fontSize: 7,
    fontFamily: 'SimSun',
  },
  cellLast: {
    padding: 4,
    borderRightWidth: 0,
    fontSize: 7,
    fontFamily: 'SimSun',
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'SimSun',
  },
});

const HEADERS = [
  '系统ID',
  '模型版本',
  '时间戳',
  'Agent ID',
  '调用工具',
  '输入哈希',
  '输出哈希',
  '人工覆盖',
  '错误码',
];

interface AuditEventRow {
  id?: string;
  tenant_id?: string;
  agent_id?: string;
  session_id?: string;
  sequence?: number;
  tool_name?: string;
  input_hash?: string | null;
  output_hash?: string | null;
  error_code?: string | null;
  human_override?: boolean;
  created_at?: string;
}

/**
 * 构建合规审计报告 PDF 文档的 React 元素树（根为 <Document>）。
 * renderToBuffer 要求根元素为 <Document>，故在此直接构建并返回。
 */
export function buildReportPDF(events: AuditEventRow[]) {
  const headerCells = HEADERS.map((h, i) =>
    React.createElement(Text, {
      key: h,
      style: i === HEADERS.length - 1 ? styles.cellLast : styles.cell,
    }, h)
  );

  const rows = events.map((e, rowIdx) => {
    const values = [
      e.tenant_id ?? '-',
      'AgentTrace v1.0',
      e.created_at ?? '-',
      e.agent_id ?? '-',
      e.tool_name ?? '-',
      e.input_hash ?? '-',
      e.output_hash ?? '-',
      e.human_override ? '是' : '否',
      e.error_code ?? '-',
    ];
    return React.createElement(View, {
      key: e.id || `row-${rowIdx}`,
      style: styles.tableRow,
    }, ...values.map((v, i) =>
      React.createElement(Text, {
        key: i,
        style: i === values.length - 1 ? styles.cellLast : styles.cell,
      }, String(v))
    ));
  });

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4' },
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.title }, 'AgentTrace 合规审计报告'),
        React.createElement(View, { style: styles.tableHeader }, ...headerCells),
        ...rows,
        React.createElement(Text, { style: styles.disclaimer },
          '免责声明：本报告由 AgentTrace 自动生成，仅供合规审计参考，不构成正式法律建议。' +
          '数据来源为 Supabase audit_events 表。所有记录均受防篡改哈希链保护，任何篡改均可被检测。')
      )
    )
  );
}