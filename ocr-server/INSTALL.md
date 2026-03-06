# OCR Server Installation Guide

## Option 1: Simple Server (Recommended for Quick Start)

Uses pytesseract - easier to install, decent accuracy.

### Step 1: Install Tesseract OCR
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki
- Download: `tesseract-ocr-w64-setup-5.3.3.20231005.exe`
- Install to: `C:\Program Files\Tesseract-OCR`
- **Important**: Check "Add to PATH" during installation

### Step 2: Install Python packages
```powershell
cd ocr-server
pip install -r requirements_simple.txt
```

### Step 3: Run server
```powershell
python server_simple.py
```

---

## Option 2: Advanced Server (Better Accuracy)

Uses EasyOCR - harder to install, better accuracy (85-90%).

### Step 1: Install dependencies
```powershell
cd ocr-server
pip install -r requirements.txt
```

### Step 2: Run server
```powershell
python server.py
```

**Note**: First run downloads ~500MB of models.

---

## Troubleshooting

### "pytesseract.pytesseract.TesseractNotFoundError"
- Install Tesseract OCR from link above
- Add to PATH: `C:\Program Files\Tesseract-OCR`
- Restart terminal

### "pip install fails"
- Upgrade pip: `python -m pip install --upgrade pip`
- Try simple version first

### Test if working
```powershell
python test_server.py
```

---

## Which to use?

- **Quick testing**: Use Option 1 (simple server)
- **Production**: Use Option 2 (EasyOCR) or cloud API
- **No server**: App falls back to Tesseract.js automatically
