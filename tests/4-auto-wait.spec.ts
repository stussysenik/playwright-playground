import { test, expect } from '@playwright/test';

test.describe('Auto-Waiting — Actionability Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Reset any previous state
    await page.click('#reset-delayed');
  });

  test('waits for delayed element to appear', async ({ page }) => {
    // Element appears after 2s — Playwright auto-waits for visibility
    await page.click('#show-delayed');

    // No sleep(), no waitFor() — just assert
    await expect(page.locator('#delayed-element')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#delayed-element')).toHaveText('I appeared!');
  });

  test('waits for input to become enabled before filling', async ({ page }) => {
    // Input enables after 1.5s — Playwright auto-waits for actionability
    await page.click('#enable-input-btn');

    // fill() auto-waits for the input to be enabled
    await page.fill('#delayed-input', 'typed!', { timeout: 5000 });

    await expect(page.locator('#delayed-input')).toHaveValue('typed!');
  });

  test('auto-retries assertions until text updates', async ({ page }) => {
    // Text updates after 1s
    await page.click('#update-text-btn');

    // toHaveText auto-retries until it matches or times out
    await expect(page.locator('#delayed-text')).toHaveText('Updated!', { timeout: 5000 });
  });

  test('all three delayed actions in sequence — zero waits', async ({ page }) => {
    // Click all three triggers
    await page.click('#show-delayed');
    await page.click('#enable-input-btn');
    await page.click('#update-text-btn');

    // Assert all three outcomes — auto-waiting handles the timing
    await expect(page.locator('#delayed-element')).toBeVisible({ timeout: 5000 });
    await page.fill('#delayed-input', 'hello', { timeout: 5000 });
    await expect(page.locator('#delayed-text')).toHaveText('Updated!', { timeout: 5000 });
  });
});
