import React from 'react'
import { motion } from 'framer-motion'
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
  TrendingDown
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import Logo from './ui/Logo'

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

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e KPIs'
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: Target,
      description: 'Análise de campanhas'
    },
    {
      id: 'conversions',
      label: 'Conversões',
      icon: TrendingUp,
      description: 'Log de conversões'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      description: 'Análises avançadas'
    },
    {
      id: 'funnel',
      label: 'Funil',
      icon: TrendingDown,
      description: 'Funil de conversão'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'API e preferências'
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onToggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white/90 backdrop-blur-sm border-r border-white/20 shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-16' : 'w-72'}
          ${isMobileMenuOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`border-b border-gray-100 ${isSidebarCollapsed ? 'p-4' : 'p-8'}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-4'}`}>
              <Logo 
                size={isSidebarCollapsed ? 'md' : 'md'} 
                showText={!isSidebarCollapsed}
                className="flex-shrink-0"
              />
              {/* Toggle Button */}
              {!isSidebarCollapsed && (
                <button
                  onClick={onToggleSidebar}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${isSidebarCollapsed ? 'p-2' : 'p-6'} space-y-3`}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentSection === item.id
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id)
                    if (isMobileMenuOpen) {
                      onToggleMobileMenu()
                    }
                  }}
                  className={`
                    w-full flex items-center rounded-2xl
                    transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed 
                      ? 'px-2 py-3 justify-center' 
                      : 'px-6 py-4 space-x-4'
                    }
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-lg'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'} flex-shrink-0`} />
                  {!isSidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-gray-100 ${isSidebarCollapsed ? 'p-2' : 'p-6'}`}>
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center justify-center text-sm font-semibold 
                bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 
                rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                ${isSidebarCollapsed ? 'px-2 py-3' : 'px-6 py-4 space-x-3'}
              `}
              title={isSidebarCollapsed ? 'Sair' : undefined}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isSidebarCollapsed && <span>Sair</span>}
            </button>
          </div>

          {/* Toggle Button for Collapsed State */}
          {isSidebarCollapsed && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={onToggleSidebar}
                className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                title="Expandir sidebar"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar 