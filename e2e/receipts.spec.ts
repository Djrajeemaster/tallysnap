import { test, expect } from '@playwright/test';

const STORAGE_KEY = '@tallysnap/receipts';

test.beforeEach(async ({ page }) => {
  // Seed local storage with two receipts before the app loads
  const receipts = [
    {
      id: 'r1',
      vendor: 'My Restaurant',
      date: '2025-02-01',
      total: 100,
      category: 'food',
      rawText: 'My Restaurant\nTotal ₹100',
    },
    {
      id: 'r2',
      vendor: 'Grocery Mart',
      date: '2025-02-02',
      total: 150,
      category: 'groceries',
      rawText: 'Grocery Mart\nTotal ₹150',
    },
  ];

  // mark environment so the app bypasses auth redirects in tests
  await page.addInitScript(() => {
    (window as any).__E2E__ = true;
  });
});

test('full receipt flow: list -> edit -> reports', async ({ page }) => {
  // load the app, then seed storage and reload so the provider reads it
  await page.goto('http://localhost:8081');
  await page.evaluate((payload) => {
    try { localStorage.setItem(payload.key, JSON.stringify(payload.data)); } catch (e) {}
    try { localStorage.setItem('AsyncStorage:' + payload.key, JSON.stringify(payload.data)); } catch (e) {}
  }, { key: STORAGE_KEY, data: [
    { id: 'r1', vendor: 'My Restaurant', date: '2025-02-01', total: 100, category: 'food', rawText: 'My Restaurant\nTotal ₹100' },
    { id: 'r2', vendor: 'Grocery Mart', date: '2025-02-02', total: 150, category: 'groceries', rawText: 'Grocery Mart\nTotal ₹150' },
  ]});
  await page.reload();
  // wait for initial navigation and hydration to settle
  await page.waitForTimeout(1500);

  // list shows both receipts
  // assert presence via page text (avoids SSR/duplicate hidden elements)
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain('My Restaurant');
  expect(bodyText).toContain('Grocery Mart');
  expect(bodyText).toContain('₹100.00');
  expect(bodyText).toContain('₹150.00');

  // open the first receipt detail by navigating directly to its URL
  await page.goto('http://localhost:8081/receipts/r1');
  await page.waitForTimeout(500);

  // wait for detail view to load (Save button) then find the vendor input
  await page.locator('text=Save').waitFor({ timeout: 5000 });
  const vendorInput = page.locator("xpath=(//div[contains(., 'Vendor')]/following::input|//div[contains(., 'Vendor')]/following::textarea)[1]");
  await expect(vendorInput).toHaveValue('My Restaurant');
  await vendorInput.fill('My Cafe');

  // Save changes
  await page.click('text=Save');
  await page.waitForTimeout(500);

  // Back on list, new vendor name should appear
  await expect(page.locator('text=My Cafe')).toBeVisible();

  // Go to Report tab by clicking the Report button
  await page.click('text=Report');
  await page.waitForTimeout(500);

  // Verify report totals (sum of both receipts = 250)
  await expect(page.locator('text=Total')).toBeVisible();
  await expect(page.locator('text=₹250.00')).toBeVisible();
});

