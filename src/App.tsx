import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "./components/LoginForm"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import Campaigns from "./components/Campaigns"
import Conversions from "./components/Conversions"
import Geographic from "./components/Geographic"
import Settings from "./components/Settings"
import { useAuthStore } from './store/auth'

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />
      case 'campaigns':
        return <Campaigns />
      case 'conversions':
        return <Conversions />
      case 'geographic':
        return <Geographic />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

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
      />
      
      <main className="flex-1 overflow-auto">
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