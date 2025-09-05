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
curl -X POST 'https://your-project.supabase.co/functions/v1/user-plan' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d"}'
```

## 5. URL da Edge Function
- **URL**: `https://your-project.supabase.co/functions/v1/user-plan`
- **Método**: POST
- **Body**: `{"user_id": "fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d"}`
