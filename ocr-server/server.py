#!/usr/bin/env python3
"""
Local OCR Server using EasyOCR
Better accuracy than Tesseract, runs locally without API keys
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
import base64
import io
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native web

# Initialize EasyOCR reader (supports English and Hindi)
print("Loading OCR model... (this may take a minute on first run)")
reader = easyocr.Reader(['en', 'hi'], gpu=False)
print("✓ OCR model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "OCR server is running"})

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        data = request.json
        
        # Handle base64 image
        if 'base64Image' in data:
            image_data = data['base64Image']
            
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Perform OCR
            results = reader.readtext(img_array, detail=1)
            
            # Extract text and confidence
            text_lines = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                text_lines.append(text)
                confidences.append(confidence)
            
            full_text = '\n'.join(text_lines)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return jsonify({
                "text": full_text,
                "confidence": avg_confidence,
                "lines": len(text_lines)
            })
        
        return jsonify({"error": "No image provided"}), 400
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Local OCR Server Starting...")
    print("="*50)
    print("Server will run on: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("OCR endpoint: http://localhost:5000/ocr")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
