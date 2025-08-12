import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { ROUTES } from '../config/routes'
import LandingPage from './LandingPage'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import Dashboard from './Dashboard'
import Campaigns from './Campaigns'
import Conversions from './Conversions'
import Performance from './Performance'
import Funnel from './Funnel'
import Settings from './Settings'
import IntegrationApiKey from './IntegrationApiKey'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const AppRouter: React.FC = () => {
  const { isAuthenticated, apiKey } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path={ROUTES.LANDING} 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />

        {/* Rotas de autenticação */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />

        <Route 
          path={ROUTES.SIGNUP} 
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          } 
        />

        <Route 
          path={ROUTES.FORGOT_PASSWORD} 
          element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          } 
        />

        {/* Rotas protegidas do dashboard */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.CAMPAIGNS} 
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.CONVERSIONS} 
          element={
            <ProtectedRoute>
              <Conversions />
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.PERFORMANCE} 
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.FUNNEL} 
          element={
            <ProtectedRoute>
              <Funnel />
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* Rota de integração com RedTrack */}
        <Route 
          path={ROUTES.INTEGRATION} 
          element={
            <ProtectedRoute>
              <IntegrationApiKey />
            </ProtectedRoute>
          } 
        />

        {/* Redirecionamentos */}
        <Route 
          path="/" 
          element={<Navigate to={ROUTES.LANDING} replace />} 
        />

        {/* Rota padrão - redirecionar para dashboard se autenticado, senão para login */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to={ROUTES.DASHBOARD} replace />
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
