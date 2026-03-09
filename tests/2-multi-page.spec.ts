import { test, expect } from '@playwright/test';

test.describe('Multi-Page — Tabs & Popups', () => {
  test('captures popup and verifies cross-page communication', async ({ page }) => {
    await page.goto('/');

    // Click the link and capture the popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('#popup-link'),
    ]);

    // Wait for popup to load
    await popup.waitForLoadState();

    // Verify the popup opened correctly
    await expect(popup).toHaveTitle('Popup Window');
    await expect(popup.locator('h1')).toHaveText('Popup Page');

    // Click the send message button in the popup
    await popup.click('#sendMessage');

    // Verify the popup shows confirmation
    await expect(popup.locator('#status')).toContainText('Message sent to parent!');

    // Verify the parent page received the message
    await expect(page.locator('#popup-status')).toContainText('Hello from popup!');

    await popup.close();
  });

  test('can interact with both parent and popup simultaneously', async ({ page }) => {
    await page.goto('/');

    // Open popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('#popup-link'),
    ]);

    await popup.waitForLoadState();

    // Do something on the parent page while popup is open
    await page.fill('#ctx-username', 'multitab-user');
    await page.fill('#ctx-password', 'pass');
    await page.click('#ctx-login');

    await expect(page.locator('#ctx-status')).toContainText('multitab-user');

    // Now interact with the popup
    await expect(popup.locator('h1')).toHaveText('Popup Page');

    await popup.close();
  });
});
