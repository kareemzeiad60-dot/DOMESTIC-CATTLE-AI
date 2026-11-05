"""Telegram bot: يستقبل صورة بقرة ويرجّع السلالة (cattle_model.h5)."""
import json, logging, os
from io import BytesIO

import numpy as np
from PIL import Image
import tensorflow as tf
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

logging.basicConfig(level=logging.INFO)
BASE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
IMG_SIZE, TOP_K = (224, 224), 3

model = tf.keras.models.load_model(os.path.join(BASE, "cattle_model.h5"), compile=False)
with open(os.path.join(BASE, "labels.json"), encoding="utf-8") as f:
    LABELS = json.load(f)

def predict(data: bytes):
    img = Image.open(BytesIO(data)).convert("RGB").resize(IMG_SIZE)
    arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, 0)
    p = model.predict(arr, verbose=0)[0]
    return [(LABELS[i].replace("_", " "), float(p[i]) * 100) for i in np.argsort(p)[::-1][:TOP_K]]

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("أهلاً 🐄\nابعتلي صورة بقرة أو عجل وأنا أقولك السلالة.")

async def on_photo(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    file = await (msg.photo[-1] if msg.photo else msg.document).get_file()
    data = bytes(await file.download_as_bytearray())
    await msg.reply_text("⏳ بحلل الصورة...")
    try:
        res = predict(data)
    except Exception:
        logging.exception("predict failed")
        await msg.reply_text("مقدرتش أقرا الصورة، جرّب صورة تانية.")
        return
    top, conf = res[0]
    text = f"🐄 السلالة: *{top}* ({conf:.1f}%)\n\nأقرب النتائج:\n"
    text += "\n".join(f"{i}. {b} — {c:.1f}%" for i, (b, c) in enumerate(res, 1))
    if conf < 50:
        text += "\n\n⚠️ الثقة منخفضة، جرّب صورة أوضح لجسم الحيوان كامل."
    await msg.reply_text(text, parse_mode="Markdown")

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, on_photo))
    app.run_polling()

if __name__ == "__main__":
    main()
