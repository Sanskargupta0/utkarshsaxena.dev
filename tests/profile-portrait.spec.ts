import { expect, test } from '@playwright/test';

for (const width of [1440, 375]) {
  test(`portrait toggle keeps tab icon and home interactions in sync at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/work');

    const assertIcon = async (href: string) => {
      const icons = page.locator('link[rel="icon"]');
      await expect(icons.first()).toHaveAttribute('href', href);
      for (const icon of await icons.all()) {
        await expect(icon).toHaveAttribute('href', href);
        await expect(icon).toHaveAttribute('type', 'image/png');
      }
      const response = await request.get(href);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
    };

    const home = page.getByRole('link', { name: 'Return home', exact: true });
    const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
    await assertIcon('/icons/mascot-192.png?v=2');
    await expect(mascot).toHaveCount(0);
    await home.click();
    await expect(page).toHaveURL('/');
    await expect(mascot).toBeVisible();
    await assertIcon('/icons/mascot-192.png?v=2');

    const reactions = mascot.locator('span[style*="background-image"]').nth(1);
    await mascot.click();
    await expect(reactions).toHaveCSS('opacity', '1');
    await expect(reactions).toHaveCSS('opacity', '0');

    await page.getByRole('button', { name: 'Show actual profile picture', exact: true }).click();
    await expect(page.getByRole('img', { name: 'Utkarsh Saxena', exact: true })).toBeVisible();
    await assertIcon('/icons/profile-192.png');
    await expect(mascot).toHaveCount(0);

    await page.getByRole('link', { name: 'Background', exact: true }).click();
    await expect(page).toHaveURL('/background');
    await assertIcon('/icons/profile-192.png');
    await home.click();
    await expect(page).toHaveURL('/');
    await assertIcon('/icons/profile-192.png');

    await page.getByRole('button', { name: 'Show mascot', exact: true }).click();
    await assertIcon('/icons/mascot-192.png?v=2');
    await mascot.focus();
    await page.keyboard.press('Enter');
    await expect(reactions).toHaveCSS('opacity', '1');
    expect(errors).toEqual([]);
  });
}
