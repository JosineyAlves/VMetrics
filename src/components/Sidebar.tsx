import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Globe,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useAuthStore } from '../store/auth'

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSection, 
  onSectionChange, 
  isMobileMenuOpen, 
  onToggleMobileMenu 
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
      id: 'geographic',
      label: 'Geografia',
      icon: Globe,
      description: 'Performance regional'
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
          w-72 bg-white/90 backdrop-blur-sm border-r border-white/20 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TrackView
                </h1>
                <p className="text-sm text-gray-500 font-medium">RedTrack Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-3">
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
                    w-full flex items-center space-x-4 px-6 py-4 rounded-2xl
                    transition-all duration-300 ease-in-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-lg'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar 