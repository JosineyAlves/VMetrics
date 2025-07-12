# 🚀 RedTrack Dashboard - Demonstração

## 📋 Visão Geral

Este é um dashboard profissional completo para análise de performance de campanhas do RedTrack.io, construído com React + Vite, Tailwind CSS e Shadcn/UI.

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- Tela de login com validação de API Key
- Teste automático da chave via `GET /me/settings`
- Armazenamento seguro no localStorage
- Logout e limpeza de dados

### ✅ Dashboard Principal
- **KPIs em tempo real**: Cliques, conversões, spend, revenue, ROI, CPA, CPL
- **Gráficos interativos**: Performance por dia e funil de conversão
- **Design responsivo**: Mobile e desktop
- **Tema claro/escuro**: Alternância automática

### ✅ Navegação Completa
- **Sidebar responsiva** com ícones
- **Menu mobile** com overlay
- **Animações suaves** com Framer Motion
- **Roteamento** com React Router

### ✅ Páginas Funcionais
1. **Dashboard** - Visão geral com KPIs e gráficos
2. **Campanhas** - Tabela com filtros e busca
3. **Conversões** - Detalhes de conversões com exportação
4. **Configurações** - Gerenciamento de API key e tema

### ✅ Componentes UI
- **Botões** com variantes (default, outline, ghost, etc.)
- **Inputs** com validação e ícones
- **Tabelas** responsivas com ordenação
- **Cards** com animações
- **Gráficos** com Recharts

## 🎨 Design System

### Cores
- **Primária**: Azul (#3B82F6)
- **Sucesso**: Verde (#10B981)
- **Aviso**: Amarelo (#F59E0B)
- **Erro**: Vermelho (#EF4444)
- **Tema escuro**: Suporte completo

### Tipografia
- **Títulos**: Inter Bold
- **Corpo**: Inter Regular
- **Código**: JetBrains Mono

### Componentes
- **Border radius**: 0.5rem (8px)
- **Shadows**: Suaves e consistentes
- **Spacing**: Sistema 4px (0.25rem)

## 📊 Gráficos e Visualizações

### Dashboard
- **Line Chart**: Performance por dia
- **Bar Chart**: Funil de conversão
- **KPIs**: Cards com métricas principais

### Dados Mock
- Campanhas com dados realistas
- Conversões com diferentes tipos
- Métricas calculadas automaticamente

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS
- **Shadcn/UI** - Componentes base

### Estado e Roteamento
- **Zustand** - Gerenciamento de estado
- **React Router** - Navegação
- **Framer Motion** - Animações

### Gráficos e UI
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

## 🚀 Como Executar

1. **Instalar dependências**:
```bash
npm install
```

2. **Executar em desenvolvimento**:
```bash
npm run dev
```

3. **Acessar**: http://localhost:3000

4. **Testar com API Key**: Use qualquer string como API key para testar

## 📱 Responsividade

### Mobile (< 768px)
- Sidebar colapsável
- Cards em coluna única
- Tabelas com scroll horizontal
- Menu hambúrguer

### Tablet (768px - 1024px)
- Layout adaptativo
- Grid responsivo
- Sidebar fixa

### Desktop (> 1024px)
- Layout completo
- Sidebar sempre visível
- Gráficos otimizados

## 🔐 Segurança

### Autenticação
- API Key validada via RedTrack API
- Armazenamento local seguro
- Logout com limpeza de dados

### Dados
- Requisições autenticadas
- Headers corretos
- Tratamento de erros

## 📈 Próximos Passos

### Funcionalidades Planejadas
1. **Análise Geográfica** - Mapa de calor por país
2. **Análise UTM** - Agrupamento por parâmetros
3. **Exportação** - CSV com filtros
4. **Filtros Avançados** - Por período, fonte, etc.

### Melhorias Técnicas
1. **Testes** - Unit e integration tests
2. **PWA** - Service workers
3. **Cache** - Otimização de performance
4. **Deploy** - Vercel/Netlify

## 🎯 Casos de Uso

### Para Afiliados
- Monitorar performance de campanhas
- Analisar conversões por fonte
- Identificar melhores canais
- Exportar relatórios

### Para Compradores de Mídia
- Análise de ROI por campanha
- Comparação de fontes de tráfego
- Otimização de funil
- Relatórios executivos

## 📝 Licença

Este projeto é de uso livre para análise de dados do RedTrack.io.

---

**Desenvolvido com ❤️ para a comunidade de marketing digital** 