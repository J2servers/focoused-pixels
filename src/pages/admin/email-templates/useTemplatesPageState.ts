import { useCallback, useEffect, useState } from 'react';
import type {
  Channel,
  EmailTemplate,
  WhatsAppTemplate,
} from '@/components/admin/templates/TemplateConstants';
import type { useTemplates } from '@/hooks/useTemplates';

type TemplatesApi = ReturnType<typeof useTemplates>;

export interface PreviewState {
  channel: Channel;
  title: string;
  content: string;
  subject?: string;
}

export interface DeleteTargetState {
  channel: Channel;
  id: string;
  name: string;
}

export interface TestSendState {
  channel: Channel;
  templateId: string;
  templateName: string;
}

/**
 * Centralises every dialog/state interaction between the page and the
 * template hook so the page itself stays presentational.
 */
export function useTemplatesPageState(tpl: TemplatesApi) {
  const [editEmail, setEditEmail] = useState<Partial<EmailTemplate> | null>(null);
  const [editWhats, setEditWhats] = useState<Partial<WhatsAppTemplate> | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetState | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedWhats, setSelectedWhats] = useState<Set<string>>(new Set());
  const [testSend, setTestSend] = useState<TestSendState | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [emailCollapsed, setEmailCollapsed] = useState(false);
  const [whatsCollapsed, setWhatsCollapsed] = useState(false);

  const handleSaveEmail = useCallback(async () => {
    if (!editEmail) return;
    const ok = await tpl.saveEmail(editEmail);
    if (ok) setEditEmail(null);
  }, [editEmail, tpl]);

  const handleSaveWhats = useCallback(async () => {
    if (!editWhats) return;
    const ok = await tpl.saveWhats(editWhats);
    if (ok) setEditWhats(null);
  }, [editWhats, tpl]);

  const handleTestSend = useCallback(async (to: string) => {
    if (!testSend) return;
    setTestSending(true);
    const ok = await tpl.sendTest(testSend.channel, testSend.templateId, to);
    setTestSending(false);
    if (ok) setTestSend(null);
  }, [testSend, tpl]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await tpl.deleteTemplate(deleteTarget.channel, deleteTarget.id, deleteTarget.name);
    setDeleteTarget(null);
  }, [deleteTarget, tpl]);

  const handleBulk = useCallback(async (
    channel: Channel,
    action: 'activate' | 'deactivate' | 'delete',
  ) => {
    const ids = channel === 'email' ? [...selectedEmails] : [...selectedWhats];
    await tpl.bulkAction(channel, ids, action);
    if (channel === 'email') setSelectedEmails(new Set());
    else setSelectedWhats(new Set());
  }, [selectedEmails, selectedWhats, tpl]);

  const toggleSelect = useCallback((channel: Channel, id: string) => {
    const updater = (prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    };
    if (channel === 'email') setSelectedEmails(updater);
    else setSelectedWhats(updater);
  }, []);

  // Cmd/Ctrl + S triggers the active dialog save.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editEmail) void handleSaveEmail();
        if (editWhats) void handleSaveWhats();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editEmail, editWhats, handleSaveEmail, handleSaveWhats]);

  return {
    editEmail, setEditEmail,
    editWhats, setEditWhats,
    preview, setPreview,
    deleteTarget, setDeleteTarget,
    selectedEmails, selectedWhats,
    testSend, setTestSend, testSending,
    emailCollapsed, setEmailCollapsed,
    whatsCollapsed, setWhatsCollapsed,
    handleSaveEmail, handleSaveWhats, handleTestSend, handleDelete,
    handleBulk, toggleSelect,
  };
}
