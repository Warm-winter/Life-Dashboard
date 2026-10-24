/**
 * 生成参赛提交素材：1 张封面 + 5 张项目截图。
 * 用法：node scripts/make-assets.mjs
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { chromium } from '@playwright/test'

const ROOT = process.cwd()
const SHOTS = path.join(ROOT, 'output', 'playwright', 'shots')
const OUT = path.join(ROOT, 'output', 'submission')

const PICKS = [
  ['03-write-fx500-1440.png', '01-写日记-五毛钱MAX.png'],
  ['06-dash-fx500-1440.png', '02-数据看板-五毛钱MAX.png'],
  ['04-dash-fx000-1440.png', '03-数据看板-极简档.png'],
  ['01-write-fx000-1440.png', '04-写日记-极简档.png'],
  ['07-entries-fx500-1440.png', '05-日记本-五毛钱MAX.png'],
]

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

await mkdir(OUT, { recursive: true })

/* ── 1. 封面 ── */
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(path.join(ROOT, 'scripts', 'cover.html')).href, { waitUntil: 'load' })
await page.waitForTimeout(700)

const coverPng = path.join(OUT, '00-封面-五毛钱人生仪表盘.png')
await page.screenshot({ path: coverPng })

// 太大就同时给一张 JPG 备选（表单支持 JPG）
const coverStat = await stat(coverPng)
let coverJpg = null
if (coverStat.size > 3.5 * 1024 * 1024) {
  coverJpg = path.join(OUT, '00-封面-五毛钱人生仪表盘.jpg')
  await page.screenshot({ path: coverJpg, type: 'jpeg', quality: 92 })
}
// 横幅备选：如果表单把封面裁成宽条，用这张
await page.setViewportSize({ width: 1920, height: 620 })
await page.goto(pathToFileURL(path.join(ROOT, 'scripts', 'cover-wide.html')).href, { waitUntil: 'load' })
await page.waitForTimeout(600)
const widePng = path.join(OUT, '00-封面-横幅备选.png')
await page.screenshot({ path: widePng })

await browser.close()

/* ── 2. 项目截图 ── */
const report = []
for (const [from, to] of PICKS) {
  const src = path.join(SHOTS, from)
  const dest = path.join(OUT, to)
  await copyFile(src, dest)
  report.push([to, (await stat(dest)).size])
}

/* ── 3. 汇报 ── */
console.log('封面：', `00-封面-五毛钱人生仪表盘.png`, kb(coverStat.size))
if (coverJpg) console.log('封面 JPG 备选：', path.basename(coverJpg), kb((await stat(coverJpg)).size))
console.log('横幅备选：', '00-封面-横幅备选.png', kb((await stat(widePng)).size))
for (const [name, size] of report) console.log('截图：', name, kb(size))
console.log('输出目录：', OUT)
