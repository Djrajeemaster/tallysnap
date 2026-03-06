@echo off
echo ========================================
echo Starting Local OCR Server
echo ========================================
echo.

cd ocr-server

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting OCR Server on port 5000...
echo ========================================
echo.
python server.py
