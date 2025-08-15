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
  TrendingDown,
  LogOut
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
      icon: TrendingUp,
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
      icon: TrendingDown,
      description: 'Funil de conversão',
      path: '/funnel'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'API e preferências',
      path: '/settings'
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    // Fechar menu mobile após navegação
    if (isMobileMenuOpen) {
      onToggleMobileMenu()
    }
  }

  const isActiveSection = (sectionPath: string) => {
    return location.pathname === sectionPath
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-[#1f1f1f]" /> : <Menu className="w-6 h-6 text-[#1f1f1f]" />}
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
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 80 : 300,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 lg:relative"
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-white/10 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
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

        {/* Navigation */}
        <nav className={`flex-1 p-6 space-y-3 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveSection(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#3cd48f] shadow-lg shadow-[#3cd48f]/25'
                    : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-6 h-6 text-[#1f1f1f]/60 group-hover:text-[#1f1f1f]" />
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

        {/* Footer */}
        <div className={`p-6 border-t border-white/10 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 group shadow-md hover:shadow-lg ${
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
          </button>
        </div>

        {/* Toggle Button when collapsed */}
        {isSidebarCollapsed && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors shadow-md"
            >
              <ChevronRight className="w-4 h-4 text-[#1f1f1f]" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50"
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
                    isActive
                      ? 'bg-[#3cd48f] text-white shadow-lg shadow-[#3cd48f]/25'
                      : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                  }`}
                >
                  <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-[#1f1f1f]/60'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-lg text-[#1f1f1f]">{item.label}</div>
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