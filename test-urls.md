# URLs de Teste - RedTrack API

## API Key
`K0Y6dcsgEqmjQp0CKD49`

## URLs para Testar Diferentes Agrupamentos

### 1. Agrupamento por Source
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=source
```

### 2. Agrupamento por Campaign
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=campaign
```

### 3. Agrupamento por Traffic Channel
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=traffic_channel
```

### 4. Agrupamento por Source ID
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=source_id
```

### 5. Agrupamento por Source Title
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=source_title
```

### 6. Agrupamento por UTM Source
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=utm_source
```

### 7. Agrupamento por RT Source
```
https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2024-01-01&date_to=2024-01-31&group_by=rt_source
```

## Como Testar

1. **Copie uma das URLs acima**
2. **Cole no navegador**
3. **Pressione Enter**
4. **Observe a resposta JSON**

## O que Procurar

- **Estrutura dos dados**: `items`, `data`, `results`
- **Campos disponíveis**: `source`, `source_title`, `campaign`, `traffic_channel`, etc.
- **Campos de custo**: `spend`, `cost`
- **Campos aninhados**: `stat.spend`, `stat.cost`

## Exemplo de Resposta Esperada

```json
{
  "items": [
    {
      "source": "Facebook Ads",
      "source_title": "Facebook Ads",
      "traffic_channel": "facebook",
      "spend": 150.50,
      "cost": 150.50,
      "stat": {
        "spend": 150.50,
        "cost": 150.50
      }
    }
  ]
}
```

## Próximos Passos

1. Teste cada URL
2. Identifique qual retorna dados válidos
3. Observe quais campos contêm os nomes das fontes
4. Observe quais campos contêm os valores de custo
5. Compartilhe os resultados para ajustarmos o código 