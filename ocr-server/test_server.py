#!/usr/bin/env python3
"""
Quick test script for OCR server
Tests if the server can process a simple image
"""

import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io

def create_test_receipt():
    """Create a simple test receipt image"""
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw simple receipt text
    text = [
        "TEST RESTAURANT",
        "123 Main Street",
        "Date: 01/15/2025",
        "",
        "Item 1        Rs 100",
        "Item 2        Rs 200",
        "Tax           Rs  30",
        "-------------------",
        "Total:        Rs 330"
    ]
    
    y = 20
    for line in text:
        draw.text((20, y), line, fill='black')
        y += 25
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_bytes = buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    return f"data:image/png;base64,{img_base64}"

def test_server():
    """Test the OCR server"""
    print("=" * 50)
    print("Testing Local OCR Server")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            print("✓ Server is running!")
            print(f"   Response: {response.json()}")
        else:
            print(f"✗ Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running!")
        print("   Please start the server: python ocr-server/server.py")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 2: OCR endpoint with test image
    print("\n2️⃣ Testing OCR endpoint...")
    try:
        test_image = create_test_receipt()
        
        response = requests.post(
            'http://localhost:5000/ocr',
            json={'base64Image': test_image},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ OCR processing successful!")
            print(f"   Extracted text ({data.get('lines', 0)} lines):")
            print("   " + "-" * 40)
            for line in data.get('text', '').split('\n'):
                print(f"   {line}")
            print("   " + "-" * 40)
            print(f"   Confidence: {data.get('confidence', 0):.2%}")
            return True
        else:
            print(f"✗ OCR failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error during OCR: {e}")
        return False

if __name__ == '__main__':
    success = test_server()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ All tests passed!")
        print("Your OCR server is working correctly.")
    else:
        print("❌ Tests failed!")
        print("Please check the error messages above.")
    print("=" * 50)
