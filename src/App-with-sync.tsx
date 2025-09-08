import React, { useState, useRef, useEffect } from 'react'
// ✅ VALIDAÇÃO DE SETUP RESTAURADA
// As validações que redirecionam para /setup foram restauradas para garantir segurança
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "./components/LoginForm"
import SignupForm from "./components/SignupForm"
import ForgotPasswordForm from "./components/ForgotPasswordForm"
import ResetPasswordForm from "./components/ResetPasswordForm"
import ApiKeySetup from "./components/ApiKeySetup"
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
import { useAuthStore } from './store/auth'
import { useSidebarStore } from './store/sidebar'
import { useApiKeySync } from './hooks/useApiKeySync'
import { RefreshCw, Play, Pause } from 'lucide-react'
import { isDashboardApp } from './config/urls'
import usePageTitle from './hooks/usePageTitle'

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, apiKey } = useAuthStore()
  const location = useLocation()
  
  if (!isAuthenticated) {
    // Redirecionar para login mantendo a URL de destino
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // ✅ VALIDAÇÃO REMOVIDA: Usuário pode configurar API Key em /settings
  // if (isAuthenticated && !apiKey && location.pathname !== '/setup') {
  //   return <Navigate to="/setup" replace />
  // }
  
  return <>{children}</>
}

// Componente para o layout do dashboard
const DashboardLayout: React.FC = () => {
  const { isAuthenticated, apiKey } = useAuthStore()
  const { isCollapsed, toggle } = useSidebarStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Estado global de datas
  const { selectedPeriod, customRange, setSelectedPeriod, setCustomRange } = useDateRangeStore()
  
  // 🔄 Hook de sincronização da API Key
  const { isSyncing } = useApiKeySync()
  
  // ✅ VALIDAÇÃO REMOVIDA: Usuário pode configurar API Key em /settings
  // useEffect(() => {
  //   if (isAuthenticated && !apiKey) {
  //     navigate('/setup', { replace: true })
  //   }
  // }, [isAuthenticated, apiKey, navigate])
  
  // Determinar seção atual baseada na rota
  const getCurrentSection = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'dashboard'
    if (path === '/campaigns') return 'campaigns'
    if (path === '/conversions') return 'conversions'
    if (path === '/performance') return 'performance'
    if (path === '/funnel') return 'funnel'
    if (path === '/settings') return 'settings'
    return 'dashboard'
  }

  const currentSection = getCurrentSection()

  // Função para atualizar dados
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLastUpdateTime(new Date())
    
    // Simular delay de atualização
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Função para alternar sidebar
  const handleToggleSidebar = () => {
    toggle()
    setIsMobileMenuOpen(false)
  }

  // Função para fechar menu mobile
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Função para navegar
  const handleNavigate = (path: string) => {
    navigate(path)
    closeMobileMenu()
  }

  // Verificar se API Key está configurada - DEPOIS DE TODOS OS HOOKS
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin border-4 border-[#3cd48f] border-t-transparent rounded-full"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {isSyncing ? 'Sincronizando API Key...' : 'Configurando API Key...'}
          </h2>
          <p className="text-gray-500 mb-6">
            Aguarde enquanto carregamos sua configuração
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="px-6 py-2 bg-[#3cd48f] text-white rounded-lg hover:bg-[#3cd48f]/90 transition-colors"
          >
            Ir para Configurações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {currentSection === 'dashboard' ? 'Dashboard' : 
                 currentSection === 'campaigns' ? 'Campanhas' :
                 currentSection === 'conversions' ? 'Conversões' :
                 currentSection === 'performance' ? 'Performance' :
                 currentSection === 'funnel' ? 'Funil' :
                 currentSection === 'settings' ? 'Configurações' : 'Dashboard'}
              </h1>
              
              {/* Indicador de sincronização */}
              {isSyncing && (
                <div className="flex items-center text-sm text-[#3cd48f]">
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-[#3cd48f] border-t-transparent rounded-full"></div>
                  Sincronizando...
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Seletor de período */}
            <PeriodDropdown
              selectedPeriod={selectedPeriod}
              customRange={customRange}
              onPeriodChange={setSelectedPeriod}
              onCustomRangeChange={setCustomRange}
            />

            {/* Botão de refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              {isRefreshing ? (
                <RefreshCw className="w-5 h-5 text-gray-600 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Indicador de última atualização */}
            {lastUpdateTime && (
              <div className="text-sm text-gray-500">
                Atualizado às {lastUpdateTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </header>

        {/* Conteúdo das páginas */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/conversions" element={<Conversions />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/funnel" element={<Funnel />} />
                <Route path="/settings" element={<Settings />} />
                {/* Redirecionar / para /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  const [isDashboardAppState, setIsDashboardAppState] = useState(false)
  const [needsSignup, setNeedsSignup] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPlanType, setSignupPlanType] = useState('')
  const location = useLocation()
  const { initializeAuth } = useAuthStore()
  
  // Gerenciar título da página automaticamente
  usePageTitle()

  // Detectar se está na URL do dashboard ou landing page
  useEffect(() => {
    const isApp = isDashboardApp()
    setIsDashboardAppState(isApp)
    
    console.log(`🌐 URL detectada: ${window.location.hostname} → ${isApp ? 'Dashboard App' : 'Landing Page'}`)
    
    // Inicializar autenticação
    initializeAuth()
    
    // Verificar se há parâmetros de cadastro na URL
    if (isApp) {
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get('email')
      const planType = urlParams.get('plan')
      
      if (email && planType) {
        setSignupEmail(email)
        setSignupPlanType(planType)
        setNeedsSignup(true)
        console.log(`📝 Cadastro necessário para: ${email} - Plano: ${planType}`)
      }
    }
  }, [initializeAuth])

  // Se não for dashboard app, mostrar landing page
  if (!isDashboardAppState) {
    return <LandingPage />
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
      <Route path="/signup" element={
        needsSignup ? (
          <SignupForm
            email={signupEmail}
            planType={signupPlanType}
            onSuccess={() => {
              setNeedsSignup(false)
              setSignupEmail('')
              setSignupPlanType('')
            }}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* Rota de setup da API Key */}
      <Route path="/setup" element={
        <ProtectedRoute>
          <ApiKeySetup />
        </ProtectedRoute>
      } />
      
      {/* Rotas protegidas do dashboard */}
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
