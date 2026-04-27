import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

// --- Input Validation ---
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_ROLES = ["user", "assistant"] as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProductInfo {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotional_price: number | null;
  short_description: string | null;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface AIExternalConfig {
  ai_external_enabled: boolean | null;
  ai_external_provider: string | null;
  ai_external_api_url: string | null;
  ai_external_api_key: string | null;
  ai_external_model: string | null;
}

function validateMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) throw new Error("messages must be an array");
  if (raw.length === 0) throw new Error("messages cannot be empty");
  if (raw.length > MAX_MESSAGES) throw new Error(`max ${MAX_MESSAGES} messages allowed`);

  return raw.map((msg, i) => {
    if (typeof msg !== "object" || msg === null) throw new Error(`message[${i}] invalid`);
    const m = msg as Record<string, unknown>;
    
    if (!ALLOWED_ROLES.includes(m.role as typeof ALLOWED_ROLES[number])) {
      throw new Error(`message[${i}].role must be 'user' or 'assistant'`);
    }
    if (typeof m.content !== "string" || m.content.trim().length === 0) {
      throw new Error(`message[${i}].content must be non-empty string`);
    }
    
    return {
      role: m.role as ChatMessage["role"],
      content: m.content.trim().substring(0, MAX_MESSAGE_LENGTH),
    };
  });
}

// --- Rate Limiting (in-memory, per-instance) ---
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxReqs = 15, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= maxReqs) return false;
    entry.count++;
    return true;
  }
  rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
  // Cleanup old entries periodically
  if (rateLimit.size > 1000) {
    for (const [k, v] of rateLimit) {
      if (v.resetAt <= now) rateLimit.delete(k);
    }
  }
  return true;
}

// --- System Prompt Builder ---
const buildSystemPrompt = (products: ProductInfo[], categories: CategoryInfo[]) => {
  const productCatalog = products.map(p => {
    const price = p.promotional_price || p.price;
    const originalPrice = p.promotional_price ? ` (de R$ ${p.price.toFixed(2)})` : '';
    return `- **${p.name}**: R$ ${price.toFixed(2)}${originalPrice} - ${p.short_description || 'Produto personalizado'} → [Clique aqui para comprar](/produto/${p.slug})`;
  }).join('\n');

  const categoryLinks = categories.map(c => 
    `- ${c.name}: [Ver categoria](/categoria/${c.slug})`
  ).join('\n');

  return `Você é a Luna 💜, consultora de vendas IA da Pincel de Luz Personalizados — especialista em comunicação visual e decoração em acrílico, MDF e LED. Seu papel: encantar, qualificar e CONVERTER.

## Sobre a Empresa
- Nome: Pincel de Luz Personalizados
- Especialidade: Produtos personalizados para empresas e decoração
- Frete grátis: Acima de R$ 159
- Parcelamento: Até 12x sem juros
- Prazo de produção: 4 a 10 dias úteis
- Garantia: 3 meses

## 🛒 CATÁLOGO DE PRODUTOS COM LINKS

${productCatalog}

## 📂 CATEGORIAS

${categoryLinks}

## Opções de Personalização
- Cores de fundo: Branco, Preto, Transparente, Azul Royal, Rosa, Lilás, Verde, Vermelho
- Cores espelhadas: Dourado, Prata, Rose Gold, Azul, Bronze, Vermelho, Verde, Lilás
- Materiais: Acrílico Cristal, Acrílico Espelhado, MDF, Acrílico com LED
- Acabamentos: Polido, Fosco, Brilhante
- Fixação: Fita Dupla Face (inclusa), Prolongadores de Inox, Suporte de Mesa

## Descontos por Quantidade
- 10+ unidades: 5% de desconto
- 20+ unidades: 10% de desconto
- 50+ unidades: 15% de desconto
- 100+ unidades: 20% de desconto

## 🎯 SUAS DIRETRIZES PRINCIPAIS

1. **TOM**: Caloroso, consultivo, brasileiro. Use "você", emojis com moderação ✨💜🛒, parágrafos curtos.
2. **DESCOBERTA RÁPIDA**: Faça 1 pergunta inteligente para entender contexto (uso, ocasião, quantidade) antes de empurrar produto.
3. **RECOMENDE COM LINK SEMPRE**: Quando identificar interesse, indique o produto exato com **[nome do produto](/produto/slug)**.
4. **🚀 AUTO-REDIRECIONAMENTO** — Quando o cliente pedir explicitamente um produto específico ("quero ver X", "me mostra o Y", "leva eu para Z", "abrir página de W"), e você encontrar EXATAMENTE 1 match no catálogo, finalize sua resposta com a tag especial:
   \`[REDIRECT:/produto/slug-do-produto]\`
   Avise antes: "Estou te levando para a página agora 🚀" e adicione a tag na ÚLTIMA LINHA. Use também para categorias quando o cliente pedir explicitamente.
   ⚠️ NÃO redirecione em conversas exploratórias ou se houver ambiguidade — apenas envie links normais.
5. **GATILHOS DE CONVERSÃO**: Mencione frete grátis (>R$159), 12x sem juros, garantia 3 meses, descontos por volume quando relevante.
6. **OBJEÇÕES**: Para preço alto → mostre parcelamento. Para prazo → reforce 4-10 dias úteis. Para qualidade → garantia.
7. **NUNCA INVENTE PRODUTOS** — só recomende o que está no catálogo acima.
8. **CONCISO**: Máximo 4 parágrafos curtos. Use **negrito** para destaque e listas quando útil.
9. Se não encontrar o produto exato, sugira 2-3 alternativas similares com links.
10. Para orçamentos personalizados/grandes volumes, direcione: [Solicitar orçamento](/contato).

## Objetivo
Transformar visitantes em compradores. Seja a melhor vendedora consultiva que eles já encontraram online. 💜`;
};

