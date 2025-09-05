# 🚀 DEPLOY DA EDGE FUNCTION

## 1. Fazer Login no Supabase
```bash
npx supabase login
```

## 2. Deploy da Edge Function
```bash
npx supabase functions deploy user-plan
```

## 3. Verificar se foi criada
```bash
npx supabase functions list
```

## 4. Testar a Edge Function
```bash
curl -X POST 'https://fkqkwhzjvpzycfkbnqaq.supabase.co/functions/v1/user-plan' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWt3aHpqdnB6eWNma2JucWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTE0OTYsImV4cCI6MjA3MDMyNzQ5Nn0.69mJMOg5_qiJIyNAPLsjb-FY1mXT7cJWkf_p3rE68K0' \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d"}'
```

## 5. URL da Edge Function
- **URL**: `https://fkqkwhzjvpzycfkbnqaq.supabase.co/functions/v1/user-plan`
- **Método**: POST
- **Body**: `{"user_id": "fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d"}`
