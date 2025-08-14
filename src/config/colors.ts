// Arquivo centralizado de cores do VMetrics
// Todas as cores devem ser referenciadas através deste arquivo

export const COLORS = {
  // Cores principais
  primary: '#3cd48f',
  primaryLight: '#3cd48f/80',
  primaryDark: '#3cd48f/90',
  primaryVeryLight: '#3cd48f/10',
  primaryVeryLightBorder: '#3cd48f/20',
  
  // Cores de texto
  textPrimary: '#1f1f1f',
  textSecondary: '#1f1f1f/70',
  textTertiary: '#1f1f1f/60',
  textWhite: '#ffffff',
  textWhiteSecondary: '#ffffff/90',
  
  // Cores de fundo
  background: '#ffffff',
  backgroundLight: '#f8fafc',
  backgroundCard: '#ffffff/90',
  backgroundCardHover: '#ffffff/95',
  
  // Cores de borda
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderPrimary: '#3cd48f/20',
  
  // Cores de estado
  success: '#3cd48f',
  successLight: '#3cd48f/10',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fef2f2',
  
  // Cores de gráficos
  chartPrimary: '#3cd48f',
  chartSecondary: '#3cd48f/80',
  chartTertiary: '#3cd48f/60',
  
  // Cores de hover e interação
  hover: '#3cd48f/5',
  hoverPrimary: '#3cd48f/10',
  focus: '#3cd48f/40',
  
  // Cores de sombra
  shadow: '#3cd48f/25',
  shadowLight: '#3cd48f/10',
} as const

export type ColorKey = keyof typeof COLORS
export type ColorValue = typeof COLORS[ColorKey]

// Função para obter cor com fallback
export const getColor = (key: ColorKey, fallback?: string): string => {
  return COLORS[key] || fallback || COLORS.primary
}

// Classes CSS utilitárias para cores
export const COLOR_CLASSES = {
  // Textos
  textPrimary: 'text-[#1f1f1f]',
  textSecondary: 'text-[#1f1f1f]/70',
  textTertiary: 'text-[#1f1f1f]/60',
  textWhite: 'text-white',
  textWhiteSecondary: 'text-white/90',
  
  // Backgrounds
  bgPrimary: 'bg-[#3cd48f]',
  bgPrimaryLight: 'bg-[#3cd48f]/80',
  bgPrimaryDark: 'bg-[#3cd48f]/90',
  bgPrimaryVeryLight: 'bg-[#3cd48f]/10',
  bgPrimaryHover: 'hover:bg-[#3cd48f]/90',
  bgPrimaryLightHover: 'hover:bg-[#3cd48f]/5',
  
  // Bordas
  borderPrimary: 'border-[#3cd48f]',
  borderPrimaryLight: 'border-[#3cd48f]/20',
  borderPrimaryFocus: 'focus:border-[#3cd48f]',
  
  // Focus e Ring
  focusRing: 'focus:ring-2 focus:ring-[#3cd48f] focus:ring-[#3cd48f]/40',
  
  // Gradientes
  gradientPrimary: 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80',
  gradientPrimaryHover: 'hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70',
  
  // Sombras
  shadowPrimary: 'shadow-lg shadow-[#3cd48f]/25',
  shadowPrimaryLight: 'shadow-[#3cd48f]/10',
  
  // Estados ativos
  active: 'bg-[#3cd48f] text-white shadow-lg shadow-[#3cd48f]/25',
  activeText: 'text-white',
  activeIcon: 'text-white',
  
  // Estados inativos
  inactive: 'text-[#1f1f1f]/70 hover:bg-white/50 hover:text-[#1f1f1f]',
  inactiveIcon: 'text-[#1f1f1f]/60',
  
  // Hover states
  hover: 'hover:bg-white/50 hover:text-[#1f1f1f]',
  hoverPrimary: 'hover:bg-[#3cd48f]/10',
} as const

export default COLORS