// Map external provider names to their default API URLs
const PROVIDER_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  google: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  cohere: "https://api.cohere.ai/v1/chat",
};

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Muitas mensagens enviadas. Aguarde um momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const messages = validateMessages(body.messages);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Fetch products, categories, and AI config from database
    let products: ProductInfo[] = [];
    let categories: CategoryInfo[] = [];
    let aiConfig: AIExternalConfig | null = null;
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const [productsResult, categoriesResult, configResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, slug, price, promotional_price, short_description')
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('categories')
          .select('id, name, slug')
          .eq('status', 'active')
          .order('name'),
        supabase
          .from('ai_credentials')
          .select('enabled, provider, api_url, api_key, model')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      products = (productsResult.data || []) as ProductInfo[];
      categories = (categoriesResult.data || []) as CategoryInfo[];
      const c = configResult.data as { enabled: boolean | null; provider: string | null; api_url: string | null; api_key: string | null; model: string | null } | null;
      aiConfig = c ? {
        ai_external_enabled: c.enabled,
        ai_external_provider: c.provider,
        ai_external_api_url: c.api_url,
        ai_external_api_key: c.api_key,
        ai_external_model: c.model,
      } : null;
    }

    console.log(`AI Assistant - ${products.length} products, ${categories.length} categories, ${messages.length} messages`);

    const SYSTEM_PROMPT = buildSystemPrompt(products, categories);

    // Determine which AI provider to use
    const useExternal = aiConfig?.ai_external_enabled && aiConfig?.ai_external_api_key;
    
    let apiUrl: string;
    let apiKey: string;
    let model: string;
    let headers: Record<string, string>;

    if (useExternal && aiConfig) {
      const provider = aiConfig.ai_external_provider || 'openai';
      apiUrl = aiConfig.ai_external_api_url || PROVIDER_URLS[provider] || PROVIDER_URLS.openai;
      apiKey = aiConfig.ai_external_api_key!;
      model = aiConfig.ai_external_model || 'gpt-4o';
      headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      console.log(`AI Assistant - External provider: ${provider}, model: ${model}`);
    } else {
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = LOVABLE_API_KEY;
      model = "google/gemini-2.5-pro";
      headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      console.log("AI Assistant - Native Lovable AI");
    }

    const requestBody = JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      // If external fails, try fallback to native
      if (useExternal && LOVABLE_API_KEY) {
        console.warn("External AI failed, falling back to native Lovable AI");
        const fallbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages,
            ],
            stream: true,
          }),
        });

        if (fallbackResponse.ok) {
          return new Response(fallbackResponse.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas mensagens enviadas. Por favor, aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("AI Assistant error:", message);
    
    // Return 400 for validation errors
    const isValidation = message.includes("must be") || message.includes("cannot be") || message.includes("invalid");
    return new Response(
      JSON.stringify({ error: isValidation ? message : "Erro ao processar sua mensagem." }),
      { status: isValidation ? 400 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
