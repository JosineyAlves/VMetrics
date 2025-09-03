import React from 'react'
import { motion } from 'framer-motion'
import { Key, X, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

interface ApiKeyBannerProps {
  onDismiss?: () => void
}

const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ onDismiss }) => {
  const navigate = useNavigate()

  const handleConfigure = () => {
    navigate('/settings')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white p-6 rounded-2xl shadow-lg border border-[#3cd48f]/20 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">
              Configure sua API Key do RedTrack
            </h3>
            <p className="text-sm text-white/90">
              Para começar a usar o VMetrics, você precisa configurar sua API Key do RedTrack.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleConfigure}
            className="bg-white text-[#3cd48f] hover:bg-white/90 font-semibold px-4 py-2 rounded-xl shadow-sm"
          >
            <Key className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-white/10 rounded-xl">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Como obter sua API Key:</p>
            <ol className="space-y-1 text-white/90">
              <li>1. Acesse sua conta RedTrack em <a href="https://redtrack.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">redtrack.io</a></li>
              <li>2. Vá em <strong>Tools → Integrations → General</strong></li>
              <li>3. Clique em <strong>Generate New Key</strong> ou use uma chave existente</li>
              <li>4. Copie a chave gerada e configure no VMetrics</li>
            </ol>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ApiKeyBanner
