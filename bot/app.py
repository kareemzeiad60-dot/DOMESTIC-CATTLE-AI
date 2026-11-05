"""سيرفر واحد: API للموقع + بوت تيليجرام (لو التوكن موجود)."""
import logging, os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import core

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
tg = None

@asynccontextmanager
async def lifespan(_):
    global tg
    if TOKEN:
        import bot
        tg = bot.build_app(TOKEN)
        await tg.initialize(); await tg.start(); await tg.updater.start_polling()
        logging.info("Telegram bot started")
    yield
    if tg:
        await tg.updater.stop(); await tg.stop(); await tg.shutdown()

app = FastAPI(lifespan=lifespan)
origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
@app.get("/api/health")
def health():
    return {"status": "ok", "bot": bool(tg), "classes": len(core.LABELS)}

@app.post("/api/analyze")
async def analyze(req: Request):
    try:
        body = await req.json()
        data = core.decode_data_url(body["image"])
        lang = req.headers.get("accept-language", "en")
        return core.analyze(data, lang)
    except Exception as e:
        logging.exception("analyze failed")
        return JSONResponse({"error": f"Could not analyze image: {e}"}, status_code=400)
