// Unit tests for ReceiptsList and Receipt Model
import type { Category, Receipt } from '../models/receipt';
import { parseReceiptText } from '../models/receipt';

// Mock the navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Firebase
jest.mock('@/firebaseConfig', () => ({
  auth: {},
  db: {},
}));

describe('Receipt Model', () => {
  const mockReceipt: Receipt = {
    id: '1',
    vendor: 'Test Store',
    date: '01/03/2025',
    total: 150.00,
    category: 'food',
    rawText: 'Test Store\nTotal ₹150',
    gstin: '27AAAAA0000A1Z5',
  };

  it('should have valid receipt structure', () => {
    expect(mockReceipt.id).toBe('1');
    expect(mockReceipt.vendor).toBe('Test Store');
    expect(mockReceipt.total).toBe(150.00);
    expect(mockReceipt.category).toBe('food');
    expect(mockReceipt.gstin).toBeDefined();
  });

  it('should validate category types', () => {
    const validCategories: Category[] = ['food', 'travel', 'fuel', 'groceries', 'entertainment', 'utilities', 'other'];
    
    validCategories.forEach(cat => {
      const receipt: Receipt = {
        id: '1',
        category: cat,
        rawText: 'test',
      };
      expect(receipt.category).toBe(cat);
    });
  });
});

describe('parseReceiptText', () => {
  it('extracts vendor, date, and largest amount', () => {
    const sample = `
    Vendor XYZ
    Date: 02/03/2024
    Subtotal ₹50
    Total ₹123.45
    `;
    const result = parseReceiptText(sample);
    expect(result.vendor).toBe('Vendor XYZ');
    expect(result.date).toBe('02/03/2024');
    expect(result.total).toBeCloseTo(123.45);
    expect(result.category).toBeUndefined();
  });

  it('handles regular digits and assigns category', () => {
    const sample = '\nकिराना स्टोर\n₹150\n';
    const result = parseReceiptText(sample);
    expect(result.vendor).toBe('किराना स्टोर');
    expect(result.total).toBe(150);
    expect(result.category).toBe('groceries');
  });

  it('detects food category by keyword', () => {
    const sample = 'My Restaurant\nTotal ₹200';
    const r = parseReceiptText(sample);
    expect(r.category).toBe('food');
  });

  it('does not treat dates as amounts', () => {
    const sample = 'Some Shop\nDate: 05/06/2024\nAmount ₹500';
    const r = parseReceiptText(sample);
    expect(r.total).toBeCloseTo(500);
  });

  it('extracts GSTIN if present', () => {
    const sample = 'Vendor\nGSTIN 27AAAAA0000A1Z5\nTotal ₹1000';
    const r = parseReceiptText(sample);
    expect(r.gstin).toBe('27AAAAA0000A1Z5');
  });

  it('handles comma-separated totals', () => {
    const sample = 'Shop\nTotal ₹1,234.56';
    const r = parseReceiptText(sample);
    expect(r.total).toBeCloseTo(1234.56);
  });

  it('detects travel category', () => {
    const sample = 'Uber Trip\nTotal ₹250';
    const r = parseReceiptText(sample);
    expect(r.category).toBe('travel');
  });

  it('detects fuel category', () => {
    const sample = 'Petrol Pump\nTotal ₹500';
    const r = parseReceiptText(sample);
    expect(r.category).toBe('fuel');
  });

  it('detects utilities category', () => {
    const sample = 'Electricity Bill\nTotal ₹1200';
    const r = parseReceiptText(sample);
    expect(r.category).toBe('utilities');
  });

  it('detects entertainment category', () => {
    const sample = 'Movie Theatre\nTotal ₹350';
    const r = parseReceiptText(sample);
    expect(r.category).toBe('entertainment');
  });
});

describe('Receipt Data Validation', () => {
  it('validates receipt total is a number', () => {
    const receipts = [
      { id: '1', total: 100, rawText: '' },
      { id: '2', total: 0, rawText: '' },
      { id: '3', total: undefined, rawText: '' },
    ];

    const validTotals = receipts
      .filter(r => typeof r.total === 'number')
      .map(r => r.total);

    expect(validTotals.length).toBe(2);
    expect(validTotals).toContain(100);
    expect(validTotals).toContain(0);
  });

  it('filters receipts by category', () => {
    const receipts: Receipt[] = [
      { id: '1', category: 'food', rawText: '' },
      { id: '2', category: 'travel', rawText: '' },
      { id: '3', category: 'food', rawText: '' },
      { id: '4', category: undefined, rawText: '' },
    ];

    const foodReceipts = receipts.filter(r => r.category === 'food');
    expect(foodReceipts.length).toBe(2);
  });

  it('calculates totals correctly', () => {
    const receipts: Receipt[] = [
      { id: '1', total: 100, rawText: '' },
      { id: '2', total: 200, rawText: '' },
      { id: '3', total: undefined, rawText: '' },
    ];

    const total = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
    expect(total).toBe(300);
  });
});
