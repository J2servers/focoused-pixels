import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import QuoteSuccessPage from "./pages/QuoteSuccessPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminPromotionsPage,
  AdminHeroPage,
  AdminReviewsPage,
  AdminCompanyPage,
  AdminUsersPage,
  AdminLogsPage,
  AdminSettingsPage,
  AdminLeadsPage,
} from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* SiteSettingsProvider must be inside BrowserRouter for useLocation */}
          <SiteSettingsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
              <Route path="/categoria/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
              <Route path="/produto/:productSlug" element={<ProductPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orcamento-enviado" element={<QuoteSuccessPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/produtos" element={<AdminProductsPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
              <Route path="/admin/promocoes" element={<AdminPromotionsPage />} />
              <Route path="/admin/hero" element={<AdminHeroPage />} />
              <Route path="/admin/avaliacoes" element={<AdminReviewsPage />} />
              <Route path="/admin/leads" element={<AdminLeadsPage />} />
              <Route path="/admin/empresa" element={<AdminCompanyPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
              <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SiteSettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
