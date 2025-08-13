-- 🔑 ADICIONAR COLUNA API_KEY NA TABELA USERS
-- Execute este script no SQL Editor do Supabase se a tabela já existir

-- ========================================
-- VERIFICAR SE A COLUNA JÁ EXISTE
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'api_key'
    ) THEN
        -- Adicionar coluna api_key
        ALTER TABLE users ADD COLUMN api_key TEXT;
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
        
        -- Adicionar comentário
        COMMENT ON COLUMN users.api_key IS 'API Key do RedTrack para acesso aos dados';
        
        RAISE NOTICE '✅ Coluna api_key adicionada com sucesso na tabela users';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna api_key já existe na tabela users';
    END IF;
END $$;

-- ========================================
-- VERIFICAR ESTRUTURA ATUAL
-- ========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ========================================
-- VERIFICAR ÍNDICES
-- ========================================
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users'
ORDER BY indexname;
