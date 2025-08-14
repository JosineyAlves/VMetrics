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
          width: isSidebarCollapsed ? 64 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 lg:relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Logo />
            </motion.div>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
          >
            {isSidebarCollapsed ? (
                           <ChevronRight className="w-4 h-4 text-[#1f1f1f]" />
           ) : (
             <ChevronLeft className="w-4 h-4 text-[#1f1f1f]" />
           )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveSection(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                                 className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                   isActive
                     ? 'bg-[#3cd48f] text-white shadow-lg shadow-[#3cd48f]/25'
                     : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                 }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#1f1f1f]/60 group-hover:text-[#1f1f1f]'}`} />
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 text-left"
                  >
                                         <div className="font-medium text-[#1f1f1f]">{item.label}</div>
                                     <div className={`text-xs ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                   {item.description}
                 </div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-[#1f1f1f]/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-5 h-5 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors" />
            {!isSidebarCollapsed && (
                             <motion.span
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.1 }}
                 className="font-medium text-[#1f1f1f]"
               >
                 Sair
               </motion.span>
            )}
          </button>
        </div>
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
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveSection(item.path)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3cd48f] text-white shadow-lg shadow-[#3cd48f]/25'
                      : 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#1f1f1f]/60'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-lg text-[#1f1f1f]">{item.label}</div>
                                         <div className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                       {item.description}
                     </div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-[#1f1f1f]/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full bg-red-100" />
                             <span className="font-medium text-lg text-[#1f1f1f]">Sair</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Sidebar 