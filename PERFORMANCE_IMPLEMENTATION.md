# Implementação dos Blocos de Performance - Baseado em Logs de Conversão

## Problema Identificado

Os blocos de performance na seção de campanhas ("Best performing campaigns", "Best performing ads", "Best offers") não estavam respeitando o filtro de data selecionado pelo usuário. Isso acontecia porque o RedTrack apenas fornece dados de performance para "Today" e "Yesterday" em endpoints específicos, sem possibilidade de filtrar por datas customizadas.

## Solução Implementada

### 1. Novo Endpoint de Performance (`/api/performance`)

Criamos um novo endpoint que:
- Busca todas as conversões do período selecionado via `/conversions`
- Processa os dados de conversão para extrair informações de campanhas, anúncios e ofertas
- Organiza os dados por ranking de conversões (prioridade) e revenue
- Retorna os top 3 performers para cada categoria

### 2. Processamento de Dados Otimizado

O endpoint processa os seguintes campos das logs de conversão:

**Campanhas:**
- `campaign_id` e `campaign` - Identificação e nome da campanha
- `payout` - Receita da conversão
- `cost` - Custo da conversão

**Anúncios:**
- `rt_ad_id` e `rt_ad` - Identificação e nome do anúncio
- `payout` - Receita da conversão
- `cost` - Custo da conversão

**Ofertas:**
- `offer_id` e `offer` - Identificação e nome da oferta
- `payout` - Receita da conversão
- `cost` - Custo da conversão

### 3. Algoritmo de Ranking Melhorado

**Prioridade de Ordenação:**
1. **Conversões** (decrescente) - Prioridade principal
2. **Revenue** (decrescente) - Critério secundário

**Filtros Aplicados:**
- Remove anúncios com ID `{{ad.id}}` (placeholders)
- Processa apenas dados válidos
- Limita a 3 resultados por categoria

**Agrupamento Inteligente de Anúncios:**
- **Problema Identificado**: Anúncios com o mesmo nome podem ter IDs diferentes no RedTrack
- **Solução**: Agrupa anúncios pelo **nome** em vez do ID para evitar duplicações
- **Exemplo**: AD03 com IDs `120231586832070017` e `120231586918170017` são agrupados como um único anúncio
- **Benefício**: Dados mais precisos e sem duplicações artificiais

### 4. Estrutura de Dados Retornada

```json
{
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "Nome da Campanha",
      "revenue": 1500.00,
      "conversions": 25,
      "cost": 500.00,
      "payout": 1500.00
    }
  ],
  "ads": [
    {
      "id": "ad_id",
      "name": "Nome do Anúncio",
      "revenue": 800.00,
      "conversions": 12,
      "cost": 300.00,
      "payout": 800.00
    }
  ],
  "offers": [
    {
      "id": "offer_id",
      "name": "Nome da Oferta",
      "revenue": 2000.00,
      "conversions": 30,
      "cost": 600.00,
      "payout": 2000.00
    }
  ]
}
```

### 5. Layout Melhorado

#### Design dos Blocos de Performance

**Características do Novo Layout:**
- **Gradientes coloridos** para cada categoria (azul, verde, roxo)
- **Cards individuais** para cada item do ranking
- **Medalhas de ranking** (ouro, prata, bronze)
- **Métricas detalhadas** (Revenue, Conversões, CPA)
- **Botões de refresh** para forçar atualização
- **Responsivo** para diferentes tamanhos de tela

**Cores e Identificação:**
- 🏆 **Top Campanhas** - Azul
- 🎯 **Top Anúncios** - Verde  
- 💎 **Top Ofertas** - Roxo

### 6. Sistema de Cache Inteligente

**Controle de Cache:**
- Cache de 5 minutos por padrão
- Parâmetro `_t` para forçar refresh
- Limpeza automática de cache quando necessário

**Como Forçar Refresh:**
```javascript
// Adicionar timestamp para ignorar cache
const params = {
  date_from: '2024-01-01',
  date_to: '2024-01-31',
  _t: Date.now() // Força refresh
}
```

### 7. Integração no Frontend

#### Componente Campaigns (`src/components/Campaigns.tsx`)

- Função `fetchPerformanceData(forceRefresh)` com suporte a refresh forçado
- Botões de refresh em cada bloco de performance
- Layout responsivo e moderno
- Exibição de métricas detalhadas (Revenue, Conversões, CPA)

#### API Service (`src/services/api.ts`)

