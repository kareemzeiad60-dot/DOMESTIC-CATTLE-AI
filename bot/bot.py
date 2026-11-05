"""بوت تيليجرام (يستخدم نفس المحرك core.py اللي بيخدم الموقع)."""
import logging, os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
import core

logging.basicConfig(level=logging.INFO)

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("أهلاً 🐄\nابعتلي صورة بقرة أو عجل وأنا أقولك السلالة.")

async def on_photo(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    file = await (msg.photo[-1] if msg.photo else msg.document).get_file()
    data = bytes(await file.download_as_bytearray())
    await msg.reply_text("⏳ بحلل الصورة...")
    try:
        res = core.predict_bytes(data, 3)
    except Exception:
        logging.exception("predict failed")
        await msg.reply_text("مقدرتش أقرا الصورة، جرّب صورة تانية.")
        return
    (top, conf) = res[0]
    text = f"🐄 السلالة: {top} ({conf*100:.1f}%)\n\nأقرب النتائج:\n"
    text += "\n".join(f"{i}. {b} — {c*100:.1f}%" for i, (b, c) in enumerate(res, 1))
    if conf < 0.5:
        text += "\n\n⚠️ الثقة منخفضة، جرّب صورة أوضح لجسم الحيوان كامل."
    await msg.reply_text(text)

def build_app(token: str) -> Application:
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, on_photo))
    return app

if __name__ == "__main__":  # تشغيل البوت لوحده
    build_app(os.environ["TELEGRAM_BOT_TOKEN"]).run_polling()
