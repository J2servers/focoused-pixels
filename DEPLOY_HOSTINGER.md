# Deploy na VPS Hostinger — Pincel de Luz

Guia completo para hospedar este projeto numa **VPS Hostinger** (Ubuntu 22.04+).
Backend continua no **Lovable Cloud (Supabase)** — a VPS serve apenas o frontend estático.

---

## 0. Visão geral da arquitetura

```
┌────────────────┐    HTTPS     ┌─────────────────┐    HTTPS     ┌──────────────────┐
│  Navegador     │ ───────────► │ VPS Hostinger   │ ───────────► │ Lovable Cloud    │
│  (cliente)     │              │ Nginx + dist/   │              │ Supabase + Edge  │
└────────────────┘              └─────────────────┘              └──────────────────┘
```

A VPS **só serve arquivos estáticos** (HTML/CSS/JS). Toda lógica de banco, auth,
pagamentos e edge functions roda no Lovable Cloud — não há Node rodando na VPS.

---

## 1. Pré-requisitos na VPS

```bash
# Conecte via SSH (use as credenciais do painel Hostinger)
ssh root@SEU_IP_DA_VPS

# Atualize o sistema
apt update && apt upgrade -y

# Pacotes essenciais
apt install -y nginx git curl ufw certbot python3-certbot-nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 2. Build do projeto (escolha A ou B)

### **A) Build na VPS** (mais simples)

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Clone o projeto (ou envie via SCP/rsync)
mkdir -p /var/www && cd /var/www
git clone SEU_REPO pinceldeluz
cd pinceldeluz

# Configure variáveis
cp .env.example .env
nano .env   # preencha VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID

# Instale e builde
npm ci
npm run build

# A pasta dist/ é o que o Nginx vai servir
```

### **B) Build local + upload do `dist/`** (recomendado p/ VPS pequena)

No seu computador:

```bash
cp .env.example .env   # preencha
npm ci
npm run build

# Envie o dist/ via rsync
rsync -avz --delete ./dist/ root@SEU_IP:/var/www/pinceldeluz/dist/
```

---

## 3. Configuração do Nginx

```bash
# Copie o template incluso no projeto
cp /var/www/pinceldeluz/nginx.conf.example /etc/nginx/sites-available/pinceldeluz

# Edite e troque os domínios
nano /etc/nginx/sites-available/pinceldeluz
#   server_name pinceldeluz.com.br www.pinceldeluz.com.br;
#   root /var/www/pinceldeluz/dist;

# Ative o site
ln -sf /etc/nginx/sites-available/pinceldeluz /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Valide e recarregue
nginx -t && systemctl reload nginx
```

---

## 4. SSL gratuito (Let's Encrypt)

```bash
certbot --nginx -d pinceldeluz.com.br -d www.pinceldeluz.com.br
# Aceite o e-mail e o redirect HTTPS

# Renovação automática já vem ativada via systemd timer
systemctl status certbot.timer
```

---

## 5. DNS (no painel da Hostinger ou registrador)

Aponte para o IP da VPS:

| Tipo  | Nome | Valor             |
|-------|------|-------------------|
| A     | `@`  | `IP_DA_SUA_VPS`   |
| A     | `www`| `IP_DA_SUA_VPS`   |

Aguarde a propagação (5–30 min) e acesse `https://pinceldeluz.com.br`.

---

## 6. Atualizações futuras

Crie um script `/var/www/pinceldeluz/deploy.sh`:

```bash
#!/bin/bash
set -e
cd /var/www/pinceldeluz
git pull
npm ci
npm run build
echo "✅ Deploy concluído $(date)"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

Ou, se buildar localmente: `rsync -avz --delete ./dist/ root@VPS:/var/www/pinceldeluz/dist/`.

---

## 7. Alternativa: Docker Compose (se preferir containerizar)

A VPS precisa ter Docker instalado:
```bash
curl -fsSL https://get.docker.com | sh
```

Depois, na pasta do projeto:
```bash
cp .env.example .env   # preencha
docker compose up -d --build
```

O container expõe na porta `8080`. Configure o Nginx do host como **reverse proxy** apontando para `http://localhost:8080`, mantendo o SSL no host.

---

## 8. Hospedagem Compartilhada Hostinger (sem VPS)

Se o plano for **shared/cloud** (não VPS), use FTP/Hostinger File Manager:

1. Builde local: `npm run build`
2. Envie todo o conteúdo de `dist/` para `public_html/`
3. O arquivo `public/.htaccess` (já incluso no build) cuida do SPA fallback no Apache.

---

## 9. Checklist final

- [ ] DNS apontando para a VPS
- [ ] HTTPS ativo (`https://...` com cadeado verde)
- [ ] Refresh em rotas profundas (ex: `/produto/algo`) funciona — não dá 404
- [ ] Console do navegador sem erros de CSP
- [ ] Login admin funciona em `/gateway-x7k9m2`
- [ ] Pedidos/checkout estão sendo persistidos no Lovable Cloud

---

## 10. Suporte

- Edge Functions, banco e secrets continuam sendo gerenciados via **Lovable Cloud**
  (não precisa de nada disso na VPS).
- Logs do Nginx: `tail -f /var/log/nginx/error.log`
- Logs do app no navegador (DevTools) — chamadas `https://*.supabase.co`