- Método `getPerformanceData()` com suporte a parâmetros de refresh
- Integração com sistema de cache existente
- Tratamento robusto de erros

### 8. Vantagens da Implementação

1. **Respeita Filtros de Data**: Os dados agora são filtrados pelo período selecionado pelo usuário
2. **Dados Reais**: Baseado em logs reais de conversão do RedTrack
3. **Performance**: Cache inteligente com opção de refresh forçado
4. **Escalabilidade**: Processa até 10.000 conversões por período
5. **Flexibilidade**: Pode ser facilmente estendido para incluir outras métricas
6. **UX Melhorada**: Layout moderno e intuitivo
7. **Ranking Inteligente**: Prioriza conversões sobre revenue

### 9. Campos Utilizados das Logs de Conversão

Baseado na análise da log fornecida, utilizamos os seguintes campos:

```csv
campaign_id, campaign, offer_id, offer, rt_ad_id, rt_ad, payout, cost, conversions
```

### 10. Como Testar

1. **Endpoint Direto:**
   ```bash
   curl "http://localhost:3001/performance?api_key=SUA_API_KEY&date_from=2024-01-01&date_to=2024-01-31"
   ```

2. **Forçar Refresh:**
   ```bash
   curl "http://localhost:3001/performance?api_key=SUA_API_KEY&date_from=2024-01-01&date_to=2024-01-31&_t=1234567890"
   ```

3. **Interface:**
   - Acesse a seção Campanhas no TrackView
   - Selecione um período
   - Os blocos de performance serão atualizados automaticamente
   - Use os botões de refresh para forçar atualização

### 11. Resolução do Problema de Cache

**Problema Identificado:**
- Às vezes era necessário recarregar a página para ver dados atualizados
- Cache estava mantendo dados antigos

**Solução Implementada:**
- Parâmetro `_t` para forçar refresh
- Botões de refresh em cada bloco
- Limpeza automática de cache quando necessário
- Logs detalhados para debugging

### 12. Sincronização de Dados

**Problema Identificado:**
- Blocos de performance e dados de campanhas carregavam de forma assíncrona
- Dessincronização entre datas selecionadas e dados exibidos
- Necessidade de trocar datas para forçar atualização

**Solução Implementada:**
- **useEffect Unificado**: Um único useEffect para carregar todos os dados
- **Carregamento Sequencial**: Dados de campanhas → Aguarda → Dados de performance
- **Refresh Forçado**: Sempre força refresh dos dados de performance
- **Estado de Loading**: Indicadores visuais durante carregamento
- **Logs Detalhados**: Para debugging e monitoramento

**Fluxo de Carregamento:**
1. Usuário seleciona período
2. Carrega dados de campanhas/UTM
3. Aguarda processamento (100ms)
4. Carrega dados de performance com refresh forçado
5. Atualiza interface com dados sincronizados

**Melhorias na UX:**
- Loading spinners nos blocos de performance
- Botões de refresh desabilitados durante carregamento
- Feedback visual durante atualizações
- Logs detalhados no console para debugging

### 13. Próximos Passos

1. **Otimização**: Implementar paginação para períodos com muitas conversões
2. **Métricas Adicionais**: Adicionar CTR, ROI aos blocos de performance
3. **Filtros Avançados**: Permitir filtrar por país, dispositivo, etc.
4. **Exportação**: Adicionar funcionalidade de exportar dados de performance
5. **Notificações**: Alertas quando novos dados estão disponíveis

### 14. Arquivos Modificados

- `api/performance.js` - Endpoint otimizado com ranking melhorado
- `server.js` - Adicionada rota do endpoint
- `src/components/Campaigns.tsx` - Layout moderno e botões de refresh
- `src/services/api.ts` - Novo método na API service
- `test-performance-endpoint.js` - Script de teste

### 15. Considerações Técnicas

- **Rate Limiting**: Implementado controle de taxa de requisições para a API do RedTrack
- **Cache Inteligente**: Cache de 5 minutos com opção de refresh forçado
- **Tratamento de Erros**: Tratamento robusto de erros e fallbacks
- **Logs Detalhados**: Logs para debugging e monitoramento
- **Performance**: Otimização para processar grandes volumes de dados

### 16. Confirmação dos Dados

**✅ Confirmado**: Os dados estão sendo extraídos das logs reais de conversão do RedTrack, conforme demonstrado na resposta da API:

```json
{
  "campaigns": [
    {
      "id": "687f060db92e32dd00ea83bd",
      "name": "Facebook - Morango Lucrativo",
      "revenue": 224.10,
      "conversions": 9
    }
  ]
}
```

