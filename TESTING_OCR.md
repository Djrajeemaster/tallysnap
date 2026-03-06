# OCR Testing Guide

## Quick Test (5 minutes)

### Step 1: Start OCR Server
Open **Terminal 1**:
```bash
cd d:\scanorg\tallysnap
start-ocr-server.bat
```

Wait for: `✓ OCR model loaded successfully!`

### Step 2: Test the Server
Open **Terminal 2**:
```bash
cd d:\scanorg\tallysnap
test-ocr-server.bat
```

Expected output:
```
✓ Server is running!
✓ OCR processing successful!
   Extracted text (9 lines):
   TEST RESTAURANT
   123 Main Street
   Date: 01/15/2025
   ...
   Total:        Rs 330
   Confidence: 85%
✅ All tests passed!
```

### Step 3: Test with React Native Web
Open **Terminal 3**:
```bash
cd d:\scanorg\tallysnap
npx expo start -c
```

Press `w` for web, then:
1. Go to Scan tab
2. Upload a receipt image
3. Check browser console for:
   ```
   1️⃣ Attempting OCR.space API...
   ✓ OCR.space succeeded
   ```
   OR
   ```
   2️⃣ Attempting local OCR server...
   ✓ Local OCR server succeeded
   ```

## Troubleshooting

### "Server is not running"
- Make sure Terminal 1 is still running
- Check if port 5000 is available: `netstat -ano | findstr :5000`

### "Python not found"
- Install Python: https://www.python.org/downloads/
- Make sure "Add to PATH" is checked during installation

### "Module not found"
```bash
cd ocr-server
pip install -r requirements.txt
```

### OCR accuracy is low
- Use better quality images (clear, well-lit)
- Try different OCR engines in server.py
- Consider adding more languages

## Performance

- **First OCR**: ~5-10 seconds (model loading)
- **Subsequent OCRs**: ~1-2 seconds
- **Memory usage**: ~500MB (EasyOCR models)

## Next Steps

Once local server works well:
- Deploy to cloud (Heroku, Railway, etc.)
- Update EXPO_PUBLIC_LOCAL_OCR_SERVER in .env
- Share with team members
