import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToHTMLReport } from '@/lib/export-utils';

interface ExportColumn {
  key: string;
  header: string;
}

interface ExportButtonsProps {
  data: Record<string, any>[];
  columns: ExportColumn[];
  filename: string;
  title: string;
}

export const ExportButtons = ({ data, columns, filename, title }: ExportButtonsProps) => {
  if (!data.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToCSV(data, filename, columns)} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToHTMLReport(title, data, columns, filename)} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Imprimir / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
