# Deploy

## Lovable Publish (recomendado)

1. Botão **Publish** no editor Lovable.
2. URL preview: `https://id-preview--<project>.lovable.app`
3. URL publicada: `https://focoused-pixels.lovable.app`
4. Domínio customizado: configurar via *Project → Settings → Domains*.

Backend (Lovable Cloud) e Edge Functions são publicados automaticamente — sem passo manual.

## Hostinger (SPA)

Subir o build estático para a hospedagem:

```bash
bun run build
# upload da pasta dist/
```

Adicionar `.htaccess` na raiz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Variáveis Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) já são embutidas no build pelo Vite.

## E-mail transacional

SMTP Hostinger configurado em `email_credentials`. Templates em `email_templates`, gerenciados pelo admin.

## WhatsApp

Evolution API v2 — instâncias em `whatsapp_instances`, templates em `whatsapp_templates` (limite 1600 chars).
