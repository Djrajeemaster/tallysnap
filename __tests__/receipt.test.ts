import { parseReceiptText } from '../models/receipt';

describe('parseReceiptText', () => {
  it('extracts vendor, date, and largest amount', () => {
    const sample = `
Vendor XYZ
Date: 02/03/2025
Subtotal ₹50
Total ₹123.45
`;
    const result = parseReceiptText(sample);
    expect(result.vendor).toBe('Vendor XYZ');
    expect(result.date).toBe('02/03/2025');
    expect(result.total).toBeCloseTo(123.45);
    expect(result.category).toBeUndefined();
  });

  it('handles Devanagari digits and assigns category', () => {
    const sample = `\nकिराना स्टोर\n₹१५०\n`;
    const result = parseReceiptText(sample);
    expect(result.vendor).toBe('किराना स्टोर');
    // devanagari १५० -> 150
    expect(result.total).toBeCloseTo(150);
    expect(result.category).toBe('groceries');
  });

  it('detects food category by keyword', () => {
    const sample = `My Restaurant\nTotal ₹200`;
    const r = parseReceiptText(sample);
    expect(r.category).toBe('food');
  });

  it('does not treat dates as amounts', () => {
    const sample = `Some Shop\nDate: 05/06/2024\nAmount ₹500`;
    const r = parseReceiptText(sample);
    expect(r.total).toBeCloseTo(500);
  });

  it('extracts GSTIN if present', () => {
    const sample = `Vendor\nGSTIN 27AAAAA0000A1Z5\nTotal ₹1000`;
    const r = parseReceiptText(sample);
    expect(r.gstin).toBe('27AAAAA0000A1Z5');
  });

  it('handles comma-separated totals', () => {
    const sample = `Shop\nTotal ₹1,234.56`;
    const r = parseReceiptText(sample);
    expect(r.total).toBeCloseTo(1234.56);
  });
});
