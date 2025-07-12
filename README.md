# RedTrack Dashboard

Um dashboard profissional para análise de dados do RedTrack.io, construído com React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Zustand e localStorage.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação via API Key** do RedTrack
- **Dashboard principal** com KPIs e gráficos
- **Tabelas de campanhas** com filtros e paginação
- **Análise de conversões** detalhada
- **Sidebar responsiva** com navegação
- **Configurações** para gerenciar API Key
- **Tema claro/escuro**
- **Dados simulados** para demonstração
- **Integração real** com API do RedTrack

### 📊 Métricas Disponíveis

#### Métricas Principais
- **Faturamento Bruto** - Receita total das campanhas
- **Gasto** - Custo total das campanhas
- **Lucro** - Diferença entre receita e custo
- **Faturamento Líquido** - Receita após impostos

#### Métricas de Performance
- **ROAS** - Return on Ad Spend
- **ROI** - Return on Investment
- **Margem de Lucro** - Percentual de lucro sobre receita
- **ROI Conversão** - ROI específico para conversões
- **EPC ROI** - Earnings per Click ROI

#### Métricas de Custo
- **CPA** - Cost per Acquisition
- **CPC** - Cost per Click
- **Custo por Lead** - Custo por lead gerado
- **CPA Conversão** - CPA específico para conversões
- **CPA Total** - CPA geral
- **CPT** - Cost per Transaction

#### Métricas de Volume
- **Conversas** - Número de conversas
- **Leads** - Número de leads
- **Todas Conversões** - Total de conversões
- **Transações** - Número de transações

#### Métricas de Impressões e Cliques
- **Impressões** - Total de impressões
- **Impressões Visíveis** - Impressões realmente vistas
- **Cliques Únicos** - Cliques únicos
- **CTR** - Click Through Rate

#### Métricas de Landing Page
- **Pre-LP Views** - Visualizações da pré-landing page
- **Pre-LP Clicks** - Cliques na pré-landing page
- **Pre-LP CTR** - Taxa de clique da pré-landing page
- **LP CTR** - Taxa de clique da landing page
- **LP Click CTR** - Taxa de clique para cliques da landing page

#### Métricas de Conversão
- **Taxa Conversão** - Taxa de conversão geral
- **Taxa Todas Conversões** - Taxa de todas as conversões
- **Taxa Transação** - Taxa de transação

#### Métricas de Aprovação
- **Aprovadas** - Conversões aprovadas
- **Taxa Aprovação** - Taxa de aprovação
- **Pendentes** - Conversões pendentes
- **Taxa Pendente** - Taxa de conversões pendentes
- **Recusadas** - Conversões recusadas
- **Taxa Recusa** - Taxa de recusa
- **Outras** - Outras conversões
- **Taxa Outras** - Taxa de outras conversões

#### Métricas de Receita
- **Receita Conversão** - Receita por conversão
- **Receita Publisher** - Receita do publisher
- **Receita Publisher Legacy** - Receita legacy do publisher

#### Métricas de Valor
- **AOV Total** - Average Order Value total
- **AOV Conversão** - AOV por conversão
- **ARPU** - Average Revenue Per User

#### Métricas de Earnings
- **EPV** - Earnings per View
- **EPLPC** - Earnings per Landing Page Click
- **EPUC** - Earnings per Unique Click
- **Listicle EPV** - Earnings per View para listicles

#### Métricas de ROAS
- **ROAS %** - ROAS em percentual
- **ROAS Conversão** - ROAS por conversão
- **ROAS Conversão %** - ROAS percentual por conversão
- **Lucro Conversão** - Lucro por conversão

#### Métricas de Status
- **Vendas Pendentes** - Vendas em análise
- **Taxa de Reembolso** - Percentual de reembolsos
- **Taxa de Aprovação** - Taxa geral de aprovação

#### Métricas de Análise
- **Vendas / Produto** - Vendas por produto
- **Vendas / Fonte** - Vendas por fonte de tráfego
- **Vendas / País** - Vendas por país

### 🔍 Filtros Avançados
- **Período** - Seleção de período (1 dia, 7 dias, 30 dias, 90 dias, 1 ano, personalizado)
- **Data** - Filtro por data inicial e final
- **UTM Source** - Filtro por fonte UTM
- **País** - Filtro por país
- **Dispositivo** - Desktop, Mobile, Tablet
- **Navegador** - Chrome, Firefox, Safari, Edge
- **Sistema Operacional** - Windows, macOS, Linux, Android, iOS

