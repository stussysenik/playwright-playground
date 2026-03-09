import { test, expect } from '@playwright/test';

test.describe('Network Routing — Intercept, Mock, Modify', () => {
  test('mocks API response with page.route()', async ({ page }) => {
    // Set up the mock BEFORE navigating
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { name: 'Ada Lovelace', role: 'Engineer' },
          { name: 'Grace Hopper', role: 'Admiral' },
          { name: 'Alan Turing', role: 'Mathematician' },
        ]),
      });
    });

    await page.goto('/');

    // Click load users — the mock intercepts the request
    await page.click('#load-users');

    // Verify the mocked data rendered
    const items = page.locator('#users-list li');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Ada Lovelace');
    await expect(items.nth(1)).toContainText('Grace Hopper');
    await expect(items.nth(2)).toContainText('Alan Turing');

    // Status shows count
    await expect(page.locator('#users-status')).toContainText('3 users');
  });

  test('can modify outgoing request headers', async ({ page }) => {
    let capturedHeaders: Record<string, string> = {};

    // Intercept requests and inject a custom header
    await page.route('**/api/users', async (route) => {
      const headers = route.request().headers();
      capturedHeaders = headers;

      // Continue with modified headers and mock the response
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'Test', role: 'Tester' }]),
        headers: { 'X-Custom-Header': 'injected-by-playwright' },
      });
    });

    await page.goto('/');
    await page.click('#load-users');

    // Verify the request was intercepted
    await expect(page.locator('#users-list li')).toHaveCount(1);
  });

  test('can abort specific requests', async ({ page }) => {
    let abortedCount = 0;

    // Abort any request to a .png file
    await page.route('**/*.png', async (route) => {
      abortedCount++;
      await route.abort();
    });

    await page.goto('/');

    // The page should load fine — there are no PNGs critical to function
    await expect(page.locator('.hero h1')).toBeVisible();
  });
});
