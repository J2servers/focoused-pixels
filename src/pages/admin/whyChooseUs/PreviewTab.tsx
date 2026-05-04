import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, Loader2, Save } from 'lucide-react';
import { LivePreview } from '@/components/admin/whychooseus/WhyChooseUsPreview';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

interface Props {
  config: WhyChooseUsConfig;
  isSaving: boolean;
  onSave: () => void;
}

export function PreviewTab({ config, isSaving, onSave }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Preview completo</CardTitle></CardHeader>
      <CardContent>
        <LivePreview config={config} />
        <div className="mt-4 flex gap-2">
          <Button className="admin-btn admin-btn-view" asChild>
            <Link to="/por-que-escolher" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Abrir página real</Link>
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="admin-btn admin-btn-save">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar e publicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
