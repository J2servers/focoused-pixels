import { AdminLayout } from '@/components/admin';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminMediaPage = () => {
  return (
    <AdminLayout title="Biblioteca de Mídia" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="📁 Guia da Biblioteca de Mídia"
          description="Gerencie todas as imagens e arquivos enviados para a loja."
          steps={[
            { title: "Upload de arquivos", description: "Arraste arquivos ou clique para fazer upload de imagens, PDFs e outros arquivos." },
            { title: "Organizar", description: "Use pastas e tags para manter seus arquivos organizados." },
            { title: "Copiar URL", description: "Clique em uma imagem para copiar a URL pública e usar em produtos ou banners." },
            { title: "Excluir arquivos", description: "Selecione arquivos e exclua os que não são mais necessários para liberar espaço." },
          ]}
        />

      <MediaLibrary />
      </div>
    </AdminLayout>
  );
};

export default AdminMediaPage;

