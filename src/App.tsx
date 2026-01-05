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
import NewClientPage from "./pages/NewClientPage";
import ServicesPage from "./pages/ServicesPage";
import NewServicePage from "./pages/NewServicePage";
import OrdersPage from "./pages/OrdersPage";
import NewOrderPage from "./pages/NewOrderPage";
import NotificationsPage from "./pages/NotificationsPage";

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

          {/* App Routes with Bottom Nav */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/clientes/novo" element={<NewClientPage />} />
            <Route path="/clientes/:id" element={<ClientsPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/servicos/novo" element={<NewServicePage />} />
            <Route path="/servicos/:id" element={<ServicesPage />} />
            <Route path="/ordens" element={<OrdersPage />} />
            <Route path="/ordens/nova" element={<NewOrderPage />} />
            <Route path="/ordens/:id" element={<OrdersPage />} />
            <Route path="/notificacoes" element={<NotificationsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
