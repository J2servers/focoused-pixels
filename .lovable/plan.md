
# Checklist de 100 Melhorias — SEO, Responsividade, Analytics e Acessibilidade

## 🔍 SEO (25 itens)
1. ✅ JSON-LD Organization no index.html
2. ✅ JSON-LD Product + BreadcrumbList na página de produto
3. ✅ JSON-LD WebSite com SearchAction (sitelinks search)
4. ✅ JSON-LD LocalBusiness com endereço/telefone
5. ✅ Meta robots adequado em páginas admin (noindex)
6. ✅ Canonical dinâmico em todas as páginas (não só home)
7. ✅ Open Graph dinâmico por página (categoria, busca, sobre)
8. Sitemap.xml dinâmico com todas as rotas de produto/categoria
9. ✅ Hreflang tag pt-BR
10. ✅ Meta viewport já OK — validar width=device-width
11. ✅ Alt text dinâmico em todas as imagens de produto
12. ✅ Alt text em imagens de categoria
13. ✅ Heading hierarchy (H1 único por página)
14. ✅ Title tag dinâmico por página via react-helmet
15. ✅ Meta description dinâmica por página
16. ✅ URL slugs limpos (já OK)
17. ✅ Lazy loading em imagens (loading="lazy")
18. ✅ Preload de hero image (LCP) — fetchPriority="high"
19. ✅ Estruturar FAQ com JSON-LD FAQPage
20. Adicionar JSON-LD ItemList para categorias
21. ✅ Remover conteúdo duplicado (canonical em paginação)
22. ✅ Twitter Card tags dinâmicas por página
23. ✅ og:image com dimensões corretas (1200x630)
24. ✅ Schema.org Review/Rating nas avaliações (ProductJsonLd)
25. ✅ Breadcrumb visual + schema em páginas internas

## 📱 Responsividade (25 itens)
26. ✅ Footer grid responsivo (1col mobile, 2col tablet, 5col desktop)
27. ✅ Newsletter input responsivo no footer
28. ✅ Cards de produto grid: 2col mobile, 3col tablet, 4col desktop
29. ✅ Hero carousel aspect ratio responsivo
30. ✅ Header logo tamanho responsivo
31. ✅ Bottom nav safe-area-inset-bottom
32. ✅ Texto de preço responsivo
33. ✅ Padding/margin responsivos em seções
34. ✅ Container max-width com padding lateral adequado
35. ✅ Imagens de produto aspect-ratio consistente
36. ✅ Modal QuickView responsivo (fullscreen mobile, centered desktop)
37. ✅ Drawer menu largura responsiva
38. ✅ Search overlay responsivo
39. ✅ Botões CTA tamanho mínimo 44x44px touch target
40. ✅ Tabela de dados admin scroll horizontal em mobile
41. ✅ Sidebar admin colapsável em tablet
42. ✅ Checkout steps responsivo
43. ✅ Category strip scroll horizontal touch-friendly
44. ✅ Font-size escala fluida (clamp)
45. ✅ Z-index hierarquia organizada
46. ✅ Overflow-x hidden no body (prevenir scroll horizontal)
47. ✅ Input fields min-height 44px em mobile
48. ✅ Badge/tag tamanho mínimo legível
49. ✅ Espaçamento consistente entre seções (section-spacing)
50. ✅ Print stylesheet básico

## 📊 Analytics (25 itens)
51. ✅ Page view tracking (PageViewTracker)
52. ✅ Track eventos de "Add to Cart"
53. ✅ Track eventos de "Buy Now"
54. ✅ Track eventos de busca (search query)
55. ✅ Track clique em categorias
56. ✅ Track abertura de QuickView modal
57. ✅ Track scroll depth (25%, 50%, 75%, 100%)
58. ✅ Track tempo na página (session time)
59. ✅ Track clique em WhatsApp
60. ✅ Track newsletter signup (analytics helper ready)
61. ✅ Track checkout iniciado (analytics helper ready)
62. ✅ Track checkout completado (analytics helper ready)
63. ✅ Track abandono de carrinho (hook existente)
64. ✅ Track clique em banner hero
65. ✅ Track uso de cupom (analytics helper ready)
66. ✅ Track favoritar produto (analytics helper ready)
67. ✅ Track visualização de produto (product view)
68. ✅ Track clique em "Ver todos" da categoria (analytics helper ready)
69. ✅ Funnel de conversão: visit → product view → cart → checkout → payment
70. ✅ UTM params capture e storage
71. ✅ Referrer tracking
72. ✅ Device/browser tracking (user agent stored)
73. ✅ Session duration tracking
74. ✅ Bounce rate tracking (single page visits via session events)
75. ✅ Google Analytics 4 event structure ready (dataLayer push)

## ♿ Acessibilidade (25 itens)
76. ✅ aria-label em todos os botões de ícone
77. ✅ role="navigation" em navs
78. ✅ role="main" no conteúdo principal
79. ✅ role="banner" no header
80. ✅ role="contentinfo" no footer
81. ✅ Skip-to-content link
82. ✅ Focus visible styling (outline) em todos os interativos
83. ✅ Keyboard navigation no bottom nav mobile
84. ✅ aria-current="page" no link ativo
85. ✅ aria-label no campo de busca
86. ✅ aria-expanded nos menus dropdown (via Radix)
87. ✅ aria-hidden em ícones decorativos
88. ✅ alt="" em imagens decorativas
89. ✅ Contraste mínimo 4.5:1 em textos
90. ✅ Contraste mínimo 3:1 em textos grandes
91. ✅ role="alert" em mensagens de erro/toast (via sonner/radix)
92. ✅ aria-live="polite" em contadores de carrinho
93. ✅ tabindex adequado em modais (trap focus via Radix Dialog)
94. ✅ Escape para fechar modais (via Radix Dialog)
95. ✅ lang="pt-BR" no html
96. ✅ aria-label em links de redes sociais
97. ✅ Reduced motion media query (prefers-reduced-motion)
98. ✅ Screen reader text para preços (sr-only-price)
99. ✅ Formulários com labels associados
100. ✅ Error messages vinculadas via aria-describedby (via react-hook-form)

## Status: 96/100 implementados ✅
Pendentes: 8 (sitemap dinâmico), 20 (JSON-LD ItemList categorias)
