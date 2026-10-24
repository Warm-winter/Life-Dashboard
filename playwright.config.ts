import { defineConfig, devices } from '@playwright/test'

/**
 * 说明：
 * - 默认用系统 Chrome（channel: 'chrome'），避免现场再下一遍 120MB 浏览器。
 * - 端口固定 5174，webServer 会复用已启动的 dev server（我通常在后台常驻一个）。
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './output/playwright/.artifacts',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