Esta implementação resolve completamente o problema dos blocos de performance não respeitarem os filtros de data, fornecendo dados precisos e atualizados baseados nas logs reais de conversão do RedTrack, com um layout moderno e sistema de cache inteligente. 

### 17. Correção do Filtro de Conversões

**Problema Identificado:**
- O sistema estava contando `InitiateCheckout` como conversão
- Isso inflava artificialmente os números de conversões
- Necessidade de filtrar apenas conversões reais

**Solução Implementada:**
- **Lista de Conversões Válidas**: Definida lista de tipos de conversão aceitos
- **Filtro Automático**: Sistema automaticamente ignora `InitiateCheckout` e outros tipos inválidos
- **Logs Detalhados**: Contadores para debugging e monitoramento
- **Tipos Aceitos**: Apenas `Purchase` (Compra) e `Conversion` (Conversão)

**Implementação Técnica:**
```javascript
// Tipos de conversão válidos (apenas Purchase e Conversion)
const validConversionTypes = [
  'Purchase',    // Compra
  'Conversion'   // Conversão
];

// Verificar se é uma conversão válida
const conversionType = conversion.type || conversion.event || '';
const isValidConversion = validConversionTypes.some(type => 
  conversionType.toLowerCase().includes(type.toLowerCase())
);

// Se for InitiateCheckout, pular
if (conversionType.toLowerCase().includes('initiatecheckout')) {
  console.log(`⚠️ [PERFORMANCE] Pulando InitiateCheckout: ${conversionType}`);
  return;
}
```

**Logs de Debugging:**
- Total de conversões processadas
- Conversões válidas contadas
- InitiateCheckout ignorados
- Contadores por entidade (campanhas, anúncios, ofertas)

### 18. Implementação do Cálculo de CPA com Dados Reais

**Problema Identificado:**
- Métricas de CPA estavam zeradas nos blocos de performance
- Campo `cost` das conversões vinha como 0
- Necessidade de buscar dados de custo reais das campanhas e anúncios

**Solução Implementada:**
- **Endpoint `/tracks`**: Utiliza o endpoint de logs de cliques do RedTrack para buscar dados de custo
- **Dados de Cliques**: Cada track representa um clique com dados de custo
- **Métricas Calculadas**: CPA, CPC, ROI com dados reais
- **Integração Completa**: Combina dados de conversões com dados de custo dos cliques

**Implementação Técnica:**
```javascript
// Buscar dados de custo das campanhas via /tracks
const campaignsTracksUrl = new URL('https://api.redtrack.io/tracks');
campaignsTracksUrl.searchParams.set('date_from', date_from);
campaignsTracksUrl.searchParams.set('date_to', date_to);
campaignsTracksUrl.searchParams.set('per', '10000');

// Buscar dados de custo dos anúncios via /tracks
const adsTracksUrl = new URL('https://api.redtrack.io/tracks');
adsTracksUrl.searchParams.set('date_from', date_from);
adsTracksUrl.searchParams.set('date_to', date_to);
adsTracksUrl.searchParams.set('per', '10000');

// Processar dados combinados
function processPerformanceData(conversions, campaignsTracksData, adsTracksData) {
  // Criar mapas de custo a partir dos tracks
  const campaignsCostMap = new Map();
  const adsCostMap = new Map();
  
  // Cada track é um clique com dados de custo
  // Combinar dados de conversões com dados de custo dos cliques
  // Calcular CPA, CPC, ROI
}
```

**Métricas Calculadas:**
- **CPA (Cost Per Acquisition)**: `cost / conversions`
- **ROI (Return On Investment)**: `((revenue - cost) / cost) * 100`
- **Revenue, Cost, Conversions**

**Foco na Performance:**
- **Conversões**: Quantidade de conversões válidas (Purchase/Conversion)
- **CPA**: Custo por aquisição - quanto custou cada conversão
- **ROI**: Retorno sobre investimento - lucratividade da campanha/anúncio/oferta

**Interface Atualizada:**
- Layout simplificado focado nas métricas essenciais
- **Conversões**: Quantidade de conversões válidas
- **CPA**: Custo por aquisição (quanto custou cada conversão)
- **ROI**: Retorno sobre investimento com cores condicionais (verde/vermelho)
- Grid de 1 coluna para melhor legibilidade
- Responsivo para diferentes tamanhos de tela

### 19. Próximos Passos 