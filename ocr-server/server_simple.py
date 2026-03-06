#!/usr/bin/env python3
"""
Simple OCR Server using pytesseract
Easier to install than EasyOCR, decent accuracy
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import base64
import io

app = Flask(__name__)
CORS(app)

print("✓ OCR server ready!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "OCR server is running"})

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        data = request.json
        
        if 'base64Image' in data:
            image_data = data['base64Image']
            
            # Remove data URL prefix
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Perform OCR with better config for receipts
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(image, config=custom_config)
            
            # Get confidence data
            data_dict = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in data_dict['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) / 100 if confidences else 0
            
            return jsonify({
                "text": text.strip(),
                "confidence": avg_confidence,
                "lines": len([l for l in text.split('\n') if l.strip()])
            })
        
        return jsonify({"error": "No image provided"}), 400
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Simple OCR Server Starting...")
    print("="*50)
    print("Server: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
