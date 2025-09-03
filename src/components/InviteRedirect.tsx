import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../config/routes';

const InviteRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInviteRedirect = async () => {
      try {
        // Verificar se há parâmetros de convite na URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (token && type === 'invite') {
          // Verificar se o usuário já está autenticado
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Usuário já autenticado, redirecionar para setup-password
            navigate(ROUTES.SETUP_PASSWORD, { replace: true });
          } else {
            // Usuário não autenticado, redirecionar para login
            navigate(ROUTES.LOGIN, { replace: true });
          }
        } else {
          // Sem parâmetros de convite, redirecionar para login
          navigate(ROUTES.LOGIN, { replace: true });
        }
      } catch (err) {
        console.error('Error handling invite redirect:', err);
        setError('Erro ao processar convite. Redirecionando para login...');
        setTimeout(() => {
          navigate(ROUTES.LOGIN, { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleInviteRedirect();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3cd48f] mx-auto mb-4"></div>
          <p className="text-gray-600">Processando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="bg-[#3cd48f] text-white px-6 py-2 rounded-lg hover:bg-[#2bb574] transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InviteRedirect;
