# 🎨 Personalizando as Imagens do VMetrics

## 📁 Estrutura de Arquivos

```
public/assets/
├── images/
│   ├── logo.svg          # Logo principal (recomendado: SVG)
│   ├── logo.png          # Logo em PNG (alternativa)
│   └── logo-white.svg    # Logo para fundos escuros
├── icons/
│   ├── favicon.svg       # Favicon principal (32x32)
│   ├── favicon.png       # Favicon em PNG
│   ├── favicon-16.png    # Favicon 16x16
│   ├── favicon-32.png    # Favicon 32x32
│   └── favicon-48.png    # Favicon 48x48
└── README.md             # Documentação geral
```

## 🚀 Como Substituir as Imagens

### 1. **Logo Principal**
- **Substitua**: `public/assets/images/logo.svg`
- **Tamanho recomendado**: 200x60px (SVG) ou 400x120px (PNG)
- **Formato**: SVG (preferido) ou PNG com fundo transparente

### 2. **Favicon**
- **Substitua**: `public/assets/icons/favicon.svg`
- **Tamanhos**: 16x16, 32x32, 48x48px
- **Formatos**: SVG + PNG para compatibilidade

### 3. **Logo Branco** (para fundos escuros)
- **Crie**: `public/assets/images/logo-white.svg`
- **Use**: Para componentes com fundo escuro

## 🔧 Atualizando o Código

### Para usar sua logo personalizada:

1. **No componente Logo.tsx**:
```tsx
// Substitua o SVG placeholder por sua logo
<img 
  src="/assets/images/logo.svg" 
  alt="VMetrics Logo" 
  className="w-full h-full object-contain"
/>
```

2. **Para diferentes variantes**:
```tsx
// Logo padrão
<Logo size="lg" />

// Logo branco
<Logo size="lg" variant="white" />

// Apenas ícone
<Logo size="md" showText={false} />
```

## 📱 Responsividade

- **Mobile**: Logo se adapta automaticamente
- **Desktop**: Logo mantém proporções
- **Sidebar colapsada**: Mostra apenas o ícone

## 🎯 Dicas de Design

- **Cores**: Mantenha a paleta azul/roxo do VMetrics
- **Transparência**: Use fundo transparente para PNGs
- **SVG**: Melhor para escalabilidade e performance
- **Contraste**: Garanta boa legibilidade em diferentes fundos

## 🔄 Atualizando Favicon

Após substituir o favicon:
1. Limpe o cache do navegador
2. Faça um novo deploy
3. O favicon será atualizado automaticamente

---

**💡 Dica**: Mantenha as proporções originais para melhor integração com o layout existente!