## 🛠️ Tecnologias

- **React 18** + **TypeScript**
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **Framer Motion** para animações
- **Zustand** para gerenciamento de estado
- **Lucide React** para ícones

## 📦 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd MyDash

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. **Instale o Vercel CLI**:
```bash
npm i -g vercel
```

2. **Faça login**:
```bash
vercel login
```

3. **Deploy automático**:
```bash
vercel --prod
```

### Netlify

1. **Build do projeto**:
```bash
npm run build
```

2. **Arraste a pasta `dist`** para o Netlify

### GitHub Pages

1. **Adicione ao package.json**:
```json
{
  "homepage": "https://seu-usuario.github.io/seu-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. **Instale gh-pages**:
```bash
npm install --save-dev gh-pages
```

3. **Deploy**:
```bash
npm run deploy
```

### Firebase Hosting

1. **Instale Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login e inicialize**:
```bash
firebase login
firebase init hosting
```

3. **Deploy**:
```bash
firebase deploy
```

## 🔑 Configuração da API

### Para Teste (Dados Simulados)
Use a chave de teste: `kXlmMfpINGQqv4btkwRL`

### Para API Real do RedTrack

1. **Acesse sua conta** no [RedTrack.io](https://redtrack.io)
2. **Navegue até**: Tools → Integrações → General
3. **Copie sua API Key**
4. **Cole no dashboard** e clique em "Conectar ao RedTrack"

**⚠️ Importante**: Em produção, a API do RedTrack funcionará normalmente. O problema de CORS só ocorre em localhost.

## 📡 Endpoints da API Implementados

Baseado na [documentação oficial do RedTrack](https://help.redtrack.io/), implementamos:

### ✅ Endpoints Funcionais
- `GET /me/settings` - Teste de autenticação
- `GET /report` - Dados do dashboard
- `GET /conversions` - Log de conversões
- `GET /campaigns` - Lista de campanhas
- `GET /tracks` - Log de cliques
- `GET /domains` - Domínios
- `GET /offers` - Ofertas
- `GET /countries` - Dados geográficos

### 🔄 Endpoints Disponíveis na API
- `POST /campaigns` - Criar campanha
- `PUT /campaigns/{id}` - Atualizar campanha
- `POST /conversions` - Upload de conversões
- `GET /conversions/export` - Exportar conversões
- `POST /export_conversions` - Exportar para AWS S3
- `GET /tracks` - Log de cliques
- `POST /tracks/cost` - Atualizar custos

## 🎯 Como Usar

### 1. Login
- Insira sua API Key do RedTrack
- Clique em "Conectar ao RedTrack"

### 2. Dashboard
- Visualize KPIs principais
- Analise gráficos de performance
- Veja funil de conversão

### 3. Campanhas
- Liste todas as campanhas
- Filtre por status e data
- Analise métricas por campanha

### 4. Conversões
- Veja log detalhado de conversões
- Filtre por tipo e data
- Exporte dados

### 5. Configurações
- Atualize sua API Key
- Teste conexão com API real
- Configure tema claro/escuro

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/            # Componentes UI (shadcn/ui)
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── Campaigns.tsx  # Tabela de campanhas
│   ├── Conversions.tsx # Análise de conversões
│   ├── Settings.tsx   # Configurações
│   ├── Sidebar.tsx    # Navegação lateral
│   └── LoginForm.tsx  # Formulário de login
├── store/             # Gerenciamento de estado (Zustand)
│   └── auth.ts        # Store de autenticação
├── services/          # Serviços da API
│   └── api.ts         # Cliente da API RedTrack
└── lib/               # Utilitários
    └── utils.ts       # Funções utilitárias
```

## 🎨 Personalização

### Cores e Tema
- Modo claro/escuro
- Cores personalizáveis via Tailwind
- Componentes shadcn/ui customizáveis

### Gráficos
- Recharts para visualizações
- Gráficos de linha, barra e pizza
- Responsivos e interativos

### Animações
- Framer Motion para transições
- Animações suaves entre páginas
- Feedback visual para ações

## 📝 Licença

Este projeto é para fins educacionais e de demonstração.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas sobre a API do RedTrack:
- [Documentação Oficial](https://help.redtrack.io/)
- [Fórum da Comunidade](https://help.redtrack.io/community/)
- Email: support@redtrack.io

---

**Desenvolvido com ❤️ para análise de dados do RedTrack.io** 