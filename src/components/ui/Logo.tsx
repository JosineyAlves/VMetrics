import React, { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'gradient'
  showText?: boolean
  className?: string
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showText = true,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  }

  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600',
    white: 'bg-white',
    gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  }

  const textClasses = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
        {!imageError ? (
          <img
            src="/assets/images/logo.svg"
            alt="VMetrics Logo"
            className={`${iconSizes[size]} w-full h-full object-contain p-1`}
            onError={handleImageError}
          />
        ) : (
          <div className={`${iconSizes[size]} ${variant === 'white' ? 'text-blue-600' : 'text-white'} text-center`}>
            🔑
          </div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="ml-3">
          <h1 className={`${textSizes[size]} font-bold ${textClasses[variant]}`}>
            VMetrics
          </h1>
          <p className={`text-xs ${variant === 'white' ? 'text-white/80' : 'text-gray-500'} font-medium`}>
            Dashboard Integrado
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo
