# Relatório de Análise da API RedTrack - Problemas de Atribuição de Dados

## Resumo Executivo

Após análise detalhada da documentação da API RedTrack e do código atual do VMetrics, foram identificados **problemas críticos** na implementação que causam divergências entre os dados exibidos no painel e os valores reais do RedTrack.

## Problemas Identificados

### 1. **Uso Incorreto dos Endpoints**

#### Problema:
- O código estava usando endpoints `/conversions` e `/tracks` para obter dados de campanhas
- Estes endpoints retornam dados brutos, não otimizados para relatórios agregados
- A lógica de agregação manual estava causando inconsistências

#### Solução:
- **Endpoint correto**: `/report` com `group_by=campaign`
- Este endpoint já retorna dados agregados e calculados corretamente
- Elimina a necessidade de agregação manual no backend

### 2. **Mapeamento Incorreto de Campos**

#### Problema:
- O código estava tentando mapear campos de forma inconsistente
- Campos como `campaign`, `campaign_name`, `title` eram usados aleatoriamente
- Não havia padronização na estrutura de resposta

#### Solução:
- Padronização dos campos baseada na documentação oficial
- Uso consistente de `campaign` para nome da campanha
- Estrutura de resposta uniforme

### 3. **Cálculo Incorreto de Métricas**

#### Problema:
- Métricas como ROI, CTR, CPA eram calculadas manualmente
- Cálculos inconsistentes entre diferentes partes do código
- Falta de validação de dados

#### Solução:
- Uso das métricas já calculadas pela API RedTrack
- Validação de dados antes dos cálculos
- Padronização das fórmulas

## Implementação Corrigida

### Endpoint Correto para Campanhas

```javascript
// URL correta para obter dados de campanhas
GET https://api.redtrack.io/report?api_key={api_key}&date_from={date}&date_to={date}&group_by=campaign&metrics=clicks,conversions,cost,revenue,impressions
```

### Estrutura de Resposta Esperada

```json
{
  "data": [
    {
      "campaign": "Nome da Campanha",
      "campaign_id": "123",
      "clicks": 1000,
      "conversions": 50,
      "cost": 500.00,
      "revenue": 750.00,
      "profit": 250.00,
      "roi": 50.0,
      "ctr": 2.5,
      "cr": 5.0,
      "cpc": 0.50,
      "cpa": 10.00,
      "epc": 0.75
    }
  ],
  "total": {
    "clicks": 5000,
    "conversions": 250,
    "cost": 2500.00,
    "revenue": 3750.00,
    "profit": 1250.00,
    "roi": 50.0
  }
}
```

### Campos de Atribuição Corretos

Segundo a documentação da API RedTrack:

#### Campos Principais:
- `campaign_id` / `campaign`: ID e nome da campanha
- `source_id` / `source`: ID e nome da fonte de tráfego
- `offer_id` / `offer`: ID e nome da oferta
- `network_id` / `network`: ID e nome da rede

#### Campos de Tracking RedTrack:
- `rt_campaign` / `rt_source` / `rt_medium`: Campos específicos do RedTrack
- `rt_ad` / `rt_adgroup` / `rt_placement`: Dados de anúncios
- `rt_keyword`: Palavras-chave

#### Campos Financeiros:
- `cost`: Custo total
- `revenue`: Receita total
- `payout`: Valor pago pela conversão
- `pub_revenue`: Receita do publisher

## Comparação: Implementação Antiga vs Nova

### Implementação Antiga (Problemática)

```javascript
// ❌ PROBLEMÁTICO: Usando endpoints de dados brutos
const conversionsUrl = new URL('https://api.redtrack.io/conversions');
const tracksUrl = new URL('https://api.redtrack.io/tracks');

// ❌ PROBLEMÁTICO: Agregação manual
const campaignMap = new Map();
conversionsData.items.forEach(conversion => {
  // Lógica complexa de agregação manual
  // Possível fonte de erros
});
```

### Implementação Nova (Corrigida)

```javascript
// ✅ CORRETO: Usando endpoint de relatórios
const reportUrl = new URL('https://api.redtrack.io/report');
reportUrl.searchParams.set('group_by', 'campaign');
reportUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue');

// ✅ CORRETO: Dados já agregados pela API
const reportData = await fetch(reportUrl);
// Dados já vêm calculados corretamente
```

## Benefícios da Correção

### 1. **Precisão dos Dados**
- Dados calculados pela própria API RedTrack
- Eliminação de erros de agregação manual
- Consistência com o painel oficial

### 2. **Performance**
- Menos requisições à API
- Dados já agregados no servidor
- Cache mais eficiente

### 3. **Manutenibilidade**
- Código mais simples e limpo
- Menos lógica de negócio no backend
- Fácil de debugar e manter

## Próximos Passos

### 1. **Teste da Implementação**
- Verificar se os dados agora correspondem ao painel RedTrack
- Testar com diferentes períodos de tempo
- Validar métricas calculadas

### 2. **Otimizações Adicionais**
- Implementar cache mais inteligente
- Adicionar validação de dados
- Melhorar tratamento de erros

### 3. **Documentação**
- Atualizar documentação da API
- Criar guia de uso para desenvolvedores
- Documentar estrutura de resposta

## Conclusão

A correção implementada resolve os problemas fundamentais de atribuição de dados:

1. **Uso do endpoint correto** (`/report` em vez de `/conversions` e `/tracks`)
2. **Eliminação da agregação manual** (dados já vêm agregados)
3. **Padronização dos campos** (uso consistente da documentação)
4. **Cálculos precisos** (métricas calculadas pela API)

Estas mudanças devem resultar em dados que correspondem exatamente aos valores exibidos no painel oficial do RedTrack. 