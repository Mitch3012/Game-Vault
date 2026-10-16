import { expect, test } from '@playwright/test';

test.describe('Contact the dev', () => {
  test('opens a panel with email, LinkedIn and GitHub, and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Contact the dev' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    const panel = page.getByRole('region', { name: 'Contact the developer' });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'mitch3012.jcm@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mitch3012.jcm@gmail.com',
    );
    await expect(panel.getByRole('link', { name: /linkedin\.com/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/mitch3012jcm/',
    );
    await expect(panel.getByRole('link', { name: /github\.com/ })).toHaveAttribute(
      'href',
      'https://github.com/Mitch3012',
    );

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('is on every page, including the login page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('button', { name: 'Contact the dev' })).toBeVisible();
  });

  test('opens LinkedIn and GitHub in a new tab, safely', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Contact the dev' }).click();
    for (const name of [/linkedin\.com/, /github\.com/]) {
      const link = page.getByRole('link', { name });
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });
});
