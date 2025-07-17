# 📧 Template de Email para Suporte RedTrack

## Assunto:
API Key Integration Issue - Solo Plan API Access Problem

## Corpo do Email:

Olá, equipe de suporte do RedTrack!

Sou cliente do plano Solo ($149/mo) e estou enfrentando dificuldades para integrar com a API do RedTrack. Gostaria de solicitar assistência técnica para resolver este problema.

### Problema Técnico:
- **Plano**: Solo ($149/mo)
- **API Key testada**: OtfIkSkqPOtIpQnS2KNb
- **Erro consistente**: 401 Unauthorized - "invalid token: unauthorized"
- **Endpoints testados**: /report, /conversions, /campaigns, /me/settings
- **Todos retornam**: 401 Unauthorized

### Testes Realizados:
1. **Teste direto via curl**:
   ```bash
   curl -X GET "https://api.redtrack.io/report?group_by=campaign" \
     -H "Authorization: Bearer OtfIkSkqPOtIpQnS2KNb" \
     -H "Content-Type: application/json"
   ```
   **Resultado**: 401 Unauthorized

2. **Teste via dashboard personalizado**:
   - Endpoint: /api/report
   - Headers: Authorization Bearer
   - **Resultado**: 401 Unauthorized

### Perguntas Técnicas:

1. **API Key Válida**: Como posso gerar uma nova API Key válida para o plano Solo?

2. **Permissões do Plano**: O plano Solo tem acesso completo à API ou há limitações?

3. **Endpoints Disponíveis**: Quais endpoints estão disponíveis para o plano Solo?

4. **Integração Nativa**: Existe alguma integração oficial ou nativa disponível?

5. **Upgrade Necessário**: Seria necessário upgrade para plano Team/Enterprise para API completa?

6. **Documentação**: Há documentação específica para integração com planos básicos?

### Informações da Conta:
- **Email da conta**: [SEU_EMAIL]
- **Plano atual**: Solo ($149/mo)
- **Data de início**: [DATA]
- **Uso**: Dashboard personalizado para análise de campanhas

### Uso Pretendido:
- Dashboard personalizado para análise de campanhas
- Integração com ferramentas de BI
- Automação de relatórios
- Análise de performance em tempo real

### Logs Técnicos:
```
2025-07-13T02:45:47.466Z [info] 🔍 [REPORT] Status da resposta: 401
2025-07-13T02:45:47.470Z [info] ❌ [REPORT] Erro na resposta: { error: 'invalid token: unauthorized' }
```

Agradeço antecipadamente pela assistência técnica!

Atenciosamente,
[SEU_NOME]
[SEU_EMAIL]
[SEU_TELEFONE]

---
**Nota**: Se possível, gostaria de uma resposta técnica detalhada sobre as limitações da API no plano Solo e opções de upgrade para API completa. 