import { supabase } from '../lib/supabase'
import { User } from '../lib/supabase'

export interface RedTrackApiKeyResponse {
  success: boolean
  message: string
  apiKey?: string
  error?: string
}

/**
 * Serviço para gerenciar a API Key do RedTrack
 */
export class RedTrackService {
  /**
   * Verifica se o usuário já possui uma API Key cadastrada
   */
  static async checkExistingApiKey(userId: string): Promise<RedTrackApiKeyResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('redtrack_api_key')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao verificar API Key existente:', error)
        return {
          success: false,
          message: 'Erro ao verificar configuração existente',
          error: error.message
        }
      }

      if (data?.redtrack_api_key) {
        return {
          success: true,
          message: 'API Key já configurada',
          apiKey: data.redtrack_api_key
        }
      }

      return {
        success: false,
        message: 'Nenhuma API Key configurada',
        apiKey: null
      }
    } catch (error) {
      console.error('Erro inesperado ao verificar API Key:', error)
      return {
        success: false,
        message: 'Erro inesperado ao verificar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Salva a API Key do RedTrack para o usuário
   */
  static async saveApiKey(userId: string, apiKey: string): Promise<RedTrackApiKeyResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          redtrack_api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Erro ao salvar API Key:', error)
        return {
          success: false,
          message: 'Erro ao salvar API Key',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'API Key salva com sucesso',
        apiKey
      }
    } catch (error) {
      console.error('Erro inesperado ao salvar API Key:', error)
      return {
        success: false,
        message: 'Erro inesperado ao salvar API Key',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Valida a API Key do RedTrack fazendo uma chamada de teste
   */
  static async validateApiKey(apiKey: string): Promise<RedTrackApiKeyResponse> {
    try {
      // TODO: Implementar validação real com a API do RedTrack
      // Por enquanto, vamos simular uma validação
      
      // Simular delay de validação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validar se a API Key não está vazia e tem formato básico
      if (!apiKey || apiKey.trim().length === 0) {
        return {
          success: false,
          message: 'API Key não pode estar vazia',
          error: 'API_KEY_EMPTY'
        }
      }

      // Simular validação de formato (exemplo: deve ter pelo menos 32 caracteres)
      if (apiKey.trim().length < 32) {
        return {
          success: false,
          message: 'API Key inválida - formato incorreto',
          error: 'API_KEY_INVALID_FORMAT'
        }
      }

      // TODO: Fazer chamada real para a API do RedTrack
      // const response = await fetch('https://api.redtrack.io/v1/account', {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // })
      // 
      // if (!response.ok) {
      //   return {
      //     success: false,
      //     message: 'API Key inválida ou expirada',
      //     error: 'API_KEY_INVALID'
      //   }
      // }

      return {
        success: true,
        message: 'API Key válida',
        apiKey: apiKey.trim()
      }
    } catch (error) {
      console.error('Erro ao validar API Key:', error)
      return {
        success: false,
        message: 'Erro ao validar API Key',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Remove a API Key do usuário
   */
  static async removeApiKey(userId: string): Promise<RedTrackApiKeyResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          redtrack_api_key: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Erro ao remover API Key:', error)
        return {
          success: false,
          message: 'Erro ao remover API Key',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'API Key removida com sucesso',
        apiKey: null
      }
    } catch (error) {
      console.error('Erro inesperado ao remover API Key:', error)
      return {
        success: false,
        message: 'Erro inesperado ao remover API Key',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Obtém o perfil completo do usuário incluindo a API Key
   */
  static async getUserProfile(userId: string): Promise<{ user: User | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao obter perfil do usuário:', error)
        return { user: null, error: error.message }
      }

      return { user: data }
    } catch (error) {
      console.error('Erro inesperado ao obter perfil:', error)
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }
}

export default RedTrackService
