import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const base = process.env.SITE_URL || 'http://127.0.0.1:4175/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => document.fonts.ready);
for (const width of [360, 390, 768, 950, 1440, 1920]) {
  await page.setViewportSize({ width, height: 950 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
  const brand = await page.locator('.site-header .brand').boundingBox();
  const actions = await page.locator('.header-actions').boundingBox();
  assert.ok(brand.x + brand.width < actions.x, `Header overlaps ${width}`);
  assert.ok(actions.x + actions.width <= width, `Header actions outside viewport ${width}`);
  if (width === 390 || width === 1440) await page.screenshot({ path: `identity-header-${width}-preview.png` });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.ok(await page.locator('.floating-contact').evaluate(el => el.inert && !el.classList.contains('visible')), 'Floating contact overlaps footer');
  assert.ok(await page.locator('footer').evaluate(el => el.scrollWidth <= el.clientWidth), `Footer overflow ${width}`);
  assert.ok(await page.locator('footer nav').isVisible(), `Footer navigation hidden at ${width}`);
  assert.equal(await page.locator('.floating-contact').evaluate(el => getComputedStyle(el).visibility), 'hidden');
  if (width === 390 || width === 1440) {
    await page.locator('footer').screenshot({ path: `identity-footer-${width}-preview.png` });
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) })), [], `Accessibility at ${width}`);
  }
}
assert.equal(await page.locator('footer a[href="tel:+917575807403"]').count(), 1);
assert.equal(await page.locator('footer a[href="mailto:smitkapadiya.work@gmail.com"]').count(), 1);
for (const href of await page.locator('.footer-links a').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
  assert.equal(await page.locator(href).count(), 1, `Broken footer link ${href}`);
}
assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.kapadiya.tech/');
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('.menu-toggle').click();
await page.locator('#mobile-menu a[href="#services"]').click();
assert.equal(await page.locator('.menu-toggle').getAttribute('aria-label'), 'Open navigation');
await page.locator('#privacy-open').click();
await page.locator('dialog').waitFor({ state: 'visible' });
await page.keyboard.press('Escape');
await page.locator('footer a[href="#"]').last().click();
await page.waitForFunction(() => scrollY < 10);
assert.deepEqual(errors, []);
console.log('PASS: eye identity and header fit at 6 widths, footer links, no obscured footer controls, canonical URL, menu labels, privacy and back-to-top, mobile/desktop accessibility, no JS errors.');
await browser.close();
