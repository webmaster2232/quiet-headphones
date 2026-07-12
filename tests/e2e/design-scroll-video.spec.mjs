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
