# Domestic Cattle AI
- **الموقع**: React/Vite على GitHub Pages، بيرفع الصورة للـ API.
- **الباك إند** (`bot/`): FastAPI بيحلل الصور بـ `cattle_model.h5` + بوت تيليجرام في نفس السيرفر.

## Endpoints
`GET /api/health` — `POST /api/analyze` body: `{"image": "data:image/jpeg;base64,..."}`

## التشغيل
محليًا: `cd bot && pip install -r requirements.txt && TELEGRAM_BOT_TOKEN=xxx uvicorn app:app --port 7860`
على Render: New → Blueprint → اختار الريبو (`render.yaml`)، وحط `TELEGRAM_BOT_TOKEN`.
بعدها في GitHub → Settings → Variables: `VITE_API_URL` = رابط Render، و`VITE_BOT_URL` = `https://t.me/اسم_البوت`.
