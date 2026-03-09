import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Tracing — Time-Travel Debugging', () => {
  test('captures a trace chunk with DOM snapshots and screenshots', async ({ page, context }) => {
    // Use startChunk/stopChunk to capture a named trace segment
    // (auto-tracing already called tracing.start() on this context)
    await context.tracing.startChunk({ title: 'Login flow trace' });

    // Perform a series of actions that get captured in the trace
    await page.goto('/');

    // Interact with the login form
    await page.fill('#ctx-username', 'trace-user');
    await page.fill('#ctx-password', 'trace-pass');
    await page.click('#ctx-login');
    await expect(page.locator('#ctx-status')).toContainText('trace-user');

    // Interact with the auto-wait section
    await page.click('#update-text-btn');
    await expect(page.locator('#delayed-text')).toHaveText('Updated!');

    // Stop the chunk and save to file
    const tracePath = path.join('test-results', 'trace.zip');
    await context.tracing.stopChunk({ path: tracePath });
    // Resume a chunk so auto-tracing cleanup can stop it gracefully
    await context.tracing.startChunk();

    // Verify the trace file was created
    expect(fs.existsSync(tracePath)).toBe(true);

    // Verify it has content (a real trace is several hundred KB)
    const stats = fs.statSync(tracePath);
    expect(stats.size).toBeGreaterThan(1000);
  });

  test('trace captures network activity', async ({ page, context }) => {
    await context.tracing.startChunk({ title: 'Network activity trace' });

    // Mock the API so we have a clean network entry in the trace
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'Traced User', role: 'QA' }]),
      });
    });

    await page.goto('/');
    await page.click('#load-users');
    await expect(page.locator('#users-list li')).toHaveCount(1);

    const tracePath = path.join('test-results', 'trace-network.zip');
    await context.tracing.stopChunk({ path: tracePath });
    // Resume a chunk so auto-tracing cleanup can stop it gracefully
    await context.tracing.startChunk();

    expect(fs.existsSync(tracePath)).toBe(true);
  });
});
