import { expect, test } from '@playwright/test'

test('disassembly video remains visible and advances smoothly with scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/design')
  await expect(page.getByRole('heading', { name: /purposeful by design/i })).toBeVisible()

  const video = page.locator('.disassembly-video')
  await expect(video).toBeVisible()
  await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2)

  await page.locator('#object').evaluate((section) => window.scrollTo(0, section.offsetTop + 900))
  await page.waitForTimeout(450)
  const before = await video.evaluate((node) => node.currentTime)
  await page.mouse.wheel(0, 700)
  await page.waitForTimeout(900)
  const after = await video.evaluate((node) => node.currentTime)
  const headingBox = await page.getByRole('heading', { name: /built from silence/i }).boundingBox()

  expect(after).toBeGreaterThan(before + 0.15)
  expect(headingBox.y).toBeGreaterThanOrEqual(72)
  expect(errors).toEqual([])
})

test('mobile design page keeps a visible product film surface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/design')
  await page.locator('#object').scrollIntoViewIfNeeded()
  await expect(page.locator('.disassembly-video')).toBeVisible()
  await expect(page.locator('.disassembly-video')).toHaveJSProperty('readyState', 4)
})

test('small wheel increments produce monotonic, bounded video-frame movement', async ({ page }) => {
  await page.goto('/design')
  const video = page.locator('.disassembly-video')
  await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2)
  await page.locator('#object').evaluate((section) => window.scrollTo(0, section.offsetTop + 250))
  await page.waitForTimeout(500)

  const samples = []
  for (let index = 0; index < 18; index += 1) {
    await page.mouse.wheel(0, 80)
    await page.waitForTimeout(70)
    samples.push(await video.evaluate((node) => node.currentTime))
  }

  const deltas = samples.slice(1).map((time, index) => time - samples[index])
  expect(Math.min(...deltas)).toBeGreaterThanOrEqual(-0.02)
  expect(Math.max(...deltas)).toBeLessThan(0.2)
  expect(samples.at(-1)).toBeGreaterThan(samples[0] + 0.4)
})

test('disassembly begins from a clean assembled product before revealing layers', async ({ page }) => {
  await page.goto('/design')
  const cover = page.locator('.disassembly-cover')
  await page.locator('#object').evaluate((section) => window.scrollTo(0, section.offsetTop + 20))
  await page.waitForTimeout(350)
  await expect(cover).toBeVisible()
  const startOpacity = Number(await cover.evaluate((node) => getComputedStyle(node).opacity))

  await page.mouse.wheel(0, 1800)
  await page.waitForTimeout(900)
  const separatedOpacity = Number(await cover.evaluate((node) => getComputedStyle(node).opacity))

  expect(startOpacity).toBeGreaterThan(0.9)
  expect(separatedOpacity).toBeLessThan(0.2)
})
