@echo off
echo ========================================
echo Testing OCR Server
echo ========================================
echo.
echo Make sure the OCR server is running first!
echo (Run start-ocr-server.bat in another terminal)
echo.
pause

cd ocr-server
python test_server.py
pause
