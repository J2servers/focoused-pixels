/**
 * ProductFAQ - FAQ section on product page
 */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const defaultFAQs = [
  {
    question: 'Qual o prazo de produção?',
    answer: 'O prazo de produção varia de 4 a 10 dias úteis, dependendo da complexidade e personalização do produto. Após a confirmação do pagamento, iniciaremos a produção imediatamente.',
  },
  {
    question: 'Posso personalizar o produto com meu logotipo?',
    answer: 'Sim! Todos os nossos produtos podem ser personalizados com seu logotipo, texto ou imagem. Basta enviar o arquivo durante o checkout ou pelo WhatsApp após a compra.',
  },
  {
    question: 'Quais formatos de arquivo são aceitos?',
    answer: 'Aceitamos arquivos nos formatos PNG, JPG, SVG, PDF, AI e EPS. Para melhor qualidade, recomendamos arquivos vetoriais (SVG, AI ou EPS).',
  },
  {
    question: 'Como funciona o frete?',
    answer: 'Enviamos para todo o Brasil via Correios (PAC e SEDEX) ou transportadoras. O frete é grátis para compras acima do valor mínimo. O prazo de entrega depende da sua localidade.',
  },
  {
    question: 'Qual a garantia dos produtos?',
    answer: 'Todos os nossos produtos possuem garantia de 3 meses contra defeitos de fabricação. Caso identifique algum problema, entre em contato pelo WhatsApp para resolvermos.',
  },
  {
    question: 'Posso solicitar uma amostra antes de comprar em quantidade?',
    answer: 'Sim! Para pedidos acima de 20 unidades, oferecemos a opção de produzir um protótipo. Marque a opção "Solicitar Protótipo" no formulário de orçamento.',
  },
  {
    question: 'Vocês fazem desconto para grandes quantidades?',
    answer: 'Sim! Temos descontos progressivos: 5% para 10+ unidades, 10% para 20+, 15% para 50+ e 20% para 100+ unidades. O desconto é aplicado automaticamente.',
  },
];

interface ProductFAQProps {
  productName?: string;
}

export function ProductFAQ({ productName }: ProductFAQProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Perguntas Frequentes{productName ? ` - ${productName}` : ''}</h2>
      </div>
      <div className="rounded-2xl neu-flat p-4 md:p-6">
        <Accordion type="single" collapsible className="w-full">
          {defaultFAQs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-sm font-medium text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
