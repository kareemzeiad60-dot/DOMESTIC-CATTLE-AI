"""
CattleAI — اختبار النموذج على صورة واحدة
==========================================
الاستخدام:
    python predict.py <مسار_الصورة>

مثال:
    python predict.py test_cow.jpg
"""

import sys
import os
import json
import numpy as np
from PIL import Image
import tensorflow as tf

OUTPUT_DIR = "output"
IMG_SIZE   = (224, 224)
TOP_K      = 5

def load_model_and_labels():
    model_path  = os.path.join("cattle_model.h5")
    labels_path = os.path.join("labels.json")

    if not os.path.exists(model_path):
        print("[✗] النموذج غير موجود. شغّل train.py أولاً.")
        sys.exit(1)
    if not os.path.exists(labels_path):
        print("[✗] ملف labels.json غير موجود.")
        sys.exit(1)

    model  = tf.keras.models.load_model(model_path)
    with open(labels_path, "r", encoding="utf-8") as f:
        labels = json.load(f)

    return model, labels


def predict(image_path: str):
    # لو المسار مش موجود، جرب من المجلد الأعلى
    if not os.path.exists(image_path):
        parent_path = os.path.join("..", image_path)
        if os.path.exists(parent_path):
            image_path = parent_path
        else:
            print(f"[✗] الصورة غير موجودة: {image_path}")
            print(f"    تأكد من المسار الصح. مثال:")
            print(f"    python predict.py /home/user/photos/cow.jpg")
            print(f"    أو انقل الصورة لمجلد training/ ثم:")
            print(f"    python predict.py cow.jpg")
            sys.exit(1)

    model, labels = load_model_and_labels()

    # تجهيز الصورة
    img = Image.open(image_path).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)

    # التنبؤ
    preds = model.predict(arr, verbose=0)[0]
    top_indices = np.argsort(preds)[::-1][:TOP_K]

    print()
    print("=" * 45)
    print(f"  الصورة: {os.path.basename(image_path)}")
    print("=" * 45)
    for rank, idx in enumerate(top_indices, 1):
        breed = labels[idx].replace("_", " ")
        conf  = preds[idx] * 100
        bar   = "█" * int(conf / 5) + "░" * (20 - int(conf / 5))
        print(f"  #{rank}  {breed:<25} {conf:5.1f}%  {bar}")
    print("=" * 45)
    print()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("الاستخدام: python predict.py <مسار_الصورة>")
        sys.exit(1)
    predict(sys.argv[1])
