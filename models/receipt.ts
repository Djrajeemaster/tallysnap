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
  food: ['food', 'restaurant', 'dine', 'hotel', 'cafe'],
  travel: ['bus', 'train', 'taxi', 'uber', 'ola', 'flight', 'airline', 'rail'],
  fuel: ['petrol', 'diesel', 'fuel', 'gas'],
  groceries: ['grocer', 'supermarket', 'mart', 'store', 'किराना'],
  entertainment: ['movie', 'cinema', 'theatre', 'concert', 'entertainment'],
  utilities: ['electricity', 'water', 'internet', 'phone', 'bill'],
  other: [''],
};

/**
 * Try to pull a date, total amount, vendor name and category out of an OCR string.
 * This has grown a bit more capable: it normalizes Devanagari digits, picks the
 * largest amount it can find as the total, and assigns a category based on
 * keywords.  Still very heuristic.
 */
export function parseReceiptText(original: string): Partial<Receipt> {
  const text = normalizeDigits(original);
  const result: Partial<Receipt> = { rawText: original };

  // date patterns like 01/02/2024 or 1-2-24 etc.
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dateMatch) {
    result.date = dateMatch[1];
  }

  // find all currency-like numbers and pick the largest; avoid parts of
  // dates by inspecting characters around the match.
  // allow numbers with optional commas (1,234.56)
  const amounts = Array.from(
    text.matchAll(/(?:₹|Rs\.?|INR)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi)
  )
    .map(m => {
      const idx = m.index ?? 0;
      const before = text[idx - 1];
      const after = text[idx + m[0].length];
      if (before === '/' || before === '-' || after === '/' || after === '-') {
        return NaN;
      }
      // remove commas before parse
      const num = parseFloat(m[1].replace(/,/g, ''));
      return num;
    })
    .filter(n => !isNaN(n));
  if (amounts.length) {
    result.total = Math.max(...amounts);
  }

  // vendor: first non-empty line
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  if (lines.length) {
    result.vendor = lines[0];
  }
  // detect GSTIN (15 alphanumeric, 2 digits + 5 letters + 4 digits + 1 letter + 1 digit + 1 letter)
  // GSTIN is 15 characters: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit, 1 letter/digit
  const gstMatch = text.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z0-9]{1}[0-9]{1}/i);
  if (gstMatch) {
    result.gstin = gstMatch[0].toUpperCase();
  }

  // category detection using substring matches (case-insensitive)
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (keywords.some(k => k && lower.includes(k.toLowerCase()))) {
      result.category = cat;
      break;
    }
  }

  return result;
}
