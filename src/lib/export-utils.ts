import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Export data as CSV file
 */
export function exportToCSV(data: Record<string, any>[], filename: string, columns: { key: string; header: string }[]) {
  const headers = columns.map(c => c.header).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const str = val == null ? '' : String(val);
      // Escape CSV special chars
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  
  const csv = '\uFEFF' + [headers, ...rows].join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

/**
 * Export data as JSON (useful as intermediate for other formats)
 */
export function exportToJSON(data: Record<string, any>[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`);
}

/**
 * Generate and download a simple PDF-like HTML report
 */
export function exportToHTMLReport(
  title: string,
  data: Record<string, any>[],
  columns: { key: string; header: string }[],
  filename: string
) {
  const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  
  const tableRows = data.map(row =>
    `<tr>${columns.map(c => `<td style="border:1px solid #ddd;padding:6px 10px;font-size:12px;">${row[c.key] ?? ''}</td>`).join('')}</tr>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { color: #888; font-size: 12px; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th { background: #f5f5f5; border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-size: 12px; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 30px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Gerado em ${now} · ${data.length} registros</p>
  <table>
    <thead><tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Relatório gerado automaticamente pelo sistema administrativo.</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

