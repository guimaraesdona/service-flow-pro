import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout, RouteFallback } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// O login é a primeira tela: vai no bundle principal. O resto carrega por rota.
import LoginPage from "./pages/LoginPage";

// Auth pages
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

// App pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const NewClientPage = lazy(() => import("./pages/NewClientPage"));
const EditClientPage = lazy(() => import("./pages/EditClientPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const NewServicePage = lazy(() => import("./pages/NewServicePage"));
const EditServicePage = lazy(() => import("./pages/EditServicePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const NewOrderPage = lazy(() => import("./pages/NewOrderPage"));
const EditOrderPage = lazy(() => import("./pages/EditOrderPage"));
const PrintOrderPage = lazy(() => import("./pages/PrintOrderPage"));
const FinancialPage = lazy(() => import("./pages/FinancialPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

              {/* App Routes with Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clientes" element={<ClientsPage />} />
                <Route path="/clientes/novo" element={<NewClientPage />} />
                <Route path="/clientes/:id" element={<ClientDetailPage />} />
                <Route path="/clientes/:id/editar" element={<EditClientPage />} />
                <Route path="/servicos" element={<ServicesPage />} />
                <Route path="/servicos/novo" element={<NewServicePage />} />
                <Route path="/servicos/:id" element={<ServiceDetailPage />} />
                <Route path="/servicos/:id/editar" element={<EditServicePage />} />
                <Route path="/ordens" element={<OrdersPage />} />
                <Route path="/ordens/nova" element={<NewOrderPage />} />
                <Route path="/ordens/:id" element={<OrderDetailPage />} />
                <Route path="/ordens/:id/editar" element={<EditOrderPage />} />
                <Route path="/ordens/:id/imprimir" element={<PrintOrderPage />} />
                <Route path="/financeiro" element={<FinancialPage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
                <Route path="/relatorios" element={<ReportsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
