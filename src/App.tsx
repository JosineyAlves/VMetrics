import React, { useState, useRef, useEffect } from 'react'
// ✅ VALIDAÇÃO DE SETUP RESTAURADA
// As validações que redirecionam para /setup foram restauradas para garantir segurança
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "./components/LoginForm"
import SignupForm from "./components/SignupForm"
import ForgotPasswordForm from "./components/ForgotPasswordForm"
import ResetPasswordForm from "./components/ResetPasswordForm"

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
import { RefreshCw, Play, Pause } from 'lucide-react'
import { isDashboardApp } from './config/urls'
import usePageTitle from './hooks/usePageTitle'

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, apiKey, isLoading } = useAuthStore()
  const location = useLocation()
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 animate-spin border-2 border-[#3cd48f] border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    // Redirecionar para login mantendo a URL de destino
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  

  
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Função para formatar tempo desde última atualização
  const getTimeSinceLastUpdate = () => {
    if (!lastUpdateTime) return null
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Agora mesmo'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    } else {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Há ${hours} hora${hours > 1 ? 's' : ''}`
    }
  }

  // Função para forçar atualização de dados
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Forçar re-render dos componentes atuais para buscar dados atualizados
      const event = new CustomEvent('forceRefresh', { detail: { section: currentSection } })
      window.dispatchEvent(event)
      
      // Simular delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar timestamp da última atualização
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setIsRefreshing(false)
    }
  }



  // Definir o título da tela selecionada
  const sectionTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    campaigns: 'Campanhas',
    conversions: 'Conversões',
    performance: 'Performance',
    funnel: 'Funil',
    settings: 'Configurações'
  }
  const sectionTitle = sectionTitles[currentSection] || ''

  // Definir quais botões mostrar por tela
  const showRefresh = ['dashboard', 'campaigns', 'conversions', 'performance', 'funnel'].includes(currentSection)


  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={(section) => navigate(`/${section}`)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={toggle}
      />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : ''}`}>
        {/* Barra global fixa */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-8 pt-6 pb-2 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
          {/* Título da tela à esquerda */}
          <div className="flex items-center gap-3">
                         <div className="text-2xl font-bold text-[#1f1f1f]">{sectionTitle}</div>
            {lastUpdateTime && (
              <div className="text-sm text-gray-500">
                Atualizado {getTimeSinceLastUpdate()}
              </div>
            )}
          </div>
          {/* Ações e seletor à direita */}
          <div className="flex items-center gap-3">
            {/* Não mostrar PeriodDropdown na tela de configurações */}
            {currentSection !== 'settings' && (
              <PeriodDropdown
                value={selectedPeriod}
                customRange={customRange}
                onChange={(period, range) => {
                  setSelectedPeriod(period)
                  if (period === 'custom' && range) setCustomRange(range)
                }}
              />
            )}
            {showRefresh && (
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 rounded-xl border border-[#3cd48f] text-[#3cd48f] font-semibold hover:bg-[#3cd48f]/10 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </button>
            )}
            
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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