import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { storeInfo } from '@/data/store';

interface ProductSpecificationsProps {
  product: Product;
}

export const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {/* Description */}
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-semibold">
            Descrição do Produto
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {product.fullDescription || product.description}
          </AccordionContent>
        </AccordionItem>

        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <AccordionItem value="materials">
            <AccordionTrigger className="text-base font-semibold">
              Materiais Disponíveis
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((material) => (
                  <Badge key={material} variant="secondary" className="text-sm">
                    {material}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <AccordionItem value="specifications">
            <AccordionTrigger className="text-base font-semibold">
              Especificações Técnicas
            </AccordionTrigger>
            <AccordionContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex flex-col">
                    <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                    <dd className="text-sm font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Customization Options */}
        {product.customizable && (
          <AccordionItem value="customization">
            <AccordionTrigger className="text-base font-semibold">
              Opções de Personalização
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Cores de Fundo</h4>
                <div className="flex flex-wrap gap-1">
                  {storeInfo.customizationOptions.backgroundColors.map((color) => (
                    <Badge key={color} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Cores Espelhadas</h4>
                <div className="flex flex-wrap gap-1">
                  {storeInfo.customizationOptions.mirrorColors.map((color) => (
                    <Badge key={color} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Acabamentos</h4>
                <div className="flex flex-wrap gap-1">
                  {storeInfo.customizationOptions.finishes.map((finish) => (
                    <Badge key={finish} variant="outline" className="text-xs">
                      {finish}
                    </Badge>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Shipping */}
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-base font-semibold">
            Envio e Prazo
          </AccordionTrigger>
          <AccordionContent className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Prazo de produção:</strong> {storeInfo.productionTime}
            </p>
            <p>
              <strong className="text-foreground">Frete grátis:</strong> para pedidos acima de R$ {storeInfo.freeShippingMinimum}
            </p>
            <p>
              Enviamos para todo o Brasil via Correios (PAC ou SEDEX) e transportadoras parceiras.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Warranty */}
        <AccordionItem value="warranty">
          <AccordionTrigger className="text-base font-semibold">
            Garantia e Trocas
          </AccordionTrigger>
          <AccordionContent className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Garantia:</strong> {storeInfo.warranty} contra defeitos de fabricação.
            </p>
            <p>
              Confira nossa <a href="/trocas" className="text-primary hover:underline">política de trocas e devoluções</a>.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
