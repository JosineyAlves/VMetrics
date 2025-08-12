// Testar se a tabela users existe no Supabase
// Execute: node test-supabase-table.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTable() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Testar se a tabela profiles existe
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Tabela "profiles" não existe!')
        console.log('📝 Execute o SQL no Supabase SQL Editor')
        return
      }
      console.error('❌ Erro ao acessar tabela:', error)
      return
    }
    
    console.log('✅ Tabela "profiles" existe!')
    console.log('📊 Dados encontrados:', data)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testTable()
