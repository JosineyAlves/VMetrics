import React, { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'gradient'
  showText?: boolean
  className?: string
  showIconOnly?: boolean // Nova prop para mostrar apenas o ícone
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showText = false, // Por padrão, não mostrar texto
  className = '',
  showIconOnly = false // Por padrão, mostrar logo completa
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-16 h-4',    // Proporção 4:1 para logo retangular
    md: 'w-12 h-12',   // Quadrado para favicon quando colapsado
    lg: 'w-32 h-8',    // Proporção 4:1 para logo retangular
    xl: 'w-40 h-10'    // Proporção 4:1 para logo retangular
  }

  const iconSizes = {
    sm: 'w-16 h-4',    // Proporção 4:1 para logo retangular
    md: 'w-12 h-12',   // Quadrado para favicon quando colapsado
    lg: 'w-32 h-8',    // Proporção 4:1 para logo retangular
    xl: 'w-40 h-10'    // Proporção 4:1 para logo retangular
  }

  const variantClasses = {
    default: '',
    white: '',
    gradient: ''
  }

  const textClasses = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image - Sem background */}
      <div className={`${sizeClasses[size]} flex items-center justify-center flex-shrink-0`}>
        {!imageError ? (
          <img
            src={showIconOnly ? "/assets/icons/favicon.svg" : "/assets/images/logo.svg"}
            alt={showIconOnly ? "VMetrics Icon" : "VMetrics Logo"}
            className={`${iconSizes[size]} object-contain`}
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback se a imagem falhar
          <div className={`${iconSizes[size]} bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">VM</span>
          </div>
        )}
      </div>

      {/* Logo Text - Só mostra se showText for true */}
      {showText && (
        <div className="ml-3">
          <h1 className={`text-xl font-bold ${textClasses[variant]}`}>
            VMetrics
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Dashboard Integrado
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo
