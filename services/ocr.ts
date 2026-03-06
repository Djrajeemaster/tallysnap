// OCR Service using OCR.space API
// Free OCR: 25,000 requests/month, no billing required
// Get a free API key from https://ocr.space/ocrapi
// Use "helloworld" for testing (limited)

const OCR_SPACE_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY || 'helloworld';

// Check if OCR.space is configured (either custom key or testing key)
export const isVisionAPIConfigured = () => !!OCR_SPACE_API_KEY;

export interface VisionOCRResult {
  text: string;
  confidence: number;
}

/**
 * Convert image URI to base64 data URL
 */
async function getBase64Image(imageUri: string): Promise<string> {
  // If it's already a data URL, return as-is
  if (imageUri.startsWith('data:')) {
    return imageUri;
  }
  
  // For file:// or blob: URLs, fetch and convert
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error reading image:', e);
    throw new Error('Failed to read image');
  }
}

/**
 * Recognize text from image using multiple OCR methods
 * Priority: Native ML Kit (mobile) → OCR.space API → Tesseract (web)
 * @param imageUri - The URI of the image from expo-image-picker
 * @returns Promise with recognized text
 */
export async function recognizeText(imageUri: string): Promise<VisionOCRResult> {
  // Try native ML Kit first (best for mobile)
  try {
    const { recognizeAsync } = await import('expo-text-recognition');
    console.log('1️⃣ Attempting native ML Kit OCR...');
    
    const result = await recognizeAsync(imageUri);
    if (result && result.text) {
      console.log('✓ ML Kit succeeded');
      return { text: result.text, confidence: 0.9 };
    }
  } catch (e) {
    console.warn('ML Kit not available (web or Expo Go):', e);
  }
  
  // Try OCR.space API
  try {
    console.log('2️⃣ Attempting OCR.space API...');
    const base64Data = await getBase64Image(imageUri);
    
    const formData = new FormData();
    formData.append('base64Image', base64Data);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '1');
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'apikey': OCR_SPACE_API_KEY },
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.IsErroredOnProcessing && data.ParsedResults?.[0]?.ParsedText) {
        console.log('✓ OCR.space succeeded');
        return { text: data.ParsedResults[0].ParsedText, confidence: 0.9 };
      }
    }
  } catch (e) {
    console.warn('OCR.space failed:', e);
  }
  
  // Fallback to Tesseract.js (web only)
  try {
    console.log('3️⃣ Using Tesseract.js fallback...');
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(imageUri, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    console.log('✓ Tesseract succeeded');
    return { text: result.data.text, confidence: result.data.confidence / 100 };
  } catch (e) {
    console.error('All OCR methods failed:', e);
    throw new Error('All OCR methods failed');
  }
}
