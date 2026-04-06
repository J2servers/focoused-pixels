import { AdminLayout } from '@/components/admin';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminWorkflowsPage = () => {
  return (
    <AdminLayout title="Workflows de Automação" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="🔄 Guia de Workflows"
          description="Crie automações visuais com gatilhos, condições e ações."
          steps={[
            { title: "Criar workflow", description: "Monte fluxos arrastando nós: Gatilho → Condição → Ação." },
            { title: "Gatilhos", description: "Defina quando o workflow inicia: novo pedido, abandono de carrinho, cadastro, etc." },
            { title: "Ações", description: "Configure ações automáticas: enviar e-mail, WhatsApp, criar cupom, atualizar status." },
            { title: "Ativar/Pausar", description: "Controle quais workflows estão ativos sem excluí-los." },
            { title: "Histórico", description: "Veja quantas vezes cada workflow foi executado e quando foi a última vez." },
          ]}
        />

      <VisualWorkflowBuilder />
      </div>
    </AdminLayout>
  );
};

export default AdminWorkflowsPage;
