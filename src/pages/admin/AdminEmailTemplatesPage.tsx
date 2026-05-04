import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';
import {
  DeleteTemplateDialog,
  EmailEditorDialog,
  PreviewDialog,
  TestSendDialog,
  WhatsAppEditorDialog,
} from '@/components/admin/templates/TemplateDialogs';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplatesHeader } from './email-templates/TemplatesHeader';
import { PageTabBar, type PageTab } from './email-templates/PageTabBar';
import { MetricsAndCoverage } from './email-templates/MetricsAndCoverage';
import {
  TemplatesToolbar,
  type ChannelTab,
  type FilterStatus,
  type ViewMode,
} from './email-templates/TemplatesToolbar';
import {
  EmailTemplatesSection,
  WhatsAppTemplatesSection,
} from './email-templates/TemplatesSections';
import { useTemplatesPageState } from './email-templates/useTemplatesPageState';

const GUIDE_STEPS = [
  { title: 'Criar template', description: "Clique em 'Novo Template' e escolha entre e-mail ou WhatsApp." },
  { title: 'Variáveis dinâmicas', description: 'Use variáveis como {{nome}}, {{pedido}} para personalizar mensagens automaticamente.' },
  { title: 'Pré-visualizar', description: 'Clique no ícone de olho para ver como o template ficará antes de enviar.' },
  { title: 'Testar envio', description: 'Envie uma mensagem de teste para validar formatação e conteúdo.' },
  { title: 'Workflows', description: "Na aba 'Workflows', crie automações visuais com gatilhos e ações encadeadas." },
];

const AdminEmailTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('templates');
  const [channelTab, setChannelTab] = useState<ChannelTab>('all');

  const tpl = useTemplates();
  const state = useTemplatesPageState(tpl);

  const showEmail = channelTab === 'all' || channelTab === 'email';
  const showWhats = channelTab === 'all' || channelTab === 'whatsapp';

  return (
    <AdminLayout title="Comunicação & Automação" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="📧 Guia de Comunicação & Automação"
          description="Gerencie templates de e-mail, WhatsApp e workflows automatizados."
          steps={GUIDE_STEPS}
        />

        <TemplatesHeader onExport={tpl.exportTemplates} onImport={tpl.importTemplates} />

        <PageTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          templatesActiveCount={tpl.metrics.emailActive + tpl.metrics.whatsActive}
        />

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <MetricsAndCoverage
              metrics={tpl.metrics}
              emailTemplates={tpl.emailTemplates}
              whatsTemplates={tpl.whatsTemplates}
              installSuggestedEmails={tpl.installSuggestedEmails}
              installSuggestedWhats={tpl.installSuggestedWhats}
            />

            <TemplatesToolbar
              searchQuery={tpl.searchQuery}
              setSearchQuery={tpl.setSearchQuery}
              channelTab={channelTab}
              setChannelTab={setChannelTab}
              filterStatus={tpl.filterStatus as FilterStatus}
              setFilterStatus={(v) => tpl.setFilterStatus(v)}
              sortAsc={tpl.sortAsc}
              setSortAsc={tpl.setSortAsc}
              viewMode={tpl.viewMode as ViewMode}
              setViewMode={(v) => tpl.setViewMode(v)}
              onNewEmail={() => state.setEditEmail({ name: '', subject: '', body: '', variables: [], is_active: true })}
              onNewWhats={() => state.setEditWhats({ name: '', category: 'transacional', content: '', variables: [], is_active: true })}
              selectedEmailsCount={state.selectedEmails.size}
              selectedWhatsCount={state.selectedWhats.size}
              onBulk={state.handleBulk}
            />

            {showEmail && (
              <EmailTemplatesSection
                templates={tpl.filteredEmails}
                viewMode={tpl.viewMode as ViewMode}
                selected={state.selectedEmails}
                templateStats={tpl.templateStats}
                workflowLinks={tpl.workflowLinks}
                collapsed={state.emailCollapsed}
                setCollapsed={state.setEmailCollapsed}
                loading={tpl.loading}
                onInstallSuggested={tpl.installSuggestedEmails}
                onSelect={(id) => state.toggleSelect('email', id)}
                onPreview={(t) => state.setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}
                onEdit={(t) => state.setEditEmail(t)}
                onTestSend={(t) => state.setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })}
                onDuplicate={(t) => state.setEditEmail({ name: `${t.name} (cópia)`, subject: t.subject, body: t.body, variables: t.variables, is_active: false })}
                onCloneToWhats={(t) => state.setEditWhats(tpl.cloneEmailToWhats(t))}
                onDelete={(t) => state.setDeleteTarget({ channel: 'email', id: t.id, name: t.name })}
                onToggle={tpl.toggleTemplate}
              />
            )}

            {showWhats && (
              <WhatsAppTemplatesSection
                templates={tpl.filteredWhats}
                viewMode={tpl.viewMode as ViewMode}
                selected={state.selectedWhats}
                templateStats={tpl.templateStats}
                workflowLinks={tpl.workflowLinks}
                collapsed={state.whatsCollapsed}
                setCollapsed={state.setWhatsCollapsed}
                loading={tpl.loading}
                onInstallSuggested={tpl.installSuggestedWhats}
                onSelect={(id) => state.toggleSelect('whatsapp', id)}
                onPreview={(t) => state.setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}
                onEdit={(t) => state.setEditWhats(t)}
                onTestSend={(t) => state.setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })}
                onDuplicate={(t) => state.setEditWhats({ name: `${t.name} (cópia)`, category: t.category, content: t.content, variables: t.variables, is_active: false })}
                onCloneToEmail={(t) => state.setEditEmail(tpl.cloneWhatsToEmail(t))}
                onDelete={(t) => state.setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })}
                onToggle={tpl.toggleTemplate}
              />
            )}
          </div>
        )}

        {activeTab === 'workflows' && <VisualWorkflowBuilder />}
      </div>

      <EmailEditorDialog editEmail={state.editEmail} setEditEmail={state.setEditEmail} onSave={state.handleSaveEmail} />
      <WhatsAppEditorDialog editWhats={state.editWhats} setEditWhats={state.setEditWhats} onSave={state.handleSaveWhats} />
      <PreviewDialog preview={state.preview} setPreview={() => state.setPreview(null)} />
      <DeleteTemplateDialog deleteTarget={state.deleteTarget} setDeleteTarget={() => state.setDeleteTarget(null)} onConfirm={state.handleDelete} />
      <TestSendDialog testSend={state.testSend} setTestSend={() => state.setTestSend(null)} onSend={state.handleTestSend} isSending={state.testSending} />
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
