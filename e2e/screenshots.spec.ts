import { test } from '@playwright/test'

/**
 * UI 审查用的实机截图。
 * 每个状态都能被 URL 直接打开，所以截图不依赖点击顺序，可复现。
 * 产物：output/playwright/shots/*.png
 */
interface Shot {
  name: string
  fx: string
  hash: string
  width: number
  height: number
  full?: boolean
}

const SHOTS: Shot[] = [
  { name: '01-write-fx000-1440', fx: '0', hash: '#/write', width: 1440, height: 900 },
  { name: '02-write-fx350-1440', fx: '3.5', hash: '#/write', width: 1440, height: 900 },
  { name: '03-write-fx500-1440', fx: '5', hash: '#/write', width: 1440, height: 900 },
  { name: '04-dash-fx000-1440', fx: '0', hash: '#/dashboard', width: 1440, height: 900 },
  { name: '05-dash-fx350-1440', fx: '3.5', hash: '#/dashboard', width: 1440, height: 900 },
  { name: '06-dash-fx500-1440', fx: '5', hash: '#/dashboard', width: 1440, height: 900 },
  { name: '07-entries-fx500-1440', fx: '5', hash: '#/entries', width: 1440, height: 900 },
  { name: '08-dash-fx500-1920', fx: '5', hash: '#/dashboard', width: 1920, height: 1080 },
  { name: '09-dash-fx000-1280', fx: '0', hash: '#/dashboard', width: 1280, height: 800 },
  { name: '10-write-fx500-390', fx: '5', hash: '#/write', width: 390, height: 844 },
  { name: '11-dash-fx500-390', fx: '5', hash: '#/dashboard', width: 390, height: 844 },
  { name: '12-dash-fx500-full', fx: '5', hash: '#/dashboard', width: 1440, height: 900, full: true },
  { name: '13-entries-fx500-full', fx: '5', hash: '#/entries', width: 1440, height: 900, full: true },
]

for (const shot of SHOTS) {
  test(`截图 ${shot.name}`, async ({ page }) => {
    await page.setViewportSize({ width: shot.width, height: shot.height })
    await page.goto(`/?fx=${shot.fx}${shot.hash}`)
    await page.waitForTimeout(1100)
    await page.screenshot({
      path: `output/playwright/shots/${shot.name}.png`,
      fullPage: shot.full ?? false,
      animations: 'disabled',
      caret: 'hide',
    })
  })
}
