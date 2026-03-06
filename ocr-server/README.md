# Local OCR Server Setup

This server provides better OCR accuracy than Tesseract using EasyOCR.

## Setup (One-time)

1. **Install Python 3.8+** (if not already installed)
   - Download from: https://www.python.org/downloads/

2. **Install dependencies**:
   ```bash
   cd ocr-server
   pip install -r requirements.txt
   ```

   First run will download OCR models (~500MB) - this is normal.

## Running the Server

```bash
cd ocr-server
python server.py
```

Server will start on: http://localhost:5000

## Testing

Open browser: http://localhost:5000/health

You should see: `{"status": "ok", "message": "OCR server is running"}`

## Usage

The React Native app will automatically use this server when:
1. OCR.space API fails
2. Server is running on localhost:5000

## Supported Languages

- English (en)
- Hindi (hi)

To add more languages, edit `server.py` line 18:
```python
reader = easyocr.Reader(['en', 'hi', 'ta'], gpu=False)  # Added Tamil
```

Available languages: https://www.jaided.ai/easyocr/
