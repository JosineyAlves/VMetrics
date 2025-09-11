import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Globe,
  Settings,
  BarChart3,
  Filter,
  LogOut,
  DollarSign
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import Logo from './ui/Logo'

interface MobileHeaderProps {
  isMenuOpen: boolean
  onToggleMenu: () => void
  currentSection: string
  onSectionChange: (section: string) => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  isMenuOpen,
  onToggleMenu,
  currentSection,
  onSectionChange
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
      description: 'Gestão de campanhas',
      path: '/campaigns'
    },
    {
      id: 'conversions',
      label: 'Conversões',
      icon: TrendingUp,
      description: 'Análise de conversões',
      path: '/conversions'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      description: 'Análise de performance',
      path: '/performance'
    },
    {
      id: 'funnel',
      label: 'Funil',
      icon: Filter,
      description: 'Análise de funil',
      path: '/funnel'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema',
      path: '/settings'
    }
  ]

  const handleMenuClick = (item: typeof menuItems[0]) => {
    onSectionChange(item.id)
    navigate(item.path)
    onToggleMenu() // Fechar menu após seleção
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    onToggleMenu()
  }

  const getSectionTitle = () => {
    const item = menuItems.find(item => item.id === currentSection)
    return item ? item.label : 'Dashboard'
  }

  return (
    <>
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-8 w-auto" />
          </div>

          {/* Botão Hambúrguer */}
          <button
            onClick={onToggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Título da seção atual */}
        <div className="px-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-800">
            {getSectionTitle()}
          </h1>
        </div>
      </div>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onToggleMenu}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {/* Header do Menu */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Logo className="h-8 w-auto" />
                </div>
                <button
                  onClick={onToggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navegação */}
              <nav className="p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentSection === item.id

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleMenuClick(item)}
                        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#3cd48f] text-white shadow-lg transform scale-[1.02]'
                            : 'text-gray-700 hover:bg-gray-100 hover:scale-[1.01]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="ml-3 text-left">
                          <div className="font-semibold">{item.label}</div>
                          <div className={`text-sm ${
                            isActive ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Divisor */}
                <div className="my-6 border-t border-gray-200" />

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-lg bg-red-100">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-semibold">Sair</div>
                    <div className="text-sm text-red-500">Fazer logout</div>
                  </div>
                </motion.button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileHeader
