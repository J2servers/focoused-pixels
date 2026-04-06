import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { PageViewTracker } from "@/components/PageViewTracker";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbandonedCartTracker } from "@/hooks/useAbandonedCartTracker";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { AnalyticsInit } from "@/components/analytics/EventTracker";

// Eager-load homepage for fast FCP
import Index from "./pages/Index";

// Lazy-load all other pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const QuoteSuccessPage = lazy(() => import("./pages/QuoteSuccessPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const WhyChooseUsPage = lazy(() => import("./pages/WhyChooseUsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CustomerAreaPage = lazy(() => import("./pages/CustomerAreaPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestePage = lazy(() => import("./pages/TestePage"));
const Teste2Page = lazy(() => import("./pages/Teste2Page"));

// Payment Pages
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentErrorPage = lazy(() => import("./pages/PaymentErrorPage"));
const PaymentPendingPage = lazy(() => import("./pages/PaymentPendingPage"));

// Admin Pages (heavy — always lazy)
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminPromotionsPage = lazy(() => import("./pages/admin/AdminPromotionsPage"));
const AdminHeroPage = lazy(() => import("./pages/admin/AdminHeroPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminCompanyPage = lazy(() => import("./pages/admin/AdminCompanyPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminLogsPage = lazy(() => import("./pages/admin/AdminLogsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminLeadsPage = lazy(() => import("./pages/admin/AdminLeadsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminKanbanPage = lazy(() => import("./pages/admin/AdminKanbanPage"));
const AdminQuotesPage = lazy(() => import("./pages/admin/AdminQuotesPage"));
const AdminApiDocsPage = lazy(() => import("./pages/admin/AdminApiDocsPage"));
const AdminWhatsAppPage = lazy(() => import("./pages/admin/AdminWhatsAppPage"));
const AdminTemplatesPage = lazy(() => import("./pages/admin/AdminEmailTemplatesPage"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminWhyChooseUsPage = lazy(() => import("./pages/admin/AdminWhyChooseUsPage"));
const AdminWorkflowsPage = lazy(() => import("./pages/admin/AdminWorkflowsPage"));
const AdminCashFlowPage = lazy(() => import("./pages/admin/AdminCashFlowPage"));
const AdminRawMaterialsPage = lazy(() => import("./pages/admin/AdminRawMaterialsPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const RuntimeTrackers = () => {
  useAbandonedCartTracker();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SiteSettingsProvider>
            <ScrollToTop />
            <PageViewTracker />
            <RuntimeTrackers />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
                <Route path="/categoria/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                <Route path="/produto/:productSlug" element={<ProductPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/busca" element={<SearchPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orcamento-enviado" element={<QuoteSuccessPage />} />
                
                {/* Payment Routes */}
                <Route path="/pagamento" element={<PaymentPage />} />
                <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
                <Route path="/pagamento/erro" element={<PaymentErrorPage />} />
                <Route path="/pagamento/pendente" element={<PaymentPendingPage />} />
                
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/por-que-escolher" element={<WhyChooseUsPage />} />
                <Route path="/privacidade" element={<PrivacyPage />} />
                <Route path="/termos" element={<TermsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/rastreio" element={<TrackingPage />} />
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/minha-area" element={<CustomerAreaPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
                <Route path="/admin/orcamentos" element={<AdminQuotesPage />} />
                <Route path="/admin/kanban" element={<AdminKanbanPage />} />
                <Route path="/admin/produtos" element={<AdminProductsPage />} />
                <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
                <Route path="/admin/cupons" element={<AdminCouponsPage />} />
                <Route path="/admin/promocoes" element={<AdminPromotionsPage />} />
                <Route path="/admin/hero" element={<AdminHeroPage />} />
                <Route path="/admin/avaliacoes" element={<AdminReviewsPage />} />
                <Route path="/admin/leads" element={<AdminLeadsPage />} />
                <Route path="/admin/empresa" element={<AdminCompanyPage />} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
                <Route path="/admin/api" element={<AdminApiDocsPage />} />
                <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
                <Route path="/admin/templates" element={<AdminTemplatesPage />} />
                <Route path="/admin/email-templates" element={<AdminTemplatesPage />} />
                <Route path="/admin/midia" element={<AdminMediaPage />} />
                <Route path="/admin/pagina-por-que-escolher" element={<AdminWhyChooseUsPage />} />
                <Route path="/admin/workflows" element={<AdminWorkflowsPage />} />
                <Route path="/admin/caixa" element={<AdminCashFlowPage />} />
                <Route path="/admin/materiais" element={<AdminRawMaterialsPage />} />
                
                <Route path="/teste" element={<TestePage />} />
                <Route path="/teste2" element={<Teste2Page />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </SiteSettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

