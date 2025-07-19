import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  Pause, 
  Play,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  BarChart3,
  Target,
  Link,
  Palette
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'

interface UTMCreative {
  id: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  spend: number
  revenue: number
  conversions: number
  clicks: number
  impressions: number
  ctr: number
  cpa: number
  roi: number
}

const mapRedTrackCampaign = (item: any) => ({
  id: item.campaign_id || item.id || item.campaign_id || Math.random().toString(36).slice(2),
  name: item.campaign || item.campaign_name || item.name || item.campaign_name || item.title || 'Campanha sem nome',
  source: item.source || item.traffic_source || item.media_source || '',
  status: item.status || item.campaign_status || 'active',
  spend: item.cost || item.spend || item.campaign_cost || 0,
  revenue: item.revenue || item.campaign_revenue || item.earnings || 0,
  cpa: item.cpa || item.cost_per_acquisition || 0,
  roi: item.roi || item.return_on_investment || 0,
  conversions: item.conversions || item.approved || item.total_conversions || 0,
  clicks: item.clicks || item.total_clicks || 0,
  impressions: item.impressions || item.total_impressions || 0
})

const Campaigns: React.FC = () => {
  console.log('Montou Campanhas')
  const { apiKey } = useAuthStore()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [utmCreatives, setUtmCreatives] = useState<UTMCreative[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'utm'>('campaigns')
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    source: '',
    minSpend: '',
    maxSpend: '',
    minRoi: '',
    maxRoi: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [totalCampaigns, setTotalCampaigns] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Date range picker state
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // Remover periodOptions, periodPresets, getPeriodLabel, getDateRange antigos se não forem mais usados

  // Função utilitária para obter datas do período
  // Atualizar filtros ao selecionar um preset
  const handlePreset = (preset: any) => {
    const range = preset.getRange()
    setDateRange(range)
    setTempFilters(prev => ({ ...prev, dateFrom: range.from, dateTo: range.to }))
    setFilters(prev => ({ ...prev, dateFrom: range.from, dateTo: range.to }))
  }


  // Remover uso de getDateRange e garantir parâmetros obrigatórios na chamada de campanhas
  // Novo fluxo: buscar campanhas usando /report (GET) com group_by=campaign
  const loadCampaigns = async () => {
    console.log('Chamando loadCampaigns')
    if (!apiKey) {
      console.log('API Key não definida, não vai buscar campanhas')
      return
    }
    
    // Usar getDateRange para obter datas corretas
    const { getDateRange, getCurrentRedTrackDate } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Datas não definidas ou inválidas! startDate:', dateRange.startDate, 'endDate:', dateRange.endDate);
      return;
    }
    
    setLoading(true)
    try {
      const params = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'campaign',
        // Adicione outros filtros se necessário
      }
      console.log('Campanhas - Parâmetros enviados:', params); // LOG detalhado dos parâmetros
      
      // Log da URL para depuração
      const url = new URL('/api/campaigns', window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString());
        }
      });
      console.log('Campanhas - URL da requisição:', url.toString());
      
      // Log de timezone para debug
      console.log('Campanhas - Timezone UTC - Data atual:', getCurrentRedTrackDate());
      console.log('Campanhas - Timezone UTC - Período selecionado:', selectedPeriod);
      console.log('Campanhas - Timezone UTC - Datas calculadas:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        timezone: 'UTC'
      });
      
      // Chamada real usando endpoint de report com group_by=campaign
      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('Campanhas - Resposta bruta do RedTrack:', JSON.stringify(data, null, 2)); // LOG detalhado
      
      // Processar diferentes formatos de resposta
      let campaignsData = []
      
      if (data) {
        // Se data é um array direto
        if (Array.isArray(data)) {
          campaignsData = data
        }
        // Se data tem propriedade items (formato RedTrack)
        else if (data.items && Array.isArray(data.items)) {
          campaignsData = data.items
        }
        // Se data tem propriedade data
        else if (data.data && Array.isArray(data.data)) {
          campaignsData = data.data
        }
        // Se data é um objeto único
        else if (typeof data === 'object' && !Array.isArray(data)) {
          campaignsData = [data]
        }
      }
      
      console.log('Campanhas - Dados processados:', campaignsData);
      
      // Verificar se há campos de campanha nos dados
      if (campaignsData.length > 0) {
        console.log('Campanhas - Campos disponíveis no primeiro item:', Object.keys(campaignsData[0]));
        console.log('Campanhas - Valores do primeiro item:', campaignsData[0]);
        
        // Verificar se há campos relacionados a campanha
        const firstItem = campaignsData[0];
        const campaignFields = Object.keys(firstItem).filter(key => 
          key.toLowerCase().includes('campaign') || 
          key.toLowerCase().includes('name') ||
          key.toLowerCase().includes('title')
        );
        console.log('Campanhas - Campos relacionados a campanha:', campaignFields);
        
        // Se não há dados individuais por campanha, tentar buscar dados de conversões para extrair nomes
        if (campaignsData.length === 1 && !firstItem.campaign && !firstItem.campaign_id) {
          console.log('Campanhas - Dados agregados detectados, tentando buscar dados individuais...');
          
          // Primeiro, tentar buscar lista de campanhas diretamente do RedTrack
          try {
            console.log('Campanhas - Buscando lista de campanhas do RedTrack...');
            const campaignsListResponse = await fetch(`/api/campaigns?api_key=${apiKey}`);
            const campaignsListData = await campaignsListResponse.json();
            console.log('Campanhas - Lista de campanhas do RedTrack:', campaignsListData);
            
            let availableCampaigns = [];
            
            // Processar diferentes formatos de resposta da lista de campanhas
            if (campaignsListData) {
              if (Array.isArray(campaignsListData)) {
                availableCampaigns = campaignsListData;
              } else if (campaignsListData.items && Array.isArray(campaignsListData.items)) {
                availableCampaigns = campaignsListData.items;
              } else if (campaignsListData.data && Array.isArray(campaignsListData.data)) {
                availableCampaigns = campaignsListData.data;
              }
            }
            
            console.log('Campanhas - Campanhas disponíveis:', availableCampaigns);
            
            // Se encontrou campanhas, usar elas
            if (availableCampaigns.length > 0) {
              console.log('Campanhas - Buscando dados individuais para cada campanha...');
              
              // Buscar todos os dados de campanhas de uma vez
              try {
                const allCampaignsDataResponse = await fetch(`/api/report?api_key=${apiKey}&date_from=${dateRange.startDate}&date_to=${dateRange.endDate}&group_by=campaign`);
                const allCampaignsData = await allCampaignsDataResponse.json();
                console.log('Campanhas - Todos os dados de campanhas:', allCampaignsData);
                console.log('Campanhas - Tipo de dados:', typeof allCampaignsData);
                console.log('Campanhas - É array?', Array.isArray(allCampaignsData));
                if (Array.isArray(allCampaignsData)) {
                  console.log('Campanhas - Número de itens:', allCampaignsData.length);
                  allCampaignsData.forEach((item, index) => {
                    console.log(`Campanhas - Item ${index}:`, item);
                  });
                }
                
                // Verificar se os dados são agregados (apenas 1 item com dados totais)
                const isAggregatedData = Array.isArray(allCampaignsData) && allCampaignsData.length === 1 && 
                  (!allCampaignsData[0].campaign && !allCampaignsData[0].campaign_name && !allCampaignsData[0].name && !allCampaignsData[0].title && !allCampaignsData[0].Title);
                
                console.log('Campanhas - Dados são agregados?', isAggregatedData);
                
                // Verificar se a resposta tem estrutura { items: [...] }
                const hasItemsStructure = allCampaignsData && allCampaignsData.items && Array.isArray(allCampaignsData.items);
                console.log('Campanhas - Tem estrutura items?', hasItemsStructure);
                
                if (hasItemsStructure) {
                  console.log('Campanhas - Usando estrutura items com dados individuais...');
                  
                  // Usar dados individuais da estrutura items
                  const individualCampaignsData = [];
                  
                  for (const campaign of availableCampaigns) {
                    const campaignName = campaign.name || campaign.campaign || campaign.campaign_name || campaign.title || 'Campanha sem nome';
                    const campaignId = campaign.id || campaign.campaign_id || `campaign_${Math.random().toString(36).slice(2)}`;
                    
                    console.log(`Campanhas - Procurando dados para campanha: ${campaignName}`);
                    
                    // Procurar dados desta campanha nos items
                    const campaignData = allCampaignsData.items.find((item: any) => {
                      const itemTitle = item.title || item.Title || '';
                      console.log(`Campanhas - Comparando "${itemTitle}" com "${campaignName}"`);
                      return itemTitle.toLowerCase() === campaignName.toLowerCase() ||
                             itemTitle.toLowerCase().includes(campaignName.toLowerCase()) ||
                             campaignName.toLowerCase().includes(itemTitle.toLowerCase());
                    });
                    
                    if (campaignData && campaignData.stat) {
                      console.log(`Campanhas - Dados encontrados para ${campaignName}:`, campaignData.stat);
                      individualCampaignsData.push({
                        campaign: campaignName,
                        campaign_id: campaignId,
                        clicks: campaignData.stat.clicks || 0,
                        conversions: campaignData.stat.conversions || 0,
                        revenue: campaignData.stat.revenue || 0,
                        cost: campaignData.stat.cost || 0,
                        roi: campaignData.stat.roi || 0,
                        cpa: campaignData.stat.cpa || 0,
                        impressions: campaignData.stat.impressions || 0,
                        source: campaignData.source_title || ''
                      });
      } else {
                      console.log(`Campanhas - Nenhum dado encontrado para ${campaignName}, usando dados zerados`);
                      individualCampaignsData.push({
                        campaign: campaignName,
                        campaign_id: campaignId,
                        clicks: 0,
                        conversions: 0,
                        revenue: 0,
                        cost: 0,
                        roi: 0,
                        cpa: 0,
                        impressions: 0,
                        source: ''
                      });
                    }
                  }
                  
                  campaignsData = individualCampaignsData;
                  console.log('Campanhas - Dados individuais criados a partir da estrutura items:', campaignsData);
                } else if (isAggregatedData) {
                  console.log('Campanhas - Dados agregados detectados, tentando buscar dados individuais via conversões...');
                  
                  // Se são dados agregados, tentar extrair dados individuais das conversões
                  try {
                    const conversionsResponse = await fetch(`/api/conversions?api_key=${apiKey}&date_from=${dateRange.startDate}&date_to=${dateRange.endDate}`);
                    const conversionsData = await conversionsResponse.json();
                    console.log('Campanhas - Dados de conversões para extrair campanhas:', conversionsData);
                    
                    // Agrupar conversões por campanha para obter dados individuais
                    const campaignStats = new Map();
                    
                    if (conversionsData && Array.isArray(conversionsData)) {
                      conversionsData.forEach((conv: any) => {
                        if (conv.campaign) {
                          if (!campaignStats.has(conv.campaign)) {
                            campaignStats.set(conv.campaign, {
                              clicks: 0,
                              conversions: 0,
                              revenue: 0,
                              cost: 0
                            });
                          }
                          const stats = campaignStats.get(conv.campaign);
                          stats.conversions += 1;
                          stats.revenue += (conv.revenue || conv.payout || 0);
                        }
                      });
                    } else if (conversionsData && conversionsData.items && Array.isArray(conversionsData.items)) {
                      conversionsData.items.forEach((conv: any) => {
                        if (conv.campaign) {
                          if (!campaignStats.has(conv.campaign)) {
                            campaignStats.set(conv.campaign, {
                              clicks: 0,
                              conversions: 0,
                              revenue: 0,
                              cost: 0
                            });
                          }
                          const stats = campaignStats.get(conv.campaign);
                          stats.conversions += 1;
                          stats.revenue += (conv.revenue || conv.payout || 0);
                        }
                      });
                    }
                    
                    console.log('Campanhas - Estatísticas por campanha:', campaignStats);
                    
                    // Criar dados individuais baseados nas conversões
                    const individualCampaignsData = [];
                    
                    for (const campaign of availableCampaigns) {
                      const campaignName = campaign.name || campaign.campaign || campaign.campaign_name || campaign.title || 'Campanha sem nome';
                      const campaignId = campaign.id || campaign.campaign_id || `campaign_${Math.random().toString(36).slice(2)}`;
                      
                      const stats = campaignStats.get(campaignName) || {
                        clicks: 0,
                        conversions: 0,
                        revenue: 0,
                        cost: 0
                      };
                      
                      individualCampaignsData.push({
                        campaign: campaignName,
                        campaign_id: campaignId,
                        clicks: stats.clicks,
                        conversions: stats.conversions,
                        revenue: stats.revenue,
                        cost: stats.cost,
                        roi: stats.cost > 0 ? ((stats.revenue - stats.cost) / stats.cost) * 100 : 0,
                        cpa: stats.conversions > 0 ? stats.cost / stats.conversions : 0,
                        impressions: 0
                      });
                    }
                    
                    campaignsData = individualCampaignsData;
                    console.log('Campanhas - Dados individuais criados a partir das conversões:', campaignsData);
                    
                  } catch (conversionError) {
                    console.error('Campanhas - Erro ao buscar conversões:', conversionError);
                    // Fallback: usar dados zerados
                    const fallbackData = availableCampaigns.map((campaign: any) => ({
                      campaign: campaign.name || campaign.campaign || campaign.campaign_name || campaign.title || 'Campanha sem nome',
                      campaign_id: campaign.id || campaign.campaign_id || `campaign_${Math.random().toString(36).slice(2)}`,
                      clicks: 0,
                      conversions: 0,
                      revenue: 0,
                      cost: 0,
                      roi: 0,
                      cpa: 0,
                      impressions: 0
                    }));
                    campaignsData = fallbackData;
                  }
                } else {
                  // Processar dados e mapear para campanhas disponíveis
                  const individualCampaignsData = [];
                  
                  for (const campaign of availableCampaigns) {
                    const campaignName = campaign.name || campaign.campaign || campaign.campaign_name || campaign.title || 'Campanha sem nome';
                    const campaignId = campaign.id || campaign.campaign_id || `campaign_${Math.random().toString(36).slice(2)}`;
                    
                    console.log(`Campanhas - Procurando dados para campanha: ${campaignName}`);
                    
                    // Procurar dados desta campanha nos dados retornados
                    let campaignData = null;
                    
                    if (Array.isArray(allCampaignsData)) {
                      // Procurar por correspondência exata ou parcial do nome
                      campaignData = allCampaignsData.find((item: any) => {
                        const itemCampaign = item.campaign || item.campaign_name || item.name || item.title || item.Title || '';
                        console.log(`Campanhas - Comparando "${itemCampaign}" com "${campaignName}"`);
                        return itemCampaign.toLowerCase() === campaignName.toLowerCase() ||
                               itemCampaign.toLowerCase().includes(campaignName.toLowerCase()) ||
                               campaignName.toLowerCase().includes(itemCampaign.toLowerCase());
                      });
                    }
                    
                    if (campaignData) {
                      console.log(`Campanhas - Dados encontrados para ${campaignName}:`, campaignData);
                      individualCampaignsData.push({
                        ...campaignData,
                        campaign: campaignName,
                        campaign_id: campaignId
                      });
                    } else {
                      console.log(`Campanhas - Nenhum dado encontrado para ${campaignName}, usando dados zerados`);
                      // Se não há dados específicos, usar dados zerados
                      individualCampaignsData.push({
                        campaign: campaignName,
                        campaign_id: campaignId,
                        clicks: 0,
                        conversions: 0,
                        revenue: 0,
                        cost: 0,
                        roi: 0,
                        cpa: 0,
                        impressions: 0
                      });
                    }
                  }
                  
                  campaignsData = individualCampaignsData;
                  console.log('Campanhas - Dados individuais reais criados:', campaignsData);
                }
                
              } catch (error) {
                console.error('Campanhas - Erro ao buscar dados de campanhas:', error);
                
                // Fallback: usar dados zerados para todas as campanhas
                const fallbackData = availableCampaigns.map((campaign: any) => ({
                  campaign: campaign.name || campaign.campaign || campaign.campaign_name || campaign.title || 'Campanha sem nome',
                  campaign_id: campaign.id || campaign.campaign_id || `campaign_${Math.random().toString(36).slice(2)}`,
                  clicks: 0,
                  conversions: 0,
                  revenue: 0,
                  cost: 0,
                  roi: 0,
                  cpa: 0,
                  impressions: 0
                }));
                
                campaignsData = fallbackData;
                console.log('Campanhas - Dados de fallback criados:', campaignsData);
              }
            } else {
              // Se não encontrou campanhas na lista, tentar buscar conversões como fallback
              console.log('Campanhas - Nenhuma campanha encontrada na lista, tentando conversões...');
              
              const conversionsResponse = await fetch(`/api/conversions?api_key=${apiKey}&date_from=${dateRange.startDate}&date_to=${dateRange.endDate}`);
              const conversionsData = await conversionsResponse.json();
              console.log('Campanhas - Dados de conversões para extrair campanhas:', conversionsData);
              
              // Extrair campanhas únicas das conversões
              const uniqueCampaigns = new Set();
              if (conversionsData && Array.isArray(conversionsData)) {
                conversionsData.forEach((conv: any) => {
                  if (conv.campaign) {
                    uniqueCampaigns.add(conv.campaign);
                  }
                });
              } else if (conversionsData && conversionsData.items && Array.isArray(conversionsData.items)) {
                conversionsData.items.forEach((conv: any) => {
                  if (conv.campaign) {
                    uniqueCampaigns.add(conv.campaign);
                  }
                });
              }
              
              console.log('Campanhas - Campanhas únicas encontradas nas conversões:', Array.from(uniqueCampaigns));
              
              // Criar dados individuais por campanha
              if (uniqueCampaigns.size > 0) {
                const aggregatedData = campaignsData[0];
                const individualCampaigns = Array.from(uniqueCampaigns).map((campaignName: any) => ({
                  ...aggregatedData,
                  campaign: campaignName,
                  campaign_id: `campaign_${campaignName.toString().replace(/\s+/g, '_').toLowerCase()}`,
                  // Dividir métricas pelo número de campanhas (aproximação)
                  clicks: Math.round(aggregatedData.clicks / uniqueCampaigns.size),
                  conversions: Math.round(aggregatedData.conversions / uniqueCampaigns.size),
                  revenue: aggregatedData.revenue / uniqueCampaigns.size,
                  cost: aggregatedData.cost / uniqueCampaigns.size
                }));
                
                campaignsData = individualCampaigns;
                console.log('Campanhas - Dados individuais criados a partir das conversões:', campaignsData);
              }
            }
          } catch (error) {
            console.error('Campanhas - Erro ao buscar lista de campanhas:', error);
            
            // Fallback para conversões se falhar
            try {
              console.log('Campanhas - Tentando fallback com conversões...');
              const conversionsResponse = await fetch(`/api/conversions?api_key=${apiKey}&date_from=${dateRange.startDate}&date_to=${dateRange.endDate}`);
              const conversionsData = await conversionsResponse.json();
              console.log('Campanhas - Dados de conversões para extrair campanhas:', conversionsData);
              
              // Extrair campanhas únicas das conversões
              const uniqueCampaigns = new Set();
              if (conversionsData && Array.isArray(conversionsData)) {
                conversionsData.forEach((conv: any) => {
                  if (conv.campaign) {
                    uniqueCampaigns.add(conv.campaign);
                  }
                });
              } else if (conversionsData && conversionsData.items && Array.isArray(conversionsData.items)) {
                conversionsData.items.forEach((conv: any) => {
                  if (conv.campaign) {
                    uniqueCampaigns.add(conv.campaign);
                  }
                });
              }
              
              console.log('Campanhas - Campanhas únicas encontradas nas conversões:', Array.from(uniqueCampaigns));
              
              // Criar dados individuais por campanha
              if (uniqueCampaigns.size > 0) {
                const aggregatedData = campaignsData[0];
                const individualCampaigns = Array.from(uniqueCampaigns).map((campaignName: any) => ({
                  ...aggregatedData,
                  campaign: campaignName,
                  campaign_id: `campaign_${campaignName.toString().replace(/\s+/g, '_').toLowerCase()}`,
                  // Dividir métricas pelo número de campanhas (aproximação)
                  clicks: Math.round(aggregatedData.clicks / uniqueCampaigns.size),
                  conversions: Math.round(aggregatedData.conversions / uniqueCampaigns.size),
                  revenue: aggregatedData.revenue / uniqueCampaigns.size,
                  cost: aggregatedData.cost / uniqueCampaigns.size
                }));
                
                campaignsData = individualCampaigns;
                console.log('Campanhas - Dados individuais criados a partir das conversões (fallback):', campaignsData);
              }
            } catch (fallbackError) {
              console.error('Campanhas - Erro no fallback com conversões:', fallbackError);
            }
          }
        }
      }
      
      if (campaignsData.length > 0) {
        // Mapear dados do RedTrack para o formato esperado
        const mapped = campaignsData.map((item: any, idx: number) => {
          const mappedItem = mapRedTrackCampaign(item);
          console.log(`Campanha [${idx}] mapeada:`, mappedItem); // LOG detalhado
          return mappedItem;
        });
        console.log('Campanhas - Campanhas mapeadas:', mapped);
        setCampaigns(mapped);
        setTotalCampaigns(mapped.length);
      } else {
        setCampaigns([]);
        setTotalCampaigns(0);
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setCampaigns([])
      setTotalCampaigns(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect - apiKey:', apiKey, 'selectedPeriod:', selectedPeriod, 'filters:', filters);
    if (apiKey) {
      loadCampaigns()
    } else {
      console.log('API Key não definida no useEffect')
    }
  }, [apiKey, selectedPeriod, filters])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.period-dropdown')) {
        setShowPeriodDropdown(false)
      }
    }

    if (showPeriodDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPeriodDropdown])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setShowPeriodDropdown(false)
    if (period !== 'custom') {
      setCustomRange({ from: '', to: '' })
    }
    // Atualizar filtros para buscar campanhas
    // O cálculo do range já é feito no onChange do PeriodDropdown
    // Esta função pode ser removida ou mantida apenas para compatibilidade
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-trackview-success/20 text-trackview-success'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-trackview-danger/20 text-trackview-danger'
      default:
        return 'bg-trackview-muted/20 text-trackview-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      case 'inactive':
        return <Eye className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filters.status || campaign.status === filters.status
    const matchesSource = !filters.source || campaign.source === filters.source
    const matchesMinSpend = !filters.minSpend || campaign.spend >= parseFloat(filters.minSpend)
    const matchesMaxSpend = !filters.maxSpend || campaign.spend <= parseFloat(filters.maxSpend)
    const matchesMinRoi = !filters.minRoi || campaign.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || campaign.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesStatus && matchesSource && 
           matchesMinSpend && matchesMaxSpend && matchesMinRoi && matchesMaxRoi
  })

  const filteredUTMCreatives = utmCreatives.filter(creative => {
    const matchesSearch = 
      creative.utm_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_medium.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUTMSource = !filters.utm_source || creative.utm_source === filters.utm_source
    const matchesUTMMedium = !filters.utm_medium || creative.utm_medium === filters.utm_medium
    const matchesUTMCampaign = !filters.utm_campaign || creative.utm_campaign === filters.utm_campaign
    const matchesUTMTerm = !filters.utm_term || creative.utm_term === filters.utm_term
    const matchesUTMContent = !filters.utm_content || creative.utm_content === filters.utm_content
    const matchesMinSpend = !filters.minSpend || creative.spend >= parseFloat(filters.minSpend)
    const matchesMaxSpend = !filters.maxSpend || creative.spend <= parseFloat(filters.maxSpend)
    const matchesMinRoi = !filters.minRoi || creative.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || creative.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesUTMSource && matchesUTMMedium && matchesUTMCampaign && 
           matchesUTMTerm && matchesUTMContent && matchesMinSpend && matchesMaxSpend && 
           matchesMinRoi && matchesMaxRoi
  })

  // Calcular métricas
  const totalSpend = activeTab === 'campaigns' 
    ? filteredCampaigns.reduce((sum, c) => sum + c.spend, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.spend, 0)
  const totalRevenue = activeTab === 'campaigns'
    ? filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.revenue, 0)
  const totalConversions = activeTab === 'campaigns'
    ? filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.conversions, 0)
  const averageRoi = activeTab === 'campaigns'
    ? (filteredCampaigns.length > 0 
        ? filteredCampaigns.reduce((sum, c) => sum + c.roi, 0) / filteredCampaigns.length 
        : 0)
    : (filteredUTMCreatives.length > 0
        ? filteredUTMCreatives.reduce((sum, c) => sum + c.roi, 0) / filteredUTMCreatives.length
        : 0)
  const averageCTR = activeTab === 'utm' && filteredUTMCreatives.length > 0
    ? filteredUTMCreatives.reduce((sum, c) => sum + c.ctr, 0) / filteredUTMCreatives.length
    : 0

  // Mensagem amigável se não houver campanhas
  // Mostrar filtros sempre, mesmo sem campanhas
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Nav Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Campanhas & UTM
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
            Gerencie campanhas e analise performance por UTM
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setTempFilters(filters)
              setShowFilters(!showFilters)
            }}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-trackview-background rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'bg-white text-trackview-primary shadow-sm'
              : 'text-trackview-muted hover:text-trackview-primary'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Campanhas
        </button>
        <button
          onClick={() => setActiveTab('utm')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'utm'
              ? 'bg-white text-trackview-primary shadow-sm'
              : 'text-trackview-muted hover:text-trackview-primary'
          }`}
        >
          <Link className="w-4 h-4 mr-2" />
          UTM / Criativos
        </button>
      </div>

      {/* Filtro de período padronizado - sempre visível */}
      <div className="flex items-center justify-between">
        <div className="relative period-dropdown">
        <PeriodDropdown
          value={selectedPeriod}
          customRange={customRange}
          onChange={(period, custom) => {
            setSelectedPeriod(period);
              const dateRange = getDateRange(period, custom);
            if (period === 'custom' && custom) {
              setCustomRange(custom);
            } else {
                setCustomRange({ from: '', to: '' });
            }
              setFilters(prev => ({
                ...prev,
                dateFrom: dateRange.startDate,
                dateTo: dateRange.endDate,
              }));
          }}
            presets={periodPresets}
        />
        </div>
      </div>
      {/* Filtros Avançados */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-trackview-primary">Filtros Avançados</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Ocultar Filtros
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTab === 'campaigns' ? (
              <>
                {/* Remover campos de data simples */}
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    Status
                  </label>
                  <select 
                    value={tempFilters.status}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    Fonte
                  </label>
                  <select 
                    value={tempFilters.source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todas</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Filtros UTM mantidos */}
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Source
                  </label>
                  <select
                    value={tempFilters.utm_source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Medium
                  </label>
                  <select
                    value={tempFilters.utm_medium}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_medium: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="cpc">CPC</option>
                    <option value="cpm">CPM</option>
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Campaign
                  </label>
                  <Input 
                    placeholder="Ex: black_friday_2024"
                    value={tempFilters.utm_campaign}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_campaign: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Term
                  </label>
                  <Input 
                    placeholder="Ex: desconto"
                    value={tempFilters.utm_term}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_term: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Content
                  </label>
                  <Input
                    placeholder="Ex: banner_principal"
                    value={tempFilters.utm_content}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_content: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Spend Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minSpend}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minSpend: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Spend Máximo
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxSpend}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxSpend: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minRoi: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Máximo
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxRoi: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="primary"
              onClick={() => {
                setFilters(tempFilters)
                setShowFilters(false)
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trackview-muted w-4 h-4" />
          <Input
            placeholder={activeTab === 'campaigns' ? "Buscar campanhas..." : "Buscar UTM/criativos..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Período Dropdown */}
        {/* This div is now handled by PeriodDropdown component */}
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-trackview-accent overflow-hidden"
      >
        <div className="overflow-x-auto">
          {activeTab === 'campaigns' ? (
            <table className="w-full">
              <thead className="bg-trackview-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliques
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversões
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gasto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-trackview-background">
                {filteredCampaigns.map((campaign, index) => (
                  <motion.tr 
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-trackview-background"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{campaign.source}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.clicks.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.spend.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.roi}%</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.cpa}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-trackview-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    CPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-trackview-background">
                {filteredUTMCreatives.map((creative, index) => (
                  <motion.tr 
                    key={creative.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-trackview-background"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-trackview-primary capitalize">
                        {creative.utm_source}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text uppercase">
                        {creative.utm_medium}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_campaign}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_term}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-primary">
                        ${creative.spend.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-primary">
                        ${creative.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.ctr}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        ${creative.cpa}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {creative.roi > 100 ? (
                          <TrendingUp className="w-4 h-4 text-trackview-success mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-trackview-danger mr-1" />
                        )}
                        <span className={`text-sm font-medium ${creative.roi > 100 ? 'text-trackview-success' : 'text-trackview-danger'}`}>
                          {creative.roi}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
            </div>
  )
}

export default Campaigns 