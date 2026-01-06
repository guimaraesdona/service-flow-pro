import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// App pages
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import NewClientPage from "./pages/NewClientPage";
import EditClientPage from "./pages/EditClientPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import NewServicePage from "./pages/NewServicePage";
import EditServicePage from "./pages/EditServicePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import NewOrderPage from "./pages/NewOrderPage";
import EditOrderPage from "./pages/EditOrderPage";
import PrintOrderPage from "./pages/PrintOrderPage";
import NotificationsPage from "./pages/NotificationsPage";
import FinancialPage from "./pages/FinancialPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />

          {/* App Routes with Layout */}
          <Route element={<AppLayout />}>
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
            <Route path="/notificacoes" element={<NotificationsPage />} />
            <Route path="/financeiro" element={<FinancialPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
