// 🎨 Configuração centralizada de cores da aplicação

export const COLORS = {
  // Cor principal
  PRIMARY: '#3cd48f',
  
  // Variações da cor principal
  PRIMARY_LIGHT: '#3cd48f/90',
  PRIMARY_LIGHTER: '#3cd48f/80',
  PRIMARY_LIGHTEST: '#3cd48f/70',
  PRIMARY_DARK: '#3cd48f/90',
  
  // Cores de fundo com transparência
  PRIMARY_BG: '#3cd48f/10',
  PRIMARY_BORDER: '#3cd48f/20',
  PRIMARY_TEXT: '#3cd48f/80',
  
  // Cores de estado
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Cores neutras
  WHITE: '#ffffff',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
  
  // Gradientes
  GRADIENT_PRIMARY: 'from-[#3cd48f] to-[#3cd48f]/80',
  GRADIENT_PRIMARY_HOVER: 'from-[#3cd48f]/90 to-[#3cd48f]/70',
  
  // Sombras
  SHADOW_PRIMARY: 'shadow-[#3cd48f]/25',
  SHADOW_PRIMARY_LG: 'shadow-lg shadow-[#3cd48f]/25',
} as const

// Tipos para as cores
export type ColorKey = keyof typeof COLORS
export type ColorValue = typeof COLORS[ColorKey]

// Funções utilitárias para cores
export const getColor = (key: ColorKey): ColorValue => COLORS[key]

// Classes CSS comuns
export const COLOR_CLASSES = {
  // Botões
  BUTTON_PRIMARY: `bg-[${COLORS.PRIMARY}] hover:bg-[${COLORS.PRIMARY_LIGHT}] text-white`,
  BUTTON_PRIMARY_GRADIENT: `bg-gradient-to-r ${COLORS.GRADIENT_PRIMARY} hover:${COLORS.GRADIENT_PRIMARY_HOVER} text-white`,
  
  // Bordas
  BORDER_PRIMARY: `border-[${COLORS.PRIMARY}]`,
  BORDER_PRIMARY_LIGHT: `border-[${COLORS.PRIMARY_BORDER}]`,
  
  // Textos
  TEXT_PRIMARY: `text-[${COLORS.PRIMARY}]`,
  TEXT_PRIMARY_HOVER: `hover:text-[${COLORS.PRIMARY_LIGHT}]`,
  
  // Fundos
  BG_PRIMARY: `bg-[${COLORS.PRIMARY}]`,
  BG_PRIMARY_LIGHT: `bg-[${COLORS.PRIMARY_BG}]`,
  
  // Sombras
  SHADOW_PRIMARY: COLORS.SHADOW_PRIMARY,
  SHADOW_PRIMARY_LG: COLORS.SHADOW_PRIMARY_LG,
} as const

export default COLORS
