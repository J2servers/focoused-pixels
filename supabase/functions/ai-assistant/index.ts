import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a assistente virtual da Pincel de Luz Personalizados, uma empresa especializada em produtos personalizados de comunicação visual e decoração em acrílico, MDF e LED.

## Sobre a Empresa
- Nome: Pincel de Luz Personalizados
- Especialidade: Produtos personalizados para empresas e decoração
- Frete grátis: Acima de R$ 159
- Parcelamento: Até 12x sem juros
- Prazo de produção: 4 a 10 dias úteis
- Garantia: 3 meses

## Catálogo de Produtos

### Letreiros e Iluminação
- **Letreiro Neon LED**: A partir de R$ 89,90 - Personalização total de texto, cores e tamanhos
- **Letreiro 3D com LED**: A partir de R$ 149,90 - Efeito tridimensional com iluminação
- **Letreiro de Parede em Acrílico**: A partir de R$ 69,90 - Elegante e moderno

### Displays QR Code
- **Display QR Code para Mesa**: A partir de R$ 29,90 - Ideal para restaurantes e lojas
- **Display QR Code Múltiplo**: A partir de R$ 49,90 - Para múltiplas redes sociais ou pagamentos

### Identificação Corporativa
- **Crachás em Acrílico**: A partir de R$ 12,90/unidade - Personalizados com nome e cargo
- **Broches Espelhados**: A partir de R$ 15,90 - Elegantes e profissionais
- **Placa de Porta para Escritório**: A partir de R$ 39,90 - Identificação profissional

### Decoração
- **Espelho Decorativo**: A partir de R$ 79,90 - Formas personalizadas
- **Mandala Decorativa**: A partir de R$ 59,90 - Arte em acrílico
- **Espelho de Mão Personalizado**: A partir de R$ 34,90 - Com nome ou mensagem

### Organizadores e Acessórios
- **Bandeja de Acrílico**: A partir de R$ 44,90 - Personalizada
- **Organizador de Mesa**: A partir de R$ 54,90 - Para escritório
- **Caixa Presente MDF**: A partir de R$ 39,90 - Para presentes especiais

### Infantil
- **Placas Infantis Personalizadas**: A partir de R$ 49,90 - Com nome da criança
- **Chaveiros Personalizados**: A partir de R$ 8,90/unidade - Diversos formatos

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

## Suas Diretrizes
1. Seja sempre simpática, profissional e prestativa
2. Responda em português do Brasil
3. Sugira produtos relevantes baseado nas necessidades do cliente
4. Destaque benefícios como frete grátis, parcelamento e garantia
5. Para pedidos personalizados ou grandes quantidades, incentive a solicitar orçamento
6. Nunca invente informações sobre produtos que não existem
7. Se não souber algo específico, sugira entrar em contato via WhatsApp para mais detalhes
8. Mantenha respostas concisas mas informativas (máximo 3-4 parágrafos)
9. Use emojis ocasionalmente para deixar a conversa mais amigável ✨
10. Sempre que possível, faça perguntas para entender melhor a necessidade do cliente

## Objetivo Principal
Ajudar clientes a encontrar o produto ideal, tirar dúvidas e preparar o caminho para uma venda. Seja consultiva e demonstre conhecimento sobre os produtos.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Assistant - Received messages:", messages.length);

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
