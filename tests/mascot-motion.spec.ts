import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });

test('large cursor reversals pass through center and settle without ghost layers', async ({ page }) => {
  await page.goto('/');
  const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
  const direction = mascot.locator('[data-direction]');
  await expect(direction).toHaveAttribute('data-ready', 'true');
  const box = await mascot.boundingBox();
  if (!box) throw new Error('Mascot is missing');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x + 240, y);
  await expect(direction).toHaveAttribute('data-direction', 'right');
  await expect(direction).toHaveAttribute('data-tracking', 'idle');
  await direction.evaluate(el => {
    const history: string[] = [];
    const observer = new MutationObserver(() => history.push(el.getAttribute('data-direction') ?? ''));
    observer.observe(el, { attributes: true, attributeFilter: ['data-direction'] });
    Object.assign(window, { mascotHistory: history, mascotObserver: observer });
  });
  await page.mouse.move(x - 240, y);
  await expect(direction).toHaveAttribute('data-direction', 'left');
  await expect(direction).toHaveAttribute('data-tracking', 'idle');
  const history = await page.evaluate(() => {
    const probe = window as typeof window & { mascotHistory: string[]; mascotObserver: MutationObserver };
    probe.mascotObserver.disconnect();
    return probe.mascotHistory;
  });
  expect(history).toContain('center');
  expect(history).toContain('half-right');
  expect(history).toContain('half-left');
  await expect(direction).toHaveCSS('opacity', '1');
  await page.mouse.move(x, y);
  await expect(direction).toHaveAttribute('data-direction', 'center');
  await expect(direction).toHaveAttribute('data-tracking', 'idle');
});

test('reduced motion disables tracking and squash but keeps keyboard reactions', async ({ page }) => {
  await page.goto('/');
  const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
  const direction = mascot.locator('[data-direction]');
  await expect(direction).toHaveAttribute('data-ready', 'true');
  await page.mouse.move(1200, 400);
  await expect(direction).not.toHaveAttribute('data-direction', 'center');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(direction).toHaveAttribute('data-direction', 'center');
  await mascot.focus();
  await page.keyboard.press('Enter');
  await expect(mascot.locator('span[style*="background-image"]').nth(1)).toHaveCSS('opacity', '1');
  expect(await mascot.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(direction).toHaveAttribute('data-tracking', 'idle');
});

test('flipping suspends tracking and navigation home still enables reactions', async ({ page }) => {
  await page.goto('/work');
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page).toHaveURL('/');
  const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
  await expect(mascot).toBeVisible();
  await page.getByRole('button', { name: 'Show actual profile picture', exact: true }).click();
  const hiddenDirection = page.locator('[data-direction]');
  await expect(hiddenDirection).toHaveAttribute('data-direction', 'center');
  await expect(hiddenDirection).toHaveAttribute('data-tracking', 'idle');
  await page.mouse.move(1200, 400);
  await expect(hiddenDirection).toHaveAttribute('data-direction', 'center');
  await page.getByRole('button', { name: 'Show mascot', exact: true }).click();
  await mascot.click();
  await expect(mascot.locator('span[style*="background-image"]').nth(1)).toHaveCSS('opacity', '1');
});

test('uses intermediate poses from a 5x5 direction atlas and the 3x3 expressions', async ({ page, request }) => {
  await page.goto('/');
  const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
  const direction = mascot.locator('[data-direction]');
  await expect(direction).toHaveAttribute('data-ready', 'true');
  await expect(direction).toHaveAttribute('data-grid', '5');
  await expect(direction).toHaveCSS('background-size', '500% 500%');
  await expect(mascot.locator('span[style*="background-image"]').nth(1)).toHaveCSS('background-size', '300% 300%');
  const box = await mascot.boundingBox();
  if (!box) throw new Error('Mascot is missing');
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
  await expect(direction).toHaveAttribute('data-direction', 'half-right');
  await expect(direction).toHaveCSS('background-position', '75% 50%');
  for (const path of ['/mascots/utkarsh-smooth-directions.webp', '/mascots/utkarsh-smooth-reactions.webp']) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
});

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  test('stays neutral without a fine pointer and responds to taps', async ({ page }) => {
    await page.goto('/');
    const mascot = page.getByRole('button', { name: 'Boop the Utkarsh mascot', exact: true });
    await expect(mascot.locator('[data-direction]')).toHaveAttribute('data-ready', 'true');
    await mascot.tap();
    await expect(mascot.locator('span[style*="background-image"]').nth(1)).toHaveCSS('opacity', '1');
    await expect(mascot.locator('[data-direction]')).toHaveAttribute('data-direction', 'center');
  });
});
