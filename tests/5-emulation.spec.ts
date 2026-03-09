import { test, expect, devices } from '@playwright/test';

test.describe('Device Emulation — Mobile, Geolocation, Permissions', () => {
  test('emulates iPhone with geolocation and dark mode', async ({ browser }) => {
    const iPhone = devices['iPhone 14 Pro'];

    const context = await browser.newContext({
      ...iPhone,
      baseURL: 'http://localhost:3333',
      locale: 'en-US',
      geolocation: { latitude: 37.7749, longitude: -122.4194 },
      permissions: ['geolocation'],
      colorScheme: 'dark',
    });

    const page = await context.newPage();
    await page.goto('/');

    // Verify viewport matches iPhone 14 Pro
    const viewport = page.viewportSize();
    expect(viewport!.width).toBe(393);

    // Verify the page reports viewport dimensions
    await expect(page.locator('#emu-viewport')).not.toHaveText('—');

    // Verify dark color scheme is detected
    await expect(page.locator('#emu-scheme')).toHaveText('dark');

    // Click geolocation button and verify coordinates
    await page.click('#emu-geo-btn');
    await expect(page.locator('#emu-geo')).toContainText('37.7749', { timeout: 5000 });
    await expect(page.locator('#emu-geo')).toContainText('-122.4194');

    await context.close();
  });

  test('emulates a desktop with light mode and different location', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:3333',
      viewport: { width: 1920, height: 1080 },
      geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris
      permissions: ['geolocation'],
      colorScheme: 'light',
    });

    const page = await context.newPage();
    await page.goto('/');

    // Verify desktop viewport
    const viewport = page.viewportSize();
    expect(viewport!.width).toBe(1920);

    // Verify light scheme
    await expect(page.locator('#emu-scheme')).toHaveText('light');

    // Verify Paris geolocation
    await page.click('#emu-geo-btn');
    await expect(page.locator('#emu-geo')).toContainText('48.8566', { timeout: 5000 });

    await context.close();
  });
});
