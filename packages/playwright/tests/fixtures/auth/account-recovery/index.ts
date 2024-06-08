import type { Page } from '@playwright/test'

export const clearCookies = async (page: Page) => {
  await page.context().clearCookies()
}
