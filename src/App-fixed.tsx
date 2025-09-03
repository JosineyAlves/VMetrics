import React, { useState, useRef, useEffect } from 'react'
// ✅ VALIDAÇÃO DE SETUP RESTAURADA
// As validações que redirecionam para /setup foram restauradas para garantir segurança
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "./components/LoginForm"
import ApiKeySetup from "./components/ApiKeySetup"
import SetupPassword from "./components/SetupPassword"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import Campaigns from "./components/Campaigns"
import Conversions from "./components/Conversions"
import Performance from "./components/Performance"
import Funnel from "./components/Funnel"
import Settings from "./components/Settings"
import LandingPage from "./components/LandingPage"
import PeriodDropdown from './components/ui/PeriodDropdown'
import { useDateRangeStore } from './store/dateRange'
import { useAuthSupabaseStore } from './store/authSupabase'
import { useSidebarStore } from './store/sidebar'
import { RefreshCw, Play, Pause } from 'lucide-react'
import { isDashboardApp } from './config/urls'
import usePageTitle from './hooks/usePageTitle'

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasApiKey } = useAuthSupabaseStore()
  const location = useLocation()
  
  if (!isAuthenticated) {
    // Redirecionar para login mantendo a URL de destino
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // ✅ VALIDAÇÃO RESTAURADA: Se estiver autenticado mas não tiver API Key, redirecionar para setup
  if (isAuthenticated && !hasApiKey && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }
  
  return <>{children}</>
}

// Componente para o layout do dashboard
const DashboardLayout: React.FC = () => {
  const { isAuthenticated, hasApiKey } = useAuthSupabaseStore()
  const { isCollapsed, toggle } = useSidebarStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular refresh - você pode implementar lógica real aqui
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed}
        onToggle={toggle}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3cd48f] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <PeriodDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/conversions" element={<Conversions />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/funnel" element={<Funnel />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const { isAuthenticated } = useAuthSupabaseStore()
  const location = useLocation()
  
  // Definir título da página baseado na rota atual
  usePageTitle()

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes>
          {/* ✅ ROTA PRINCIPAL ADICIONADA */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rotas públicas */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          
          {/* Rota de setup (protegida mas sem sidebar) */}
          <Route path="/setup" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <ApiKeySetup />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* ✅ ROTAS PROTEGIDAS ESPECÍFICAS */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/conversions" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/funnel" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          
          {/* ✅ ROTA CATCH-ALL PARA 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
