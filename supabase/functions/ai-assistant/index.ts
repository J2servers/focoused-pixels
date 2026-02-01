import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildSystemPrompt = (products: any[], categories: any[]) => {
  // Build product catalog with links (using relative paths for internal navigation)
  const productCatalog = products.map(p => {
    const price = p.promotional_price || p.price;
    const originalPrice = p.promotional_price ? ` (de R$ ${p.price.toFixed(2)})` : '';
    return `- **${p.name}**: R$ ${price.toFixed(2)}${originalPrice} - ${p.short_description || 'Produto personalizado'} → [Clique aqui para comprar](/produto/${p.slug})`;
  }).join('\n');

  // Build category links
  const categoryLinks = categories.map(c => 
    `- ${c.name}: [Ver categoria](/categoria/${c.slug})`
  ).join('\n');

  return `Você é a Luna, assistente virtual da Pincel de Luz Personalizados, uma empresa especializada em produtos personalizados de comunicação visual e decoração em acrílico, MDF e LED.

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

1. **SEMPRE envie links dos produtos** quando o cliente demonstrar interesse em comprar
2. Quando o cliente pedir um produto, encontre o mais próximo no catálogo e envie o link direto
3. Se o cliente quiser ver todos de uma categoria, envie o link da categoria
4. Seja simpática, profissional e prestativa
5. Responda em português do Brasil
6. Sugira produtos relevantes baseado nas necessidades do cliente
7. Destaque benefícios como frete grátis, parcelamento e garantia
8. Para pedidos personalizados ou grandes quantidades, incentive a solicitar orçamento
9. Nunca invente informações sobre produtos que não existem no catálogo
10. Se não encontrar exatamente o que o cliente quer, sugira alternativas similares
11. Mantenha respostas concisas mas informativas (máximo 3-4 parágrafos)
12. Use emojis ocasionalmente para deixar a conversa mais amigável ✨
13. Sempre que possível, faça perguntas para entender melhor a necessidade do cliente

## Exemplos de Respostas

**Cliente:** "Quero comprar um letreiro neon"
**Resposta:** "Que ótima escolha! ✨ Temos lindos letreiros neon LED personalizados. Aqui estão as opções:

- **Letreiro Neon LED Personalizado**: R$ 189,90 → [Clique aqui para comprar](/produto/letreiro-neon-led-personalizado)

Você pode personalizar o texto, cor e tamanho! Posso ajudar com alguma dúvida?"

**Cliente:** "Preciso de crachás para minha empresa"
**Resposta:** "Perfeito! Temos várias opções de crachás profissionais:

- **Crachá com QR Code Dinâmico**: R$ 24,90 → [Clique aqui para comprar](/produto/cracha-qr-code-dinamico)
- **Crachá Magnético Premium**: R$ 18,90 → [Clique aqui para comprar](/produto/cracha-magnetico-premium)

Para quantidades acima de 10 unidades você ganha 5% de desconto! Quantos crachás você precisa?"

## Objetivo Principal
Ajudar clientes a encontrar o produto ideal, SEMPRE enviando links clicáveis para facilitar a compra. Seja consultiva e demonstre conhecimento sobre os produtos.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch products and categories from database
    let products: any[] = [];
    let categories: any[] = [];
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const [productsResult, categoriesResult] = await Promise.all([
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
          .order('name')
      ]);

      products = productsResult.data || [];
      categories = categoriesResult.data || [];
    }

    console.log(`AI Assistant - Loaded ${products.length} products and ${categories.length} categories`);

    const SYSTEM_PROMPT = buildSystemPrompt(products, categories);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Muitas mensagens enviadas. Por favor, aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
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
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
