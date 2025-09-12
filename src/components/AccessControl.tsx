import React from 'react';
import { useUserPlan } from '../hooks/useUserPlan';
import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';

interface AccessControlProps {
  children: React.ReactNode;
  requireActivePlan?: boolean;
  fallbackComponent?: React.ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requireActivePlan = true,
  fallbackComponent
}) => {
  const { hasActivePlan, planStatus, loading } = useUserPlan();
  const { isAuthenticated } = useAuthStore();

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se requer plano ativo mas não tem, mostrar fallback ou redirecionar
  if (requireActivePlan && !hasActivePlan) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

// Componente para mostrar status do plano
export const PlanStatusBanner: React.FC = () => {
  const { planStatus, hasActivePlan, planData } = useUserPlan();

  if (hasActivePlan) {
    return null; // Não mostrar banner se tem acesso
  }

  const getBannerConfig = () => {
    switch (planStatus) {
      case 'canceled':
        return {
          type: 'warning',
          title: 'Assinatura Cancelada',
          message: 'Sua assinatura foi cancelada. Você pode reativar a qualquer momento.',
          action: 'Reativar Plano'
        };
      case 'past_due':
        return {
          type: 'error',
          title: 'Pagamento Pendente',
          message: 'Seu pagamento falhou. Atualize seu método de pagamento para continuar usando o serviço.',
          action: 'Atualizar Pagamento'
        };
      default:
        return {
          type: 'info',
          title: 'Sem Plano Ativo',
          message: 'Você precisa de um plano ativo para acessar esta funcionalidade.',
          action: 'Escolher Plano'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`p-4 mb-4 rounded-lg border-l-4 ${
      config.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
      config.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
      'bg-blue-50 border-blue-400 text-blue-700'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{config.title}</h3>
          <p className="text-sm mt-1">{config.message}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          {config.action}
        </button>
      </div>
    </div>
  );
};
