import { expect, test } from '@playwright/test';

import { mockRawg } from './rawg-mock';

/** What a visitor who has not logged in can do. No account or Firebase data is needed. */
test.describe('as a logged-out visitor', () => {
  test.beforeEach(async ({ page }) => {
    await mockRawg(page);
  });

  test('sees the home page with a search box', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome to the Game Vault');
    await expect(page.getByLabel('Search')).toBeVisible();
  });

  test('the title links to the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Welcome to the Game Vault' })).toHaveAttribute('href', '/auth');
  });

  test('can search for a game', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search').fill('hades');
    await page.getByLabel('Search').press('Enter');
    await expect(page.getByRole('heading', { name: 'Hades' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Celeste' })).toBeVisible();
  });

  test('is told to log in when they try to add a game, without being redirected', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search').fill('hades');
    await page.getByLabel('Search').press('Enter');
    const notice = page.getByRole('status').filter({ hasText: "You haven't logged in yet" });

    // Firebase takes a moment to say nobody is signed in, so keep trying until the notice appears.
    await expect(async () => {
      await page.getByRole('button', { name: 'Add to vault' }).first().click({ timeout: 2_000 });
      await expect(notice).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000 });

    await expect(page).toHaveURL(/\/$/);
    const link = notice.getByRole('link', { name: 'Click here to log in' });
    await expect(link).toHaveAttribute('href', '/auth');
    await link.click();
    await expect(page).toHaveURL(/\/auth$/);
  });

  test('the login notice can be dismissed', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search').fill('hades');
    await page.getByLabel('Search').press('Enter');
    const notice = page.getByRole('status').filter({ hasText: "You haven't logged in yet" });
    await expect(async () => {
      await page.getByRole('button', { name: 'Add to vault' }).first().click({ timeout: 2_000 });
      await expect(notice).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000 });

    await notice.getByRole('button', { name: 'Dismiss' }).click();
    await expect(notice).toBeHidden();
  });

  test('is sent to the login page from the vault pages', async ({ page }) => {
    await page.goto('/game-list');
    await expect(page).toHaveURL(/\/auth$/);
    await page.goto('/form/anything');
    await expect(page).toHaveURL(/\/auth$/);
  });

  test('can reach the sign-up page from the login page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await page.getByRole('link', { name: 'Sign up here' }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test('an unknown address goes back to the home page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page).toHaveURL(/\/$/);
  });
});
