from flask import Flask, render_template, request, jsonify
import os
from classifier import classify_image_path

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file temporarily
        filename = file.filename.replace(' ', '_')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Classify using your existing function with debug enabled
            print(f"🔍 Classifying image: {filename}")
            category, probability = classify_image_path(filepath, debug=True)
            print(f"✅ Result: {category} ({probability:.1%})")
            
            # Clean up
            os.remove(filepath)
            
            return jsonify({
                'category': category,
                'confidence': f'{probability:.1%}'
            })
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Classification failed: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    port = 5000
    print(" Starting Smart Image Classifier...")
    print(f" Open: http://127.0.0.1:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)