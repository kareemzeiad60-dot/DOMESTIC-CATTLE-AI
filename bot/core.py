"""المحرك المشترك: تحميل الموديل + التنبؤ + معلومات السلالات."""
import base64, json, os
from io import BytesIO

import numpy as np
from PIL import Image
import tensorflow as tf

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_SIZE = (224, 224)

model = tf.keras.models.load_model(os.path.join(BASE, "cattle_model.h5"), compile=False)
with open(os.path.join(BASE, "labels.json"), encoding="utf-8") as f:
    LABELS = json.load(f)

# اسم عربي + معلومات تقريبية عن كل سلالة
INFO = {
    "Angus": ("أنجوس", "Scotland", "450-900 kg", "Low", "Prime", "High"),
    "Ayrshire": ("أيرشير", "Scotland", "450-600 kg", "High", "Moderate", "High"),
    "BRAFORD": ("برافورد", "Hybrid (Brahman x Hereford)", "450-850 kg", "Low", "High", "Very High"),
    "BRANGUES NEGRO": ("برانجوس نيجرو", "Hybrid (Brahman x Angus)", "450-850 kg", "Low", "Prime", "Very High"),
    "Brown Swiss": ("براون سويس", "Switzerland", "550-900 kg", "High", "Moderate", "High"),
    "Hereford": ("هيرفورد", "England", "550-1000 kg", "Low", "Prime", "High"),
    "Holstein Friesian": ("هولشتاين فريزيان", "Netherlands / Germany", "580-700 kg", "Very High", "Moderate", "Moderate"),
    "Jaffarabadi": ("جعفرآبادي", "India (Gujarat)", "800-1500 kg", "High", "Good", "High"),
    "Jersey": ("جيرسي", "Jersey Island", "400-500 kg", "High (rich milk)", "Low", "Moderate"),
    "Red Dane": ("ريد دان", "Denmark", "550-750 kg", "High", "Moderate", "High"),
}

def clean(name: str) -> str:
    return name.replace("_", " ")

def predict_bytes(data: bytes, top_k: int = 5):
    img = Image.open(BytesIO(data)).convert("RGB").resize(IMG_SIZE)
    arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, 0)
    p = model.predict(arr, verbose=0)[0]
    idx = np.argsort(p)[::-1][:top_k]
    return [(clean(LABELS[i]), float(p[i])) for i in idx]  # confidence 0..1

def analyze(data: bytes, lang: str = "en") -> dict:
    top = predict_bytes(data)
    ar = lang.startswith("ar")
    def disp(b): return INFO.get(b, (b,))[0] if ar else b
    breed, conf = top[0]
    ar_name, origin, weight, milk, meat, hardy = INFO.get(breed, (breed, "-", "-", "-", "-", "-"))
    return {
        "breed": disp(breed),
        "confidence": conf,
        "description": (f"تم التعرف على السلالة بواسطة الموديل المدرّب بثقة {conf*100:.1f}%." if ar
                        else f"Identified by the trained model with {conf*100:.1f}% confidence."),
        "characteristics": {"origin": origin, "weightRange": weight, "milkProduction": milk,
                            "meatQuality": meat, "hardiness": hardy},
        "topMatches": [{"breed": disp(b), "confidence": c} for b, c in top],
        "engine": "CATTLE_MODEL_H5",
    }

def decode_data_url(s: str) -> bytes:
    return base64.b64decode(s.split(",", 1)[1] if s.startswith("data:") else s)
