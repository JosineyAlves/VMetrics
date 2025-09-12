import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Globe,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Filter,
  LogOut,
  DollarSign
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import Logo from './ui/Logo'

// Componente de ícone WhatsApp personalizado
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
)

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSection, 
  onSectionChange, 
  isMobileMenuOpen, 
  onToggleMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e KPIs',
      path: '/dashboard'
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: Target,
      description: 'Análise de campanhas',
      path: '/campaigns'
    },
    {
      id: 'conversions',
      label: 'Conversões',
      icon: DollarSign,
      description: 'Log de conversões',
      path: '/conversions'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      description: 'Análises avançadas',
      path: '/performance'
    },
    {
      id: 'funnel',
      label: 'Funil',
      icon: Filter,
      description: 'Funil de conversão',
      path: '/funnel'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'API e preferências',
      path: '/settings'
    },
    {
      id: 'support',
      label: 'Suporte',
      icon: WhatsAppIcon,
      description: 'Suporte via WhatsApp',
      path: 'https://api.whatsapp.com/send?phone=5533987523047',
      isExternal: true
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSectionChange = (section: string) => {
    const menuItem = menuItems.find(item => item.id === section)
    
    // Se for um link externo, abrir em nova aba
    if (menuItem?.isExternal) {
      window.open(menuItem.path, '_blank')
      // Fechar menu mobile após clicar
      if (isMobileMenuOpen) {
        onToggleMobileMenu()
      }
      return
    }
    
    onSectionChange(section)
    // Fechar menu mobile após navegação
    if (isMobileMenuOpen) {
      onToggleMobileMenu()
    }
  }

  const isActiveSection = (sectionPath: string) => {
    // Links externos nunca são considerados ativos
    if (sectionPath.startsWith('http')) {
      return false
    }
    return location.pathname === sectionPath
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={onToggleMobileMenu}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 70 : 240,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-2xl z-30 lg:relative flex-col"
        style={{
          maxHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          {isSidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center"
            >
              <img 
                src="/assets/icons/favicon.svg" 
                alt="VMetrics" 
                className="w-8 h-8"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <Logo size="lg" showText={false} className="w-full" />
            </motion.div>
          )}
          
          {!isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#1f1f1f]" />
            </button>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav 
          className={`flex-1 overflow-y-auto p-4 space-y-2 ${isSidebarCollapsed ? 'px-2' : ''}`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#3cd48f #f3f4f6'
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveSection(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                  item.id === 'support'
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                    : isActive
                    ? 'bg-[#3cd48f] shadow-lg shadow-[#3cd48f]/25'
                    : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${
                  item.id === 'support' 
                    ? 'text-white' 
                    : 'text-[#1f1f1f]/60 group-hover:text-[#1f1f1f]'
                }`} />
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-[#1f1f1f]">{item.label}</div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className={`p-4 border-t border-white/10 flex-shrink-0 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <motion.button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 group shadow-md hover:shadow-lg ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-full">
              {isSidebarCollapsed ? (
                <LogOut className="w-5 h-5 text-white" />
              ) : (
                <span className="text-white font-medium">Sair</span>
              )}
            </div>
          </motion.button>
        </div>

        {/* Toggle Button when collapsed */}
        {isSidebarCollapsed && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors shadow-md"
            >
              <ChevronRight className="w-4 h-4 text-[#1f1f1f]" />
            </button>
          </div>
        )}

        {/* Custom scrollbar styles for webkit browsers */}
        <style>{`
          nav::-webkit-scrollbar {
            width: 6px;
          }
          nav::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 3px;
          }
          nav::-webkit-scrollbar-thumb {
            background: #3cd48f;
            border-radius: 3px;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: #2bb875;
          }
        `}</style>
      </motion.div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-2xl z-50"
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Logo />
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            >
              <X className="w-6 h-6 text-[#1f1f1f]" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-6 space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveSection(item.path)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    item.id === 'support'
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                      : isActive
                      ? 'bg-[#3cd48f] text-white shadow-lg shadow-[#3cd48f]/25'
                      : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                  }`}
                >
                  <Icon className={`w-7 h-7 ${
                    item.id === 'support' || isActive ? 'text-white' : 'text-[#1f1f1f]/60'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-lg ${
                      item.id === 'support' ? 'text-white' : 'text-[#1f1f1f]'
                    }`}>{item.label}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="font-medium text-lg text-white">Sair</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Sidebar 