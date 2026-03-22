import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Plus, Trash2, Play, Pause, Clock, Mail, MessageSquare,
  ArrowDown, Zap, ShoppingCart, CreditCard, Package, Star,
  ChevronDown, ChevronUp, Save, Copy, GripVertical,
} from 'lucide-react';

/* ─── types ─── */
export interface WorkflowStep {
  id: string;
  type: 'send_email' | 'send_whatsapp' | 'delay';
  template_id?: string;
  template_name?: string;
  channel?: 'email' | 'whatsapp';
  delay_minutes?: number;
  delay_unit?: 'minutes' | 'hours' | 'days';
  delay_value?: number;
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_delay_minutes: number;
  steps: WorkflowStep[];
  is_active: boolean;
  run_count?: number;
  last_run_at?: string;
}

interface TemplateLite { id: string; name: string; }

const TRIGGER_EVENTS = [
  { value: 'abandoned_cart', label: 'Carrinho abandonado', icon: ShoppingCart, color: 'text-orange-500' },
  { value: 'order_created', label: 'Pedido criado', icon: Package, color: 'text-blue-500' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', icon: CreditCard, color: 'text-green-500' },
  { value: 'boleto_generated', label: 'Boleto gerado', icon: CreditCard, color: 'text-yellow-500' },
  { value: 'pix_generated', label: 'PIX gerado', icon: Zap, color: 'text-purple-500' },
  { value: 'post_delivery', label: 'Pós-entrega', icon: Star, color: 'text-pink-500' },
];

const uid = () => crypto.randomUUID().slice(0, 8);

const delayToMinutes = (value: number, unit: string) => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

const minutesToDisplay = (m: number) => {
  if (m >= 1440 && m % 1440 === 0) return { value: m / 1440, unit: 'days' as const };
  if (m >= 60 && m % 60 === 0) return { value: m / 60, unit: 'hours' as const };
  return { value: m, unit: 'minutes' as const };
};

const unitLabel = (u: string, v: number) => {
  const map: Record<string, [string, string]> = { minutes: ['minuto', 'minutos'], hours: ['hora', 'horas'], days: ['dia', 'dias'] };
  return v === 1 ? map[u][0] : map[u][1];
};

interface WorkflowBuilderProps {
  presetToImport?: { name: string; description?: string; trigger_event: string; steps: any[] } | null;
  onPresetImported?: () => void;
}

/* ─── component ─── */
export default function WorkflowBuilder({ presetToImport, onPresetImported }: WorkflowBuilderProps = {}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<TemplateLite[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<TemplateLite[]>([]);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [{ data: wf }, { data: et }, { data: wt }] = await Promise.all([
      supabase.from('automation_workflows').select('*').order('created_at', { ascending: false }),
      supabase.from('email_templates').select('id, name').eq('is_active', true),
      supabase.from('whatsapp_templates').select('id, name').eq('is_active', true),
    ]);
    setWorkflows((wf || []).map((w: any) => ({ ...w, steps: (w.steps || []) as WorkflowStep[] })));
    setEmailTemplates((et || []) as TemplateLite[]);
    setWhatsTemplates((wt || []) as TemplateLite[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  /* ─── CRUD ─── */
  const saveWorkflow = async () => {
    if (!editing?.name) return toast.error('Informe o nome do workflow');
    if (editing.steps.length === 0) return toast.error('Adicione ao menos um passo');

    const payload = {
      name: editing.name,
      description: editing.description || null,
      trigger_event: editing.trigger_event,
      trigger_delay_minutes: editing.trigger_delay_minutes,
      steps: editing.steps as any,
      is_active: editing.is_active,
    };

    const action = editing.id
      ? supabase.from('automation_workflows').update(payload).eq('id', editing.id)
      : supabase.from('automation_workflows').insert(payload);

    const { error } = await action;
    if (error) return toast.error('Erro ao salvar workflow');
    toast.success('Workflow salvo');
    setEditing(null);
    loadData();
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase.from('automation_workflows').delete().eq('id', id);
    if (error) return toast.error('Erro ao excluir');
    toast.success('Workflow excluído');
    loadData();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('automation_workflows').update({ is_active: active }).eq('id', id);
    loadData();
  };

  const duplicateWorkflow = (w: Workflow) => {
    setEditing({
      name: `${w.name} (cópia)`,
      description: w.description,
      trigger_event: w.trigger_event,
      trigger_delay_minutes: w.trigger_delay_minutes,
      steps: w.steps.map(s => ({ ...s, id: uid() })),
      is_active: false,
    });
  };

  /* ─── step helpers ─── */
  const addStep = (type: WorkflowStep['type']) => {
    if (!editing) return;
    const step: WorkflowStep = type === 'delay'
      ? { id: uid(), type: 'delay', delay_value: 30, delay_unit: 'minutes', delay_minutes: 30 }
      : { id: uid(), type, channel: type === 'send_email' ? 'email' : 'whatsapp', template_id: '', template_name: '' };
    setEditing({ ...editing, steps: [...editing.steps, step] });
  };

  const updateStep = (idx: number, patch: Partial<WorkflowStep>) => {
    if (!editing) return;
    const steps = [...editing.steps];
    const s = { ...steps[idx], ...patch };
    if (s.type === 'delay' && patch.delay_value !== undefined || patch.delay_unit !== undefined) {
      s.delay_minutes = delayToMinutes(s.delay_value || 0, s.delay_unit || 'minutes');
    }
    steps[idx] = s;
    setEditing({ ...editing, steps });
  };

  const removeStep = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, steps: editing.steps.filter((_, i) => i !== idx) });
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const steps = [...editing.steps];
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    [steps[idx], steps[target]] = [steps[target], steps[idx]];
    setEditing({ ...editing, steps });
  };

  const newWorkflow = (): Workflow => ({
    name: '',
    description: '',
    trigger_event: 'abandoned_cart',
    trigger_delay_minutes: 0,
    steps: [],
    is_active: false,
  });

  const triggerInfo = (ev: string) => TRIGGER_EVENTS.find(t => t.value === ev) || TRIGGER_EVENTS[0];

  /* ─── render ─── */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Workflows de Automação</h3>
          <p className="text-sm text-muted-foreground">Crie sequências automáticas de envios com temporizadores</p>
        </div>
        <Button onClick={() => setEditing(newWorkflow())}><Plus className="h-4 w-4 mr-2" />Novo Workflow</Button>
      </div>

      {/* list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : workflows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Nenhum workflow criado</p>
          <p className="text-sm mt-1">Crie seu primeiro workflow de automação</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map(w => {
            const t = triggerInfo(w.trigger_event);
            const TIcon = t.icon;
            return (
              <Card key={w.id} className="border relative group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{w.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <TIcon className={`h-3.5 w-3.5 ${t.color}`} />
                        <span className="text-xs text-muted-foreground">{t.label}</span>
                      </div>
                    </div>
                    <Switch checked={w.is_active} onCheckedChange={v => toggleActive(w.id!, v)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* mini pipeline */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {w.steps.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1">
                        {i > 0 && <ArrowDown className="h-3 w-3 text-muted-foreground/50 rotate-[-90deg]" />}
                        {s.type === 'delay' ? (
                          <Badge variant="outline" className="text-[10px] gap-1"><Clock className="h-2.5 w-2.5" />{s.delay_value}{s.delay_unit?.[0]}</Badge>
                        ) : s.type === 'send_email' ? (
                          <Badge className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 border-blue-200"><Mail className="h-2.5 w-2.5" />Email</Badge>
                        ) : (
                          <Badge className="text-[10px] gap-1 bg-green-500/10 text-green-600 border-green-200"><MessageSquare className="h-2.5 w-2.5" />WhatsApp</Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{w.steps.length} passo{w.steps.length !== 1 ? 's' : ''}</span>
                    <span>{w.run_count || 0} execuções</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...w, steps: w.steps.map(s => ({ ...s })) })}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => duplicateWorkflow(w)}><Copy className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteWorkflow(w.id!)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* editor dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar Workflow' : 'Novo Workflow'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-6">
              {/* basic info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Recuperação de carrinho" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Gatilho</label>
                  <Select value={editing.trigger_event} onValueChange={v => setEditing({ ...editing, trigger_event: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_EVENTS.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center gap-2"><t.icon className={`h-4 w-4 ${t.color}`} />{t.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Textarea rows={2} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Descreva o objetivo deste workflow" />
              </div>

              {/* ─── visual pipeline ─── */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Passos do workflow</label>

                {/* trigger node */}
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(() => { const t = triggerInfo(editing.trigger_event); return <t.icon className={`h-5 w-5 ${t.color}`} />; })()}
                      <span className="text-sm font-medium">Gatilho: {triggerInfo(editing.trigger_event).label}</span>
                    </div>
                  </div>
                  {editing.steps.length > 0 && (
                    <div className="w-px h-6 bg-border" />
                  )}
                </div>

                {/* steps */}
                {editing.steps.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className="w-full max-w-lg">
                      {step.type === 'delay' ? (
                        /* delay node */
                        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Aguardar</span>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(idx, -1)} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(idx, 1)} disabled={idx === editing.steps.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeStep(idx)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Input type="number" min={1} className="w-20" value={step.delay_value || 30} onChange={e => updateStep(idx, { delay_value: parseInt(e.target.value) || 1 })} />
                            <Select value={step.delay_unit || 'minutes'} onValueChange={v => updateStep(idx, { delay_unit: v as any })}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutos</SelectItem>
                                <SelectItem value="hours">Horas</SelectItem>
                                <SelectItem value="days">Dias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        /* send node */
                        <div className={`rounded-xl border-2 p-4 ${step.type === 'send_email' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800' : 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {step.type === 'send_email' ? <Mail className="h-4 w-4 text-blue-500" /> : <MessageSquare className="h-4 w-4 text-green-500" />}
                              <span className="text-sm font-medium">{step.type === 'send_email' ? 'Enviar E-mail' : 'Enviar WhatsApp'}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(idx, -1)} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(idx, 1)} disabled={idx === editing.steps.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeStep(idx)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          <Select
                            value={step.template_id || ''}
                            onValueChange={v => {
                              const list = step.type === 'send_email' ? emailTemplates : whatsTemplates;
                              const tpl = list.find(t => t.id === v);
                              updateStep(idx, { template_id: v, template_name: tpl?.name || '' });
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
                            <SelectContent>
                              {(step.type === 'send_email' ? emailTemplates : whatsTemplates).map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    {idx < editing.steps.length - 1 && <div className="w-px h-6 bg-border" />}
                  </div>
                ))}

                {/* add step buttons */}
                <div className="flex flex-col items-center pt-2">
                  {editing.steps.length > 0 && <div className="w-px h-4 bg-border" />}
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button variant="outline" size="sm" onClick={() => addStep('send_email')} className="gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />E-mail
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addStep('send_whatsapp')} className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-green-500" />WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addStep('delay')} className="gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />Temporizador
                    </Button>
                  </div>
                </div>
              </div>

              {/* active switch */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Switch checked={editing.is_active} onCheckedChange={v => setEditing({ ...editing, is_active: v })} />
                <div>
                  <span className="text-sm font-medium">{editing.is_active ? 'Ativo' : 'Inativo'}</span>
                  <p className="text-xs text-muted-foreground">Workflows ativos serão executados automaticamente</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveWorkflow}><Save className="h-4 w-4 mr-2" />Salvar Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
