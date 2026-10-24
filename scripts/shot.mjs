/**
 * 快速截图脚本（开发期用，非测试）。
 * 用法：node scripts/shot.mjs [url] [out.png] [width] [height] [full]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://127.0.0.1:5174/?fx=3.5#/write'
const out = process.argv[3] ?? 'output/playwright/quick.png'
const width = Number(process.argv[4] ?? 1440)
const height = Number(process.argv[5] ?? 900)
const fullPage = process.argv[6] === 'full'

await mkdir('output/playwright', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })

const problems = []
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(`console.error: ${message.text()}`)
})

const response = await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
await page.screenshot({ path: out, fullPage })

const metrics = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  bodyHeight: document.body.scrollHeight,
  fx: document.documentElement.dataset.fx,
  title: document.title,
}))

console.log(
  JSON.stringify({ status: response?.status(), out, fullPage, metrics, problems }, null, 2),
)

await browser.close()
