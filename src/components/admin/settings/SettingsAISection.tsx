import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { Bot, Cpu, Globe, Key, Sparkles, AlertTriangle } from 'lucide-react';
import {
  card, cardInner, sectionGap, gridGap, inputClass, selectClass,
  SectionHeader, ToggleBlock, FieldGroup, InfoBanner,
} from './SettingsShared';

interface Props {
  settings: Partial<CompanyInfo>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'mistral', label: 'Mistral AI' },
  { value: 'groq', label: 'Groq' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'custom', label: 'Outro (Custom)' },
];

export const SettingsAISection = ({ settings, u }: Props) => (
  <div className={sectionGap}>
    {/* ── Assistente Nativa ── */}
    <div className={cn(card, cardInner, sectionGap)}>
      <SectionHeader icon={Sparkles} title="Assistente Luna (IA Nativa)" description="Configurações do chatbot integrado ao catálogo de produtos." accentVar="--admin-accent-purple" />

      <ToggleBlock icon={Bot} title="Ativar assistente IA" description="Exibe o chatbot Luna no site para ajudar clientes." checked={settings.ai_assistant_enabled ?? true} onChange={v => u('ai_assistant_enabled', v)} />

      <div className={cn('grid md:grid-cols-2', gridGap)}>
        <FieldGroup label="Nome da assistente">
          <Input className={inputClass} value={settings.ai_assistant_name || ''} onChange={e => u('ai_assistant_name', e.target.value)} placeholder="Luna" />
        </FieldGroup>
        <FieldGroup label="Avatar URL">
          <Input className={inputClass} value={settings.ai_assistant_avatar || ''} onChange={e => u('ai_assistant_avatar', e.target.value)} placeholder="https://..." />
        </FieldGroup>
      </div>

      <FieldGroup label="Mensagem de saudação">
        <Input className={inputClass} value={settings.ai_assistant_greeting || ''} onChange={e => u('ai_assistant_greeting', e.target.value)} placeholder="Olá! Sou a Luna..." />
      </FieldGroup>
    </div>

    {/* ── API Externa (Fallback) ── */}
    <div className={cn(card, cardInner, sectionGap)}>
      <SectionHeader icon={Cpu} title="API de IA Externa (Fallback)" description="Configure um provedor externo caso a IA nativa fique indisponível." accentVar="--admin-accent-orange" />

      <ToggleBlock icon={Globe} title="Usar IA externa" description="Quando ativado, substitui a IA nativa pelo provedor configurado abaixo." checked={settings.ai_external_enabled ?? false} onChange={v => u('ai_external_enabled', v)} />

      {settings.ai_external_enabled && (
        <>
          <div className={cn('grid md:grid-cols-2', gridGap)}>
            <FieldGroup label="Provedor">
              <Select value={settings.ai_external_provider || 'openai'} onValueChange={v => u('ai_external_provider', v)}>
                <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white/[0.04] border-white/[0.08] text-white">
                  {AI_PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Modelo">
              <Input className={inputClass} value={settings.ai_external_model || ''} onChange={e => u('ai_external_model', e.target.value)} placeholder="gpt-4o, claude-3-sonnet, gemini-pro..." />
            </FieldGroup>
          </div>

          <FieldGroup label="URL da API">
            <Input className={inputClass} value={settings.ai_external_api_url || ''} onChange={e => u('ai_external_api_url', e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" />
          </FieldGroup>

          <FieldGroup label="Chave de API (API Key)">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                className={cn(inputClass, 'pl-10')}
                type="password"
                value={settings.ai_external_api_key || ''}
                onChange={e => u('ai_external_api_key', e.target.value)}
                placeholder="sk-..."
              />
            </div>
          </FieldGroup>

          <InfoBanner accentVar="--admin-accent-orange" icon={AlertTriangle}>
            A chave de API será armazenada de forma segura. Certifique-se de que sua conta no provedor tem créditos disponíveis.
          </InfoBanner>
        </>
      )}
    </div>
  </div>
);
