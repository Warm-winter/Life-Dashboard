/**
 * 元素级放大截图，用于 UI 审查。
 * 用法：node scripts/zoom.mjs <url> <selector> <out.png> [dsf]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://127.0.0.1:5174/?fx=3.5#/write'
const selector = process.argv[3] ?? '.analysis-grid'
const out = process.argv[4] ?? 'output/playwright/zoom.png'
const dsf = Number(process.argv[5] ?? 2)

await mkdir('output/playwright', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

const target = page.locator(selector).first()
await target.scrollIntoViewIfNeeded()
await page.waitForTimeout(200)
await target.screenshot({ path: out })
console.log(JSON.stringify({ out, selector }, null, 2))
await browser.close()
