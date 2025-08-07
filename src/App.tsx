import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "./components/LoginForm"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import Campaigns from "./components/Campaigns"
import Conversions from "./components/Conversions"
import Performance from "./components/Performance"
import Funnel from "./components/Funnel"
import Settings from "./components/Settings"
import PeriodDropdown from './components/ui/PeriodDropdown'
import { useDateRangeStore } from './store/dateRange'
import { useAuthStore } from './store/auth'
import { useSidebarStore } from './store/sidebar'
import { RefreshCw } from 'lucide-react'

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const { isCollapsed, toggle } = useSidebarStore()
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  // Adicionar estado para rastrear última atualização:
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // Estado global de datas
  const { selectedPeriod, customRange, setSelectedPeriod, setCustomRange } = useDateRangeStore()

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
      // Limpar cache do localStorage se existir
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('campaigns') || 
        key.includes('dashboard') || 
        key.includes('performance') || 
        key.includes('funnel') ||
        key.includes('conversions')
      )
      cacheKeys.forEach(key => {
        console.log('🗑️ [REFRESH] Removendo cache:', key)
        localStorage.removeItem(key)
      })
      
      // Forçar re-render dos componentes atuais para buscar dados atualizados
      const event = new CustomEvent('forceRefresh', { detail: { section: currentSection, forceNewData: true } })
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



  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />
      case 'campaigns':
        return <Campaigns />
      case 'conversions':
        return <Conversions />
      case 'performance':
        return <Performance />
      case 'funnel':
        return <Funnel />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
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
  // Filtros agora só nas telas específicas

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={toggle}
      />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : ''}`}>
        {/* Barra global fixa */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-8 pt-6 pb-2 bg-white/80 sticky top-0 z-20">
          {/* Título da tela à esquerda */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-800">{sectionTitle}</div>
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
                className="inline-flex items-center px-4 py-2 rounded-xl border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition disabled:opacity-50"
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
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App 