import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const base = process.env.SITE_URL || 'http://127.0.0.1:4175/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(base, { waitUntil: 'domcontentloaded' });
const ids = ['avatar','ugc','film','reels','images','automation','whatsapp','websites','apps','crm'];
const sources = new Set(), messages = new Set();
for (const id of ids) {
  const card = page.locator(`.service-card[data-service="${id}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.locator('img').evaluate(img => img.decode());
  assert.ok(await card.locator('img').evaluate(img => img.complete && img.naturalWidth > 0));
  await card.click();
  await page.locator('dialog').waitFor({ state: 'visible' });
  const visual = page.locator('.dialog-visual');
  await visual.evaluate(img => img.decode());
  sources.add(await visual.getAttribute('src'));
  messages.add(await page.locator('#dialog-footer a').getAttribute('href'));
  const dimensions = await visual.evaluate(img => ({ natural: img.naturalWidth / img.naturalHeight, displayed: img.clientWidth / img.clientHeight, fit: getComputedStyle(img).objectFit }));
  assert.ok(Math.abs(dimensions.natural - dimensions.displayed) < .01, `${id}: distorted image`);
  assert.equal(dimensions.fit, 'contain');
  await page.keyboard.press('Escape');
}
assert.equal(sources.size, 10);
assert.equal(messages.size, 10);
for (const width of [360, 390, 768, 950, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.locator('.service-card[data-service="avatar"]').click();
  await page.locator('dialog').waitFor({ state: 'visible' });
  await page.locator('#dialog-content').evaluate(el => el.scrollTop = el.scrollHeight);
  for (const selector of ['.dialog-close', '#dialog-footer a', '#dialog-pagination']) {
    const rect = await page.locator(selector).boundingBox();
    assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width && rect.y + rect.height <= 900, `${selector} outside viewport at ${width}`);
  }
  assert.ok(await page.locator('#dialog-content').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `Dialog overflow ${width}`);
  await page.locator('#dialog-pagination button').last().click();
  await page.waitForFunction(() => document.querySelector('#detail-title')?.textContent === 'UGC & product ads');
  assert.equal(await page.locator('#dialog-content').evaluate(el => el.scrollTop), 0);
  if (width === 390 || width === 1440) {
    await page.locator('.dialog-visual').evaluate(img => img.decode());
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `Dialog accessibility at ${width}`);
    await page.screenshot({ path: `v3-dialog-${width}-preview.png` });
  }
  await page.keyboard.press('Escape');
}
await page.locator('.service-card[data-service="reels"]').scrollIntoViewIfNeeded();
await page.locator('.service-art img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
await page.screenshot({ path: 'v3-services-loaded-preview.png' });
assert.deepEqual(errors, []);
console.log('PASS: 10 unique complete images, 10 distinct WhatsApp messages, persistent controls and no dialog overflow at 5 widths, service switching resets scroll, mobile/desktop dialog accessibility and no JavaScript exceptions.');
await browser.close();
