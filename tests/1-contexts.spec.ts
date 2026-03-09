import { test, expect } from '@playwright/test';

test.describe('Browser Contexts — Isolated Parallel Sessions', () => {
  test('two users can log in simultaneously in separate contexts', async ({ browser }) => {
    // Create two isolated browser contexts
    const aliceContext = await browser.newContext({ baseURL: 'http://localhost:3333' });
    const bobContext = await browser.newContext({ baseURL: 'http://localhost:3333' });

    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();

    // Both navigate to the playground
    await alicePage.goto('/');
    await bobPage.goto('/');

    // Alice logs in
    await alicePage.fill('#ctx-username', 'alice');
    await alicePage.fill('#ctx-password', 'pass123');
    await alicePage.click('#ctx-login');

    // Bob logs in (different context — fully isolated)
    await bobPage.fill('#ctx-username', 'bob');
    await bobPage.fill('#ctx-password', 'pass456');
    await bobPage.click('#ctx-login');

    // Verify each context has its own user
    await expect(alicePage.locator('#ctx-status')).toContainText('alice');
    await expect(bobPage.locator('#ctx-status')).toContainText('bob');

    // Verify localStorage isolation
    const aliceStorage = await alicePage.evaluate(() => localStorage.getItem('playground-user'));
    const bobStorage = await bobPage.evaluate(() => localStorage.getItem('playground-user'));

    expect(aliceStorage).toBe('alice');
    expect(bobStorage).toBe('bob');

    // Cleanup
    await aliceContext.close();
    await bobContext.close();
  });

  test('logging out in one context does not affect the other', async ({ browser }) => {
    const ctx1 = await browser.newContext({ baseURL: 'http://localhost:3333' });
    const ctx2 = await browser.newContext({ baseURL: 'http://localhost:3333' });

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    // Both log in
    await page1.fill('#ctx-username', 'user1');
    await page1.fill('#ctx-password', 'pass');
    await page1.click('#ctx-login');

    await page2.fill('#ctx-username', 'user2');
    await page2.fill('#ctx-password', 'pass');
    await page2.click('#ctx-login');

    // User1 logs out
    await page1.click('#ctx-logout');

    // User2 is still logged in
    await expect(page2.locator('#ctx-status')).toContainText('user2');
    await expect(page1.locator('#ctx-status')).toHaveText('');

    await ctx1.close();
    await ctx2.close();
  });
});
