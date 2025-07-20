import React from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Users, Eye, MousePointer, ShoppingCart, Target } from 'lucide-react'

interface FunnelData {
  stage: string
  value: number
  percentage: number
  icon: React.ReactNode
  color: string
}

interface FunnelChartProps {
  data: {
    prelp_views?: number
    lp_views?: number
    offer_views?: number
    conversions?: number
  }
  campaignSelector?: React.ReactNode
  selectedCampaignName?: string
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data, campaignSelector, selectedCampaignName }) => {
  const calculateFunnelData = (): FunnelData[] => {
    const prelpViews = data.prelp_views || 0
    const lpViews = data.lp_views || 0
    const offerViews = data.offer_views || 0
    const conversions = data.conversions || 0

    // Calcular taxas de conversão
    const prelpToLpRate = prelpViews > 0 ? (lpViews / prelpViews) * 100 : 0
    const lpToOfferRate = lpViews > 0 ? (offerViews / lpViews) * 100 : 0
    const offerToConversionRate = offerViews > 0 ? (conversions / offerViews) * 100 : 0

    return [
      {
        stage: 'Pre-LP',
        value: prelpViews,
        percentage: 100,
        icon: <Eye className="w-4 h-4" />,
        color: 'bg-blue-500'
      },
      {
        stage: 'LP',
        value: lpViews,
        percentage: prelpToLpRate,
        icon: <MousePointer className="w-4 h-4" />,
        color: 'bg-green-500'
      },
      {
        stage: 'Offer',
        value: offerViews,
        percentage: lpToOfferRate,
        icon: <ShoppingCart className="w-4 h-4" />,
        color: 'bg-purple-500'
      },
      {
        stage: 'Conversion',
        value: conversions,
        percentage: offerToConversionRate,
        icon: <Target className="w-4 h-4" />,
        color: 'bg-orange-500'
      }
    ]
  }

  const funnelData = calculateFunnelData()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Funil de Marketing</h3>
          {selectedCampaignName && selectedCampaignName !== 'Todas' && (
            <span className="text-sm font-medium text-blue-600 bg-blue-50 rounded-xl px-3 py-1 ml-1">{selectedCampaignName}</span>
          )}
        </div>
        {campaignSelector && (
          <div>{campaignSelector}</div>
        )}
      </div>

      <div className="space-y-3">
        {funnelData.map((item, index) => (
          <motion.div
            key={item.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            {/* Etapa do Funil */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-lg ${item.color} text-white`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.stage}</h4>
                  <p className="text-xs text-gray-600">
                    {item.value.toLocaleString('pt-BR')} pessoas
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {index === 0 ? 'Base' : `Taxa de conversão`}
                </div>
              </div>
            </div>

            {/* Seta para próxima etapa (exceto na última) */}
            {index < funnelData.length - 1 && (
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-4 bg-gray-300 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-gray-300 rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Resumo do Funil */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Taxa de Conversão Total</h4>
            <p className="text-xs text-gray-600">
              Do início ao fim do funil
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {funnelData.length > 0 && funnelData[funnelData.length - 1].value > 0
                ? ((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(2)
                : '0.00'}%
            </div>
            <div className="text-xs text-gray-500">
              Conversão total
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs">Pre-LP: Visualizações da pré-landing page</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs">LP: Visualizações da landing page</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-xs">Offer: Visualizações da oferta</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-xs">Conversion: Conversões aprovadas</span>
        </div>
      </div>
    </motion.div>
  )
}

export default FunnelChart 