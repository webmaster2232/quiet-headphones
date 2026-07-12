import { expect, test } from '@playwright/test'

for (const [path, heading] of [['/', /quiet/i], ['/design', /purposeful/i], ['/sound', /room falls away/i], ['/specs', /engineered without compromise/i]]) {
  test(`${path} renders cleanly without loader, overflow, or runtime errors`, async ({ page }) => {
    const errors = []
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible()
    await expect(page.locator('.page-loader')).toBeHidden()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })
}

test('navigation transitions finish cleanly and leave scroll pinning untransformed', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Design' }).click()
  await expect(page).toHaveURL(/\/design$/)
  await expect(page.locator('.page-loader')).toBeHidden()
  await expect(page.getByRole('heading', { name: /purposeful by design/i })).toBeVisible()
  const routeTransform = await page.locator('.page-loader + div').evaluate((node) => getComputedStyle(node).transform)
  expect(routeTransform).toBe('none')

  await page.getByRole('link', { name: 'Sound', exact: true }).click()
  await expect(page).toHaveURL(/\/sound$/)
  await expect(page.locator('.page-loader')).toBeHidden()
  await expect(page.getByRole('heading', { name: /room falls away/i }).first()).toBeVisible()
})
