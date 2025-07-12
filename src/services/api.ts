const BASE_URL = 'https://api.redtrack.io'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface Conversion {
  id: string
  click_id: string
  date: string
  campaign: string
  payout: number
  type: 'lead' | 'sale' | 'upsell'
  country: string
  source: string
}

export interface Campaign {
  id: string
  name: string
  source: string
  status: 'active' | 'paused' | 'inactive'
  spend: number
  revenue: number
  cpa: number
  roi: number
  conversions: number
  clicks: number
  impressions: number
}

export interface ReportData {
  clicks: number
  conversions: number
  spend: number
  revenue: number
  profit: number // Lucro
  roi: number
  cpa: number
  cpl: number
  impressions: number
  // Novas métricas do RedTrack
  visible_impressions: number
  unique_clicks: number
  ctr: number
  prelp_views: number
  prelp_clicks: number
  prelp_click_ctr: number
  lp_ctr: number
  lp_click_ctr: number
  conversion_cr: number
  all_conversions: number
  all_conversions_cr: number
  approved: number
  ar: number
  pending: number
  pr: number
  declined: number
  dr: number
  other: number
  or: number
  transactions: number
  tr: number
  epv: number
  conversion_revenue: number
  publisher_revenue: number
  publisher_revenue_legacy: number
  conversion_roi: number
  cpc: number
  conversion_cpa: number
  total_cpa: number
  total_aov: number
  conversion_aov: number
  cpt: number
  eplpc: number
  epuc: number
  listicle_epv: number
  // ROAS variations
  roas_percentage: number
  conversion_roas: number
  conversion_roas_percentage: number
  conversion_profit: number
  epc_roi: number
}

export interface CountryData {
  country: string
  clicks: number
  conversions: number
  revenue: number
}

export interface FunnelData {
  stage: string
  value: number
  percentage: number
}

class RedTrackAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key inválida. Verifique sua chave de API.')
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Verifique as permissões da sua conta.')
        } else if (response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique a URL da API.')
        } else {
          throw new Error(`Erro da API: ${response.status} ${response.statusText}`)
        }
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // CORS error or network issue
        throw new Error('Erro de conexão. A API do RedTrack não permite requisições de localhost devido a restrições de CORS. Use dados simulados para demonstração.')
      }
      throw error
    }
  }

  // Test API key
  async testConnection(): Promise<boolean> {
    try {
      // Para chaves de teste, sempre retorna true
      if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key') {
        return true
      }
      
      // Em desenvolvimento, simula sucesso para evitar CORS
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Modo desenvolvimento detectado. Usando dados simulados para evitar CORS.')
        return true
      }
      
      await this.request('/me/settings')
      return true
    } catch (error) {
      console.error('API Connection Test Error:', error)
      return false
    }
  }

  // Get main dashboard data
  async getDashboardData(params?: {
    date_from?: string
    date_to?: string
    utm_source?: string
    traffic_channel?: string
    country?: string
    device?: string
    browser?: string
    os?: string
  }): Promise<ReportData> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      
      // Data base: 15 de janeiro de 2024 (não utilizada)
      // const baseDate = new Date('2024-01-15')
      const today = new Date()
      
      // Calcular dias desde a data base
      // const daysSinceBase = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Função para gerar dados baseados no período
      const generatePeriodData = (period: string) => {
        const periodDays = {
          'max': 365,      // 1 ano
          'today': 1,      // 1 dia
          'yesterday': 1,  // 1 dia (mas dia anterior)
          '7d': 7,         // 7 dias
          'this_month': 30, // ~30 dias
          'last_month': 30, // ~30 dias
          'custom': 7      // padrão para custom
        }
        
        const days = periodDays[period as keyof typeof periodDays] || 7
        
        // Base de dados realista para vendas nos EUA (em USD)
        const baseData = {
          clicks: 12500,
          conversions: 850,
          spend: 18500.00,
          revenue: 42500.00,
          roi: 229.7,
          cpa: 21.76,
          impressions: 75000,
          ctr: 16.7,
          conversion_rate: 6.8
        }
        
        // Multiplicador baseado no número de dias
        const multiplier = days / 7 // Normalizado para 7 dias
        
        // Para "yesterday", usar dados ligeiramente diferentes (menor volume)
        if (period === 'yesterday') {
          return {
            clicks: Math.round(baseData.clicks * multiplier * 0.85), // 15% menos que hoje
            conversions: Math.round(baseData.conversions * multiplier * 0.85),
            spend: baseData.spend * multiplier * 0.85,
            revenue: baseData.revenue * multiplier * 0.85,
            roi: baseData.roi * 0.95, // ROI ligeiramente menor
            cpa: baseData.cpa * 1.05, // CPA ligeiramente maior
            impressions: Math.round(baseData.impressions * multiplier * 0.85),
            ctr: baseData.ctr * 0.95,
            conversion_rate: baseData.conversion_rate * 0.95
          }
        }
        
        return {
          clicks: Math.round(baseData.clicks * multiplier),
          conversions: Math.round(baseData.conversions * multiplier),
          spend: baseData.spend * multiplier,
          revenue: baseData.revenue * multiplier,
          roi: baseData.roi,
          cpa: baseData.cpa,
          impressions: Math.round(baseData.impressions * multiplier),
          ctr: baseData.ctr,
          conversion_rate: baseData.conversion_rate
        }
      }
      
      // Determinar período baseado nos parâmetros
      let period = '7d'
      if (params?.date_from && params?.date_to) {
        const start = new Date(params.date_from)
        const end = new Date(params.date_to)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        period = days === 1 ? 'today' : days <= 7 ? '7d' : 'this_month'
      }
      
      let baseData = generatePeriodData(period)
      
      // Variação por canal de tráfego (dados realistas dos EUA)
      const channelMap: Record<string, any> = {
        facebook: { 
          clicks: 8500, conversions: 578, spend: 12500, revenue: 28900, roi: 231.2, cpa: 21.6, impressions: 51000,
          device_distribution: { mobile: 0.65, desktop: 0.35 },
          hour_distribution: { '9-12': 0.25, '12-15': 0.30, '15-18': 0.25, '18-21': 0.20 }
        },
        google: { 
          clicks: 6000, conversions: 408, spend: 9800, revenue: 22600, roi: 230.6, cpa: 24.0, impressions: 36000,
          device_distribution: { mobile: 0.45, desktop: 0.55 },
          hour_distribution: { '9-12': 0.20, '12-15': 0.25, '15-18': 0.30, '18-21': 0.25 }
        },
        tiktok: { 
          clicks: 4000, conversions: 272, spend: 6500, revenue: 15000, roi: 230.8, cpa: 23.9, impressions: 24000,
          device_distribution: { mobile: 0.85, desktop: 0.15 },
          hour_distribution: { '9-12': 0.15, '12-15': 0.20, '15-18': 0.25, '18-21': 0.40 }
        },
        taboola: { 
          clicks: 3000, conversions: 204, spend: 4900, revenue: 11300, roi: 230.6, cpa: 24.0, impressions: 18000,
          device_distribution: { mobile: 0.40, desktop: 0.60 },
          hour_distribution: { '9-12': 0.30, '12-15': 0.25, '15-18': 0.25, '18-21': 0.20 }
        },
        outbrain: { 
          clicks: 2500, conversions: 170, spend: 4100, revenue: 9400, roi: 229.3, cpa: 24.1, impressions: 15000,
          device_distribution: { mobile: 0.35, desktop: 0.65 },
          hour_distribution: { '9-12': 0.35, '12-15': 0.25, '15-18': 0.25, '18-21': 0.15 }
        }
      }
      
      const channel = (params?.traffic_channel || '').toLowerCase()
      if (channel && channelMap[channel]) {
        baseData = { ...baseData, ...channelMap[channel] }
      }
      
      // Variação por dispositivo
      if (params?.device) {
        const deviceMultiplier = params.device === 'mobile' ? 1.2 : 0.8
        baseData = {
          ...baseData,
          clicks: Math.round(baseData.clicks * deviceMultiplier),
          conversions: Math.round(baseData.conversions * deviceMultiplier),
          spend: baseData.spend * deviceMultiplier,
          revenue: baseData.revenue * deviceMultiplier
        }
      }
      
      // Variação por país (EUA como padrão)
      if (params?.country) {
        const countryMultiplier = params.country.toLowerCase() === 'united states' ? 1.0 : 0.7
        baseData = {
          ...baseData,
          clicks: Math.round(baseData.clicks * countryMultiplier),
          conversions: Math.round(baseData.conversions * countryMultiplier),
          spend: baseData.spend * countryMultiplier,
          revenue: baseData.revenue * countryMultiplier
        }
      }
      
      // Variação por navegador
      if (params?.browser) {
        const browserMultiplier = params.browser.toLowerCase() === 'chrome' ? 1.1 : 0.9
        baseData = {
          ...baseData,
          conversions: Math.round(baseData.conversions * browserMultiplier)
        }
      }
      
      // Variação por SO
      if (params?.os) {
        const osMultiplier = params.os.toLowerCase() === 'ios' ? 1.15 : 0.95
        baseData = {
          ...baseData,
          spend: baseData.spend * osMultiplier
        }
      }
      
      // Variação por UTM source
      if (params?.utm_source) {
        baseData = {
          ...baseData,
          revenue: baseData.revenue * 1.1,
          conversions: Math.round(baseData.conversions * 1.05)
        }
      }
      
      // Variação por data específica
      if (params?.date_from || params?.date_to) {
        const dateMultiplier = 0.8 + (Math.random() * 0.4) // 0.8 a 1.2
        baseData = {
          ...baseData,
          clicks: Math.round(baseData.clicks * dateMultiplier),
          conversions: Math.round(baseData.conversions * dateMultiplier),
          spend: baseData.spend * dateMultiplier,
          revenue: baseData.revenue * dateMultiplier
        }
      }

      // KPIs derivados
      const profit = baseData.revenue - baseData.spend
      const ctr = baseData.impressions ? (baseData.clicks / baseData.impressions) * 100 : 0
      const conversion_rate = baseData.clicks ? (baseData.conversions / baseData.clicks) * 100 : 0
      const cpl = baseData.conversions ? baseData.spend / baseData.conversions : 0

      return {
        clicks: baseData.clicks,
        conversions: baseData.conversions,
        spend: baseData.spend,
        revenue: baseData.revenue,
        profit,
        roi: baseData.roi,
        cpa: baseData.cpa,
        cpl,
        impressions: baseData.impressions,
        visible_impressions: baseData.impressions,
        unique_clicks: Math.round(baseData.clicks * 0.8),
        ctr,
        prelp_views: Math.round(baseData.impressions * 0.2),
        prelp_clicks: Math.round(baseData.clicks * 0.2),
        prelp_click_ctr: 0.5,
        lp_ctr: 0.3,
        lp_click_ctr: 0.2,
        conversion_cr: conversion_rate,
        all_conversions: baseData.conversions,
        all_conversions_cr: conversion_rate,
        approved: Math.round(baseData.conversions * 0.8),
        ar: 10,
        pending: Math.round(baseData.conversions * 0.1),
        pr: 5,
        declined: Math.round(baseData.conversions * 0.05),
        dr: 0,
        other: 0,
        or: 0,
        transactions: baseData.conversions,
        tr: 0.1,
        epv: 100,
        conversion_revenue: baseData.revenue,
        publisher_revenue: Math.round(baseData.revenue * 0.2),
        publisher_revenue_legacy: Math.round(baseData.revenue * 0.1),
        conversion_roi: baseData.roi,
        cpc: baseData.cpa / 2,
        conversion_cpa: baseData.cpa,
        total_cpa: baseData.cpa,
        total_aov: 100,
        conversion_aov: 100,
        cpt: 10,
        eplpc: 10,
        epuc: 10,
        listicle_epv: 10,
        roas_percentage: 100,
        conversion_roas: 100,
        conversion_roas_percentage: 100,
        conversion_profit: profit,
        epc_roi: 100
      }
    }
    
    try {
      return await this.request('/report', params)
    } catch (error) {
      console.error('Dashboard Data Error:', error)
      throw error
    }
  }

  // Get conversions
  async getConversions(params?: {
    date_from?: string
    date_to?: string
    campaign?: string
    type?: string
    country?: string
    page?: number
    limit?: number
  }): Promise<{ data: Conversion[], total: number }> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      
      // Dados baseados em vendas reais nos EUA
      const mockConversions: Conversion[] = [
        {
          id: '1',
          click_id: 'click_001',
          date: '2024-01-15',
          campaign: 'Facebook Ads - Black Friday',
          payout: 45.50,
          type: 'sale',
          country: 'United States',
          source: 'facebook.com'
        },
        {
          id: '2',
          click_id: 'click_002',
          date: '2024-01-15',
          campaign: 'Google Ads - Search Brand',
          payout: 38.75,
          type: 'sale',
          country: 'United States',
          source: 'google.com'
        },
        {
          id: '3',
          click_id: 'click_003',
          date: '2024-01-14',
          campaign: 'TikTok Ads - Video Campaign',
          payout: 32.25,
          type: 'lead',
          country: 'United States',
          source: 'tiktok.com'
        },
        {
          id: '4',
          click_id: 'click_004',
          date: '2024-01-14',
          campaign: 'Instagram Ads - Stories',
          payout: 42.80,
          type: 'sale',
          country: 'United States',
          source: 'instagram.com'
        },
        {
          id: '5',
          click_id: 'click_005',
          date: '2024-01-13',
          campaign: 'Taboola - Content Discovery',
          payout: 28.90,
          type: 'lead',
          country: 'United States',
          source: 'taboola.com'
        },
        {
          id: '6',
          click_id: 'click_006',
          date: '2024-01-13',
          campaign: 'Outbrain - Native Ads',
          payout: 35.60,
          type: 'sale',
          country: 'United States',
          source: 'outbrain.com'
        },
        {
          id: '7',
          click_id: 'click_007',
          date: '2024-01-12',
          campaign: 'Facebook Ads - Retargeting',
          payout: 52.30,
          type: 'sale',
          country: 'United States',
          source: 'facebook.com'
        },
        {
          id: '8',
          click_id: 'click_008',
          date: '2024-01-12',
          campaign: 'Google Ads - Shopping',
          payout: 41.20,
          type: 'sale',
          country: 'United States',
          source: 'google.com'
        }
      ]
      
      // Filtrar por data se especificado
      let filteredConversions = mockConversions
      if (params?.date_from && params?.date_to) {
        const startDate = new Date(params.date_from)
        const endDate = new Date(params.date_to)
        filteredConversions = mockConversions.filter(conv => {
          const convDate = new Date(conv.date)
          return convDate >= startDate && convDate <= endDate
        })
      }
      
      // Filtrar por campanha se especificado
      if (params?.campaign) {
        filteredConversions = filteredConversions.filter(conv => 
          conv.campaign.toLowerCase().includes(params.campaign!.toLowerCase())
        )
      }
      
      // Filtrar por tipo se especificado
      if (params?.type) {
        filteredConversions = filteredConversions.filter(conv => 
          conv.type === params.type
        )
      }
      
      // Filtrar por país se especificado
      if (params?.country) {
        filteredConversions = filteredConversions.filter(conv => 
          conv.country.toLowerCase().includes(params.country!.toLowerCase())
        )
      }
      
      // Paginação
      const page = params?.page || 1
      const limit = params?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedConversions = filteredConversions.slice(startIndex, endIndex)
      
      return {
        data: paginatedConversions,
        total: filteredConversions.length
      }
    }
    
    try {
      return await this.request('/conversions', params)
    } catch (error) {
      console.error('Conversions Error:', error)
      throw error
    }
  }

  // Get campaigns
  async getCampaigns(params?: {
    date_from?: string
    date_to?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: Campaign[], total: number }> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      
      // Dados baseados em campanhas reais de marketing digital nos EUA
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Facebook Ads - Black Friday Sale',
          source: 'facebook',
          status: 'active',
          spend: 12500.00,
          revenue: 28900.00,
          cpa: 21.60,
          roi: 231.2,
          conversions: 578,
          clicks: 8500,
          impressions: 51000
        },
        {
          id: '2',
          name: 'Google Ads - Search Brand Campaign',
          source: 'google',
          status: 'active',
          spend: 9800.00,
          revenue: 22600.00,
          cpa: 24.00,
          roi: 230.6,
          conversions: 408,
          clicks: 6000,
          impressions: 36000
        },
        {
          id: '3',
          name: 'TikTok Ads - Video Content',
          source: 'tiktok',
          status: 'active',
          spend: 6500.00,
          revenue: 15000.00,
          cpa: 23.90,
          roi: 230.8,
          conversions: 272,
          clicks: 4000,
          impressions: 24000
        },
        {
          id: '4',
          name: 'Instagram Ads - Stories Retargeting',
          source: 'instagram',
          status: 'active',
          spend: 8200.00,
          revenue: 18900.00,
          cpa: 22.50,
          roi: 230.5,
          conversions: 364,
          clicks: 5400,
          impressions: 32000
        },
        {
          id: '5',
          name: 'Taboola - Content Discovery',
          source: 'taboola',
          status: 'paused',
          spend: 4900.00,
          revenue: 11300.00,
          cpa: 24.00,
          roi: 230.6,
          conversions: 204,
          clicks: 3000,
          impressions: 18000
        },
        {
          id: '6',
          name: 'Outbrain - Native Advertising',
          source: 'outbrain',
          status: 'active',
          spend: 4100.00,
          revenue: 9400.00,
          cpa: 24.10,
          roi: 229.3,
          conversions: 170,
          clicks: 2500,
          impressions: 15000
        },
        {
          id: '7',
          name: 'Facebook Ads - Lookalike Audience',
          source: 'facebook',
          status: 'active',
          spend: 15800.00,
          revenue: 36500.00,
          cpa: 20.80,
          roi: 231.0,
          conversions: 760,
          clicks: 11200,
          impressions: 67000
        },
        {
          id: '8',
          name: 'Google Ads - Shopping Campaign',
          source: 'google',
          status: 'active',
          spend: 11200.00,
          revenue: 25800.00,
          cpa: 23.20,
          roi: 230.4,
          conversions: 483,
          clicks: 7200,
          impressions: 43000
        }
      ]
      
      // Filtrar por status se especificado
      let filteredCampaigns = mockCampaigns
      if (params?.status) {
        filteredCampaigns = mockCampaigns.filter(campaign => 
          campaign.status === params.status
        )
      }
      
      // Filtrar por data se especificado (simular variação baseada no período)
      if (params?.date_from && params?.date_to) {
        const startDate = new Date(params.date_from)
        const endDate = new Date(params.date_to)
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const multiplier = days / 7 // Normalizado para 7 dias
        
        filteredCampaigns = filteredCampaigns.map(campaign => ({
          ...campaign,
          spend: campaign.spend * multiplier,
          revenue: campaign.revenue * multiplier,
          conversions: Math.round(campaign.conversions * multiplier),
          clicks: Math.round(campaign.clicks * multiplier),
          impressions: Math.round(campaign.impressions * multiplier)
        }))
      }
      
      // Paginação
      const page = params?.page || 1
      const limit = params?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)
      
      return {
        data: paginatedCampaigns,
        total: filteredCampaigns.length
      }
    }
    
    try {
      return await this.request('/campaigns', params)
    } catch (error) {
      console.error('Campaigns Error:', error)
      throw error
    }
  }

  // Get countries data
  async getCountriesData(params?: {
    date_from?: string
    date_to?: string
  }): Promise<CountryData[]> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return [
        { country: 'Brasil', clicks: 8500, conversions: 588, revenue: 25000 },
        { country: 'Estados Unidos', clicks: 4200, conversions: 320, revenue: 18000 },
        { country: 'México', clicks: 2100, conversions: 156, revenue: 8500 },
        { country: 'Argentina', clicks: 1200, conversions: 89, revenue: 5200 },
        { country: 'Colômbia', clicks: 900, conversions: 67, revenue: 3800 }
      ]
    }
    
    try {
      return await this.request('/countries', params)
    } catch (error) {
      console.error('Countries Error:', error)
      throw error
    }
  }

  // Get cities data
  async getCitiesData(params?: {
    date_from?: string
    date_to?: string
    country?: string
  }): Promise<CountryData[]> {
    try {
      return await this.request('/cities', params)
    } catch (error) {
      console.error('Cities Error:', error)
      throw error
    }
  }

  // Get UTM data
  async getUTMData(params?: {
    date_from?: string
    date_to?: string
    group_by?: 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content'
  }): Promise<any[]> {
    try {
      return await this.request('/report', params)
    } catch (error) {
      console.error('UTM Data Error:', error)
      throw error
    }
  }

  // Export conversions
  async exportConversions(params?: {
    date_from?: string
    date_to?: string
    campaign?: string
    type?: string
    country?: string
  }): Promise<Blob> {
    const url = new URL(`${BASE_URL}/conversions/export`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`Export Error: ${response.status} ${response.statusText}`)
      }

      return response.blob()
    } catch (error) {
      console.error('Export Error:', error)
      throw error
    }
  }

  // Get tracks (clicks) - novo endpoint baseado na documentação
  async getTracks(params?: {
    date_from?: string
    date_to?: string
    campaign?: string
    country?: string
    page?: number
    limit?: number
  }): Promise<any> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return {
        data: [
          {
            id: '1',
            click_id: 'click_001',
            date: '2024-01-15',
            campaign: 'Facebook Ads',
            country: 'Brasil',
            source: 'facebook.com',
            ip: '192.168.1.1',
            user_agent: 'Mozilla/5.0...'
          }
        ],
        total: 1
      }
    }
    
    try {
      return await this.request('/tracks', params)
    } catch (error) {
      console.error('Tracks Error:', error)
      throw error
    }
  }

  // Get domains - novo endpoint baseado na documentação
  async getDomains(): Promise<any[]> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return [
        {
          id: '1',
          domain: 'meusite.com',
          status: 'active',
          ssl: true
        }
      ]
    }
    
    try {
      return await this.request('/domains')
    } catch (error) {
      console.error('Domains Error:', error)
      throw error
    }
  }

  // Get offers - novo endpoint baseado na documentação
  async getOffers(params?: {
    page?: number
    limit?: number
  }): Promise<any> {
    // Retorna dados simulados para chaves de teste ou desenvolvimento
    if (this.apiKey === 'kXlmMfpINGQqv4btkwRL' || this.apiKey === 'test_key' || 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return {
        data: [
          {
            id: '1',
            name: 'Produto A',
            status: 'active',
            payout: 25.50
          }
        ],
        total: 1
      }
    }
    
    try {
      return await this.request('/offers', params)
    } catch (error) {
      console.error('Offers Error:', error)
      throw error
    }
  }
}

export default RedTrackAPI 