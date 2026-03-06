// categories that we might auto-detect
export type Category =
  | 'food'
  | 'travel'
  | 'fuel'
  | 'groceries'
  | 'entertainment'
  | 'utilities'
  | 'other';

export interface Receipt {
  id: string;
  date?: string;          // ISO string, or human-readable
  total?: number;         // in main currency unit (e.g. rupees)
  vendor?: string;
  gstin?: string;         // Indian GST number if found
  category?: Category;
  rawText: string;        // full OCR result
  imageUri?: string;      // optional photo or upload URI
}

// convert Devanagari numerals to Latin digits
function normalizeDigits(s: string) {
  const map: Record<string, string> = {
    '\u0966': '0',
    '\u0967': '1',
    '\u0968': '2',
    '\u0969': '3',
    '\u096A': '4',
    '\u096B': '5',
    '\u096C': '6',
    '\u096D': '7',
    '\u096E': '8',
    '\u096F': '9',
  };
  return s.replace(/[\u0966-\u096F]/g, c => map[c] || c);
}

// simple keyword lists instead of regex; Unicode words may not be
// matched by \b boundaries so use plain substring checks.
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  food: ['food', 'restaurant', 'dine', 'hotel', 'cafe', 'coffee', 'pizza', 'burger', 'kitchen', 'tiffin', 'mess', 'eatery', 'bar', 'pub', 'गरमा'],
  travel: ['bus', 'train', 'taxi', 'uber', 'ola', 'flight', 'airline', 'rail', 'metro', 'cab', 'auto', 'rickshaw', 'यात्रा'],
  fuel: ['petrol', 'diesel', 'fuel', 'gas', 'oil', 'hpcl', 'bpcl', 'ioc', 'shell', 'petroleum'],
  groceries: ['grocer', 'supermarket', 'mart', 'store', 'किराना', 'vegetable', 'fruit', 'kirana', 'big basket', 'zepto', 'blinkit'],
  entertainment: ['movie', 'cinema', 'theatre', 'concert', 'entertainment', 'ticket', 'netflix', 'spotify', 'hotstar', 'amazon prime'],
  utilities: ['electricity', 'water', 'internet', 'phone', 'bill', 'broadband', 'mobile recharge', 'gas connection', 'wifi'],
  other: [''],
};

/**
 * Try to pull a date, total amount, vendor name and category out of an OCR string.
 * Improved parsing: looks for specific keywords, not just largest number.
 */
export function parseReceiptText(original: string): Partial<Receipt> {
  const text = normalizeDigits(original);
  const result: Partial<Receipt> = { rawText: original };
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

  console.log('=== PARSING RECEIPT ===');
  console.log('Raw text:', original);
  console.log('Lines:', lines);

  // 1. Find TOTAL - look for "Total" keyword and nearby number
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^total$/i.test(line.trim())) {
      // Check next line for number
      if (i + 1 < lines.length) {
        const numMatch = lines[i + 1].match(/([0-9]+\.[0-9]+)/);
        if (numMatch) {
          result.total = parseFloat(numMatch[1]);
          console.log('✓ Found total from Total line:', result.total);
          break;
        }
      }
    }
    // Also check if Total and number are on same line
    const sameLine = line.match(/total[:\s]+([0-9]+\.[0-9]+)/i);
    if (sameLine) {
      result.total = parseFloat(sameLine[1]);
      console.log('✓ Found total on same line:', result.total);
      break;
    }
  }

  // 2. Fallback: find amounts but prioritize lines near "Total"
  if (!result.total) {
    console.log('⚠ Using fallback');
    
    // First try to find any line with "total" (case insensitive)
    for (const line of lines) {
      if (line.toLowerCase().includes('total')) {
        const numMatch = line.match(/([0-9]+\.[0-9]+)/);
        if (numMatch) {
          result.total = parseFloat(numMatch[1]);
          console.log('✓ Found total in line with "total":', result.total);
          break;
        }
      }
    }
  }

  // 3. Last resort: largest amount excluding cash, change, approval
  if (!result.total) {
    const amounts: number[] = [];
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('cash') || lower.includes('change') || 
          lower.includes('approval') || lower.includes('code') || line.includes('#')) {
        continue;
      }
      
      const matches = line.match(/([0-9]+\.[0-9]+)/g);
      if (matches) {
        amounts.push(...matches.map(m => parseFloat(m)));
      }
    }
    
    if (amounts.length) {
      result.total = Math.max(...amounts);
      console.log('✓ Using largest amount:', result.total);
    }
  }

  // 4. Find DATE - look for common date patterns
  const datePatterns = [
    /(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})/,
    /(\d{4}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{1,2})/,
    /(?:date|date:)\s*(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})/i,
    /(?:dated?)\s*:?\s*(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})/i,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.date = match[1];
      console.log('✓ Found date:', match[1]);
      break;
    }
  }

  // 4. Find VENDOR - usually first few lines at top of receipt, skip addresses and noisy lines
  const skipPatterns = [/address|tel|phone|mobile|email|www|\.com|gstin|tax|invoice|receipt|thank|designed by|cash|dine|in|out|change|balance|approval|bank|card/i];
  const noisyPatterns = [/^[*#@%&!]+$/, /^\*+$/, /^\d+$/, /^[-=]+$/, /^[¥€£$]+$/, /^[\d\s\.\-]+$/];
  
  // Look at first 10 lines where vendor typically appears
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    const isSkip = skipPatterns.some(p => p.test(line));
    const isNoisy = noisyPatterns.some(p => p.test(line));
    const specialCharRatio = (line.match(/[*#@%&!¥€£$]/g) || []).length / line.length;
    if (!isSkip && !isNoisy && line.length > 2 && !/^\d+$/.test(line) && specialCharRatio < 0.3) {
      result.vendor = line;
      console.log('✓ Found vendor:', line);
      break;
    }
  }

  // 5. detect GSTIN
  const gstMatch = text.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z0-9]{1}[0-9]{1}/i);
  if (gstMatch) {
    result.gstin = gstMatch[0].toUpperCase();
    console.log('✓ Found GSTIN:', result.gstin);
  }

  // 6. Category detection
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (keywords.some(k => k && lower.includes(k.toLowerCase()))) {
      result.category = cat;
      console.log('✓ Found category:', cat);
      break;
    }
  }

  console.log('=== PARSED RESULT ===', result);
  return result;
}
