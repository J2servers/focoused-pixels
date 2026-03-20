import { AdminLayout } from '@/components/admin';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

const AdminMediaPage = () => {
  return (
    <AdminLayout title="Biblioteca de Mídia" requireEditor>
      <MediaLibrary />
    </AdminLayout>
  );
};

export default AdminMediaPage;
