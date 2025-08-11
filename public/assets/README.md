# Assets do VMetrics

Esta pasta contém todos os recursos visuais do projeto VMetrics.

## Estrutura das pastas:

### `/images`
- **Logo principal** (recomendado: SVG ou PNG com fundo transparente)
- **Banners e imagens de marketing**
- **Screenshots da aplicação**
- **Imagens de fundo**

### `/icons`
- **Favicon** (16x16, 32x32, 48x48)
- **Ícones da aplicação** (recomendado: SVG)
- **Ícones de redes sociais**
- **Ícones de funcionalidades**

## Como usar no código:

### Para imagens:
```jsx
import logo from '/assets/images/logo.svg'
// ou
<img src="/assets/images/logo.png" alt="VMetrics Logo" />
```

### Para ícones:
```jsx
<link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg" />
```

## Formatos recomendados:
- **Logo**: SVG (escalável) ou PNG com fundo transparente
- **Ícones**: SVG para melhor qualidade em diferentes resoluções
- **Imagens**: WebP para melhor compressão, PNG para transparência

## Tamanhos sugeridos:
- **Logo principal**: 200x60px (SVG) ou 400x120px (PNG)
- **Favicon**: 32x32px
- **Ícones da aplicação**: 24x24px ou 32x32px
