#!/bin/bash

# 🚀 Script de Deploy Automatizado - Vercel
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy no Vercel..."

# 1. Verificar se o build funciona
echo "📦 Testando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build bem-sucedido!"
else
    echo "❌ Erro no build. Corrija os erros antes de continuar."
    exit 1
fi

# 2. Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi

# 3. Verificar login
echo "🔐 Verificando login no Vercel..."
vercel whoami

if [ $? -ne 0 ]; then
    echo "🔑 Faça login no Vercel..."
    vercel login
fi

# 4. Deploy
echo "🚀 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://seu-projeto.vercel.app" 