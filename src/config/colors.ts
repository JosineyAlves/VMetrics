// 🎨 Configuração centralizada de cores da aplicação

export const COLORS = {
  // Cores principais da VMetrics (baseadas no site oficial)
  PRIMARY: '#6366f1', // Indigo principal da VMetrics
  PRIMARY_LIGHT: '#818cf8',
  PRIMARY_LIGHTER: '#a5b4fc',
  PRIMARY_LIGHTEST: '#c7d2fe',
  PRIMARY_DARK: '#4f46e5',
  PRIMARY_BG: '#f1f5f9',
  PRIMARY_BORDER: '#e2e8f0',
  PRIMARY_TEXT: '#1e293b',
  
  // Cores secundárias
  SECONDARY: '#8b5cf6', // Violeta
  SECONDARY_LIGHT: '#a78bfa',
  SECONDARY_DARK: '#7c3aed',
  
  // Cores de estado
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Cores neutras
  WHITE: '#ffffff',
  GRAY_50: '#f8fafc',
  GRAY_100: '#f1f5f9',
  GRAY_200: '#e2e8f0',
  GRAY_300: '#cbd5e1',
  GRAY_400: '#94a3b8',
  GRAY_500: '#64748b',
  GRAY_600: '#475569',
  GRAY_700: '#334155',
  GRAY_800: '#1e293b',
  GRAY_900: '#0f172a',
  
  // Cores específicas da VMetrics
  VMETRICS_BLUE: '#1e40af',
  VMETRICS_INDIGO: '#6366f1',
  VMETRICS_PURPLE: '#8b5cf6',
  VMETRICS_GRADIENT: 'from-indigo-600 via-purple-600 to-blue-600',
  
  // Gradientes
  GRADIENT_PRIMARY: 'from-[#6366f1] to-[#8b5cf6]',
  GRADIENT_PRIMARY_HOVER: 'from-[#4f46e5] to-[#7c3aed]',
  GRADIENT_SECONDARY: 'from-[#8b5cf6] to-[#6366f1]',
  
  // Sombras
  SHADOW_PRIMARY: 'shadow-[#6366f1]/25',
  SHADOW_PRIMARY_LG: 'shadow-lg shadow-[#6366f1]/25',
  SHADOW_SECONDARY: 'shadow-[#8b5cf6]/25',
} as const

// Tipos para as cores
export type ColorKey = keyof typeof COLORS
export type ColorValue = typeof COLORS[ColorKey]

// Funções utilitárias para cores
export const getColor = (key: ColorKey): ColorValue => COLORS[key]

// Classes CSS comuns
export const COLOR_CLASSES = {
  BUTTON_PRIMARY: `bg-[${COLORS.PRIMARY}] hover:bg-[${COLORS.PRIMARY_DARK}] text-white`,
  BUTTON_PRIMARY_GRADIENT: `bg-gradient-to-r ${COLORS.GRADIENT_PRIMARY} hover:${COLORS.GRADIENT_PRIMARY_HOVER} text-white`,
  BUTTON_SECONDARY: `bg-[${COLORS.SECONDARY}] hover:bg-[${COLORS.SECONDARY_DARK}] text-white`,
  BUTTON_SECONDARY_GRADIENT: `bg-gradient-to-r ${COLORS.GRADIENT_SECONDARY} hover:${COLORS.GRADIENT_SECONDARY} text-white`,
  
  BORDER_PRIMARY: `border-[${COLORS.PRIMARY}]`,
  BORDER_PRIMARY_LIGHT: `border-[${COLORS.PRIMARY_BORDER}]`,
  BORDER_SECONDARY: `border-[${COLORS.SECONDARY}]`,
  
  TEXT_PRIMARY: `text-[${COLORS.PRIMARY}]`,
  TEXT_PRIMARY_HOVER: `hover:text-[${COLORS.PRIMARY_DARK}]`,
  TEXT_SECONDARY: `text-[${COLORS.SECONDARY}]`,
  TEXT_SECONDARY_HOVER: `hover:text-[${COLORS.SECONDARY_DARK}]`,
  
  BG_PRIMARY: `bg-[${COLORS.PRIMARY}]`,
  BG_PRIMARY_LIGHT: `bg-[${COLORS.PRIMARY_BG}]`,
  BG_SECONDARY: `bg-[${COLORS.SECONDARY}]`,
  
  SHADOW_PRIMARY: COLORS.SHADOW_PRIMARY,
  SHADOW_PRIMARY_LG: COLORS.SHADOW_PRIMARY_LG,
  SHADOW_SECONDARY: COLORS.SHADOW_SECONDARY,
} as const

export default COLORS
