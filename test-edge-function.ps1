# 🧪 TESTE DA EDGE FUNCTION USER-PLAN (PowerShell)
# Execute: .\test-edge-function.ps1

$userId = "fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d"
$supabaseUrl = "https://fkqkwhzjvpzycfkbnqaq.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWt3aHpqdnB6eWNma2JucWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTE0OTYsImV4cCI6MjA3MDMyNzQ5Nn0.69mJMOg5_qiJIyNAPLsjb-FY1mXT7cJWkf_p3rE68K0"

Write-Host "🔍 Testando Edge Function user-plan..." -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Yellow

try {
    $headers = @{
        'Authorization' = "Bearer $supabaseAnonKey"
        'Content-Type' = 'application/json'
    }
    
    $body = @{
        user_id = $userId
    } | ConvertTo-Json
    
    Write-Host "Enviando requisição..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/user-plan" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Dados recebidos:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    # Verificar estrutura dos dados
    if ($response.plan) {
        Write-Host "✅ Plano encontrado:" -ForegroundColor Green
        Write-Host "- Tipo: $($response.plan.plan_type)" -ForegroundColor White
        Write-Host "- Status: $($response.plan.status)" -ForegroundColor White
        Write-Host "- Nome: $($response.plan.name)" -ForegroundColor White
        Write-Host "- Preço: $($response.plan.price)" -ForegroundColor White
        Write-Host "- Período: $($response.plan.period)" -ForegroundColor White
        Write-Host "- Features: $($response.plan.features -join ', ')" -ForegroundColor White
    } else {
        Write-Host "❌ Nenhum plano encontrado" -ForegroundColor Red
    }
    
    if ($response.user) {
        Write-Host "✅ Usuário encontrado:" -ForegroundColor Green
        Write-Host "- ID: $($response.user.id)" -ForegroundColor White
        Write-Host "- Email: $($response.user.email)" -ForegroundColor White
        Write-Host "- Stripe Customer ID: $($response.user.stripe_customer_id)" -ForegroundColor White
    } else {
        Write-Host "❌ Nenhum usuário encontrado" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro no teste: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception)" -ForegroundColor Red
}
