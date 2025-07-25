import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, decode_predictions, preprocess_input
from tensorflow.keras.preprocessing import image

def predict_image_class(img_path):
    # Load and preprocess image
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    # Load pre-trained model
    model = MobileNetV2(weights='imagenet')

    # Predict
    preds = model.predict(img_array)
    decoded = decode_predictions(preds, top=1)[0]

    # Get result
    class_name = decoded[0][1]  # e.g. 'car', 'dog', ...
    confidence = decoded[0][2]  # Probability

    print(f"📸 Dette bildet inneholder en: **{class_name}** ({confidence * 100:.2f}%)")
    return class_name, confidence

# Example CLI usage
def test():
    import sys
    if len(sys.argv) > 1:
        predict_image_class(sys.argv[1])
    else:
        print("Bruk: python imagenet_classifier.py <bilde_fil>")

if __name__ == "__main__":
    test() 