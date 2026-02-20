import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import InscricaoPage from "./pages/InscricaoPage";
import ClassificacaoPage from "./pages/ClassificacaoPage";
import PartidasPage from "./pages/PartidasPage";
import TimeAreaPage from "./pages/TimeAreaPage";
import AdminPage from "./pages/AdminPage";
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
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
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
