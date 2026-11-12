import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { buildReportPDF } from './document';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = getSupabaseServer();
  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pdfElement = buildReportPDF(events ?? []);
  const pdfBuffer = await renderToBuffer(pdfElement);

  return new NextResponse(Uint8Array.from(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="audit-report.pdf"',
    },
  });
}