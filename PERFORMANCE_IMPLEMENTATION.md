# Implementação dos Blocos de Performance - Baseado em Logs de Conversão

## Problema Identificado

Os blocos de performance na seção de campanhas ("Best performing campaigns", "Best performing ads", "Best offers") não estavam respeitando o filtro de data selecionado pelo usuário. Isso acontecia porque o RedTrack apenas fornece dados de performance para "Today" e "Yesterday" em endpoints específicos, sem possibilidade de filtrar por datas customizadas.

## Solução Implementada

### 1. Novo Endpoint de Performance (`/api/performance`)

Criamos um novo endpoint que:
- Busca todas as conversões do período selecionado via `/conversions`
- Processa os dados de conversão para extrair informações de campanhas, anúncios e ofertas
- Organiza os dados por ranking de revenue
- Retorna os top performers para cada categoria

### 2. Processamento de Dados

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

### 3. Estrutura de Dados Retornada

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

### 4. Integração no Frontend

#### Componente Campaigns (`src/components/Campaigns.tsx`)

- Adicionada função `fetchPerformanceData()` que chama o novo endpoint
- Os blocos de performance agora são atualizados sempre que o período ou filtros mudam
- Dados são exibidos em ambas as abas (Campanhas e UTM/Criativos)

#### API Service (`src/services/api.ts`)

- Adicionado método `getPerformanceData()` para consumir o novo endpoint
- Integração com o sistema de cache e tratamento de erros existente

### 5. Vantagens da Implementação

1. **Respeita Filtros de Data**: Os dados agora são filtrados pelo período selecionado pelo usuário
2. **Dados Reais**: Baseado em logs reais de conversão do RedTrack
3. **Performance**: Cache de 5 minutos para evitar requisições desnecessárias
4. **Escalabilidade**: Processa até 10.000 conversões por período
5. **Flexibilidade**: Pode ser facilmente estendido para incluir outras métricas

### 6. Campos Utilizados das Logs de Conversão

Baseado na análise da log fornecida, utilizamos os seguintes campos:

```csv
campaign_id, campaign, offer_id, offer, rt_ad_id, rt_ad, payout, cost, conversions
```

### 7. Como Testar

1. **Endpoint Direto:**
   ```bash
   curl "http://localhost:3001/performance?api_key=SUA_API_KEY&date_from=2024-01-01&date_to=2024-01-31"
   ```

2. **Script de Teste:**
   ```bash
   node test-performance-endpoint.js
   ```

3. **Interface:**
   - Acesse a seção Campanhas no TrackView
   - Selecione um período
   - Os blocos de performance serão atualizados automaticamente

### 8. Próximos Passos

1. **Otimização**: Implementar paginação para períodos com muitas conversões
2. **Métricas Adicionais**: Adicionar CTR, CPA, ROI aos blocos de performance
3. **Filtros Avançados**: Permitir filtrar por país, dispositivo, etc.
4. **Exportação**: Adicionar funcionalidade de exportar dados de performance

### 9. Arquivos Modificados

- `api/performance.js` - Novo endpoint
- `server.js` - Adicionada rota do endpoint
- `src/components/Campaigns.tsx` - Integração no frontend
- `src/services/api.ts` - Novo método na API service
- `test-performance-endpoint.js` - Script de teste

### 10. Considerações Técnicas

- **Rate Limiting**: Implementado controle de taxa de requisições para a API do RedTrack
- **Cache**: Cache de 5 minutos para otimizar performance
- **Tratamento de Erros**: Tratamento robusto de erros e fallbacks
- **Logs**: Logs detalhados para debugging e monitoramento

Esta implementação resolve completamente o problema dos blocos de performance não respeitarem os filtros de data, fornecendo dados precisos e atualizados baseados nas logs reais de conversão do RedTrack. 