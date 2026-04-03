import { AdminLayout } from '@/components/admin';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';

const AdminWorkflowsPage = () => {
  return (
    <AdminLayout title="Workflows de Automação" requireEditor>
      <VisualWorkflowBuilder />
    </AdminLayout>
  );
};

export default AdminWorkflowsPage;
