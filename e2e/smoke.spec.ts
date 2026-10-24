import { expect, test, type Page } from '@playwright/test'

/** 收集控制台与运行时错误；任何一条都视为失败。 */
function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })
  return errors
}

const NEW_TITLE = '回归测试：在旧日历上写一篇'
const NEW_BODY = '这是自动化测试写进去的一段话，用来验证自动保存、列表同步和刷新后仍然存在。'

test.describe('冒烟测试', () => {
  test('首屏可用、关键区域渲染、零控制台错误', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/?fx=3.5#/write')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('写日记')
    await expect(page.locator('.editor-title')).toBeVisible()
    await expect(page.locator('.editor-body')).toBeVisible()
    await expect(page.locator('.tag-editor input')).toBeVisible()
    await expect(page.locator('.topbar .tabs')).toBeVisible()

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('写一篇新日记：自动保存 → 出现在日记本 → 刷新后仍在', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/?fx=3.5#/write')

    await page.locator('#entry-date').fill('2024-01-01')
    await page.locator('.editor-title').fill(NEW_TITLE)
    await page.locator('.editor-body').fill(NEW_BODY)

    // 停笔 420ms 后落盘
    await page.waitForFunction(
      (title) => {
        try {
          const raw = window.localStorage.getItem('wmk.entries.v1')
          const parsed = raw ? JSON.parse(raw) : null
          return Boolean(parsed?.entries?.some((item: { title: string }) => item.title === title))
        } catch {
          return false
        }
      },
      NEW_TITLE,
    )

    await page.getByRole('button', { name: '日记本' }).click()
    await expect(page.locator('.entry-title', { hasText: NEW_TITLE })).toBeVisible()

    await page.reload()
    await page.getByRole('button', { name: '日记本' }).click()
    await expect(page.locator('.entry-title', { hasText: NEW_TITLE })).toBeVisible()

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('看板数字跟着新日记变化', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/?fx=3.5#/dashboard')
    const firstKpi = page.locator('.kpi-value').first()
    await expect(firstKpi).toContainText('19')

    await page.getByRole('button', { name: '写日记' }).click()
    await page.locator('#entry-date').fill('2024-02-02')
    await page.locator('.editor-title').fill('再看板测试')
    await page.locator('.editor-body').fill('数一下篇数会不会变。')

    await page.waitForFunction(() => {
      const raw = window.localStorage.getItem('wmk.entries.v1')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed?.entries?.length === 20
    })

    await page.getByRole('button', { name: '数据看板' }).click()
    await expect(page.locator('.kpi-value').first()).toContainText('20')
    expect(errors, errors.join('\n')).toEqual([])
  })
})
