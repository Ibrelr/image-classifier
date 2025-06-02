from flask import Flask, render_template, request, jsonify
from PIL import Image
from classifier import classify_image_pil

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = Image.open(request.files['image'])
    category, prob = classify_image_pil(image)

    return jsonify({"category": category, "confidence": f"{prob:.2%}"})

if __name__ == '__main__':
    app.run(debug=True)
