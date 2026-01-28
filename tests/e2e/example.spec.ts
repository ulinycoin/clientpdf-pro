import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/LocalPDF/);
});

test('get started link', async ({ page }) => {
    await page.goto('/');

    // Check if main heading is present
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
});
