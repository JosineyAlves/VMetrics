import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bug, Lightbulb, HelpCircle, MessageCircle } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

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

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<string>('')

  const feedbackTypes = [
    {
      id: 'support',
      title: 'Suporte Técnico',
      description: 'Problemas, dúvidas ou ajuda',
      icon: HelpCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      template: '🆘 SUPORTE TÉCNICO\n\n❓ Dúvida/Problema: \n📱 Tela: \n🔍 Descrição: \n\n'
    },
    {
      id: 'bug',
      title: 'Reportar Bug',
      description: 'Problema ou erro encontrado',
      icon: Bug,
      color: 'bg-red-500 hover:bg-red-600',
      template: '🐛 BUG REPORT\n\n📱 Tela: \n🔍 Descrição: \n📋 Passos para reproduzir: \n\n'
    },
    {
      id: 'feature',
      title: 'Sugerir Melhoria',
      description: 'Nova funcionalidade ou melhoria',
      icon: Lightbulb,
      color: 'bg-green-500 hover:bg-green-600',
      template: '💡 SUGESTÃO DE MELHORIA\n\n🎯 Funcionalidade: \n📝 Descrição: \n🎨 Como seria útil: \n\n'
    }
  ]

  const handleSendFeedback = (type: string) => {
    const selected = feedbackTypes.find(t => t.id === type)
    if (selected) {
      // Limpar a mensagem e codificar corretamente
      const cleanMessage = selected.template.trim()
      const encodedMessage = encodeURIComponent(cleanMessage)
      
      // Construir URL do WhatsApp
      const whatsappUrl = `https://wa.me/5533987523047&text=${encodedMessage}`
      
      console.log('🔍 [FEEDBACK] Mensagem original:', cleanMessage)
      console.log('🔍 [FEEDBACK] Mensagem codificada:', encodedMessage)
      console.log('🔍 [FEEDBACK] URL final:', whatsappUrl)
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Precisa de ajuda?</h2>
                    <p className="text-sm text-gray-600">Escolha uma das opções abaixo:</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => handleSendFeedback(type.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${type.color} text-white shadow-lg hover:shadow-xl`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-lg">{type.title}</h3>
                          <p className="text-sm text-white/90">{type.description}</p>
                        </div>
                        <MessageCircle className="w-5 h-5 text-white/80" />
                      </motion.button>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500">
                    💡 <strong>Dica:</strong> Se usar WhatsApp Desktop, copie a mensagem e cole no chat
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FeedbackModal
