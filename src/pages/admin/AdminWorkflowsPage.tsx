import { AdminLayout } from '@/components/admin';
import WorkflowBuilder from '@/components/admin/workflows/WorkflowBuilder';

const AdminWorkflowsPage = () => {
  return (
    <AdminLayout title="Workflows de Automação" requireEditor>
      <WorkflowBuilder />
    </AdminLayout>
  );
};

export default AdminWorkflowsPage;
