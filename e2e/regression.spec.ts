import { expect, test, type Page } from '@playwright/test'

function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })
  return errors
}

const VIEWPORTS = [
  { name: '桌面 1440', width: 1440, height: 900 },
  { name: '笔记本 1280', width: 1280, height: 800 },
  { name: '手机 390', width: 390, height: 844 },
]

const VIEWS = [
  { hash: '#/write', keyword: '写日记' },
  { hash: '#/dashboard', keyword: '数据看板' },
  { hash: '#/entries', keyword: '日记本' },
]

test.describe('回归：三视图 × 三视口', () => {
  for (const viewport of VIEWPORTS) {
    for (const view of VIEWS) {
      test(`${view.keyword} @ ${viewport.name} 无溢出无报错`, async ({ page }) => {
        const errors = watchErrors(page)
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(`/?fx=5${view.hash}`)

        await expect(page.getByRole('heading', { level: 1 })).toContainText(view.keyword)

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, '出现横向滚动').toBeLessThanOrEqual(1)

        // 关键内容必须真的在视口里，而不是被顶栏/底栏吃掉
        const box = await page.locator('main').boundingBox()
        expect(box?.width ?? 0).toBeGreaterThan(200)
        expect(box?.height ?? 0).toBeGreaterThan(200)

        expect(errors, errors.join('\n')).toEqual([])
      })
    }
  }
})

test.describe('回归：交互', () => {
  test('档位滑杆与快捷按钮都能改 data-fx', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/?fx=3.5#/dashboard')
    await expect(page.locator('html')).toHaveAttribute('data-fx', '3.5')

    await page.getByRole('button', { name: 'MAX' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-fx', '5')

    await page.getByRole('button', { name: '¥0', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-fx', '0')

    const slider = page.locator('.fx-slider')
    await slider.focus()
    await slider.press('ArrowRight')
    await expect(page.locator('html')).toHaveAttribute('data-fx', '0.5')

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('搜索结果按关键字过滤', async ({ page }) => {
    await page.goto('/?fx=3.5#/entries')
    const rows = page.locator('.entry-row')
    await expect(rows).toHaveCount(19)

    await page.locator('#entries-search').fill('加班')
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(19)

    await page.locator('#entries-search').fill('绝对不存在的关键字zzz')
    await expect(page.getByText('没有找到包含')).toBeVisible()
  })

  test('详情弹窗可打开并用 Esc 关闭', async ({ page }) => {
    await page.goto('/?fx=3.5#/entries')
    await page.locator('.entry-row').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('项目终于上线了')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('删除一篇需要二次确认', async ({ page }) => {
    await page.goto('/?fx=3.5#/entries')
    await expect(page.locator('.entry-row')).toHaveCount(19)

    await page.locator('.entry-row').first().click()
    await page.getByRole('button', { name: '删除这篇' }).click()
    await expect(page.getByRole('dialog')).toContainText('真的删掉这篇')

    await page.getByRole('button', { name: '删除', exact: true }).click()
    await expect(page.locator('.entry-row')).toHaveCount(18)
  })

  test('清空之后三个视图都显示空态', async ({ page }) => {
    await page.goto('/?fx=3.5#/entries')
    await page.getByRole('button', { name: '清空' }).click()
    await expect(page.getByRole('dialog')).toContainText('清空全部日记')
    await page.getByRole('button', { name: '全部清空' }).click()

    await expect(page.getByText('日记本还是空的。')).toBeVisible()

    await page.getByRole('button', { name: '数据看板' }).click()
    await expect(page.getByText('还没有任何记录，图上没东西可画。')).toBeVisible()

    await page.getByRole('button', { name: '写日记' }).click()
    await expect(page.locator('.editor-title')).toHaveValue('')
  })

  test('载入示例可以恢复数据', async ({ page }) => {
    await page.goto('/?fx=3.5#/entries')
    await page.getByRole('button', { name: '清空' }).click()
    await page.getByRole('button', { name: '全部清空' }).click()
    await expect(page.locator('.entry-row')).toHaveCount(0)

    await page.getByRole('button', { name: '载入示例' }).click()
    await expect(page.locator('.entry-row')).toHaveCount(19)
  })

  test('数字键 2 切到看板，hash 同步', async ({ page }) => {
    await page.goto('/?fx=3.5#/write')
    await page.locator('main').click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('2')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('数据看板')
    expect(page.url()).toContain('#/dashboard')
  })
})
