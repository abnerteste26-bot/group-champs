import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CampeonatoTimer from "@/components/CampeonatoTimer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import InscricaoPage from "./pages/InscricaoPage";
import ClassificacaoPage from "./pages/ClassificacaoPage";
import PartidasPage from "./pages/PartidasPage";
import TimeAreaPage from "./pages/TimeAreaPage";
import AdminInscricoesPage from "./pages/admin/AdminInscricoesPage";
import AdminCampeonatosPage from "./pages/admin/AdminCampeonatosPage";
import AdminGruposPage from "./pages/admin/AdminGruposPage";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CampeonatoTimer />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/inscricao" element={<InscricaoPage />} />
                <Route path="/classificacao" element={<ClassificacaoPage />} />
                <Route path="/partidas" element={<PartidasPage />} />
                <Route
                  path="/time"
                  element={
                    <ProtectedRoute>
                      <TimeAreaPage />
                    </ProtectedRoute>
                  }
                />
                {/* Admin routes with sidebar layout */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/inscricoes" replace />} />
                  <Route path="inscricoes" element={<AdminInscricoesPage />} />
                  <Route path="campeonatos" element={<AdminCampeonatosPage />} />
                  <Route path="grupos" element={<AdminGruposPage />} />
                  <Route path="configuracoes" element={<AdminConfigPage />} />
                  <Route path="logs" element={<AdminLogsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
              <p style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.1em" }}>
                COPA MASTER © {new Date().getFullYear()} — Todos os direitos reservados
              </p>
            </footer>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
