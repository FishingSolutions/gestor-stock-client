const path = require('path')
const { chromium } = require('/tmp/mockup-tools/node_modules/playwright-core')

const executablePath =
  process.env.HOME +
  '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'

const pageUrl = 'file://' + path.join(__dirname, 'productos.html')
const variants = ['v1', 'v2', 'v3', 'v4', 'v5']

async function shoot(browser, variant, kind, options) {
  const page = await browser.newPage(options)
  await page.goto(`${pageUrl}?variant=${variant}&clean=1`, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(250)
  const height = await page.evaluate(() => document.body.scrollHeight)
  await page.screenshot({
    path: path.join(__dirname, 'shots', `${variant}-${kind}.png`),
    fullPage: true,
  })
  await page.close()
  console.log(`${variant}-${kind}: ${height}px`)
}

;(async () => {
  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
  })

  for (const variant of variants) {
    await shoot(browser, variant, 'desktop', {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    })
    await shoot(browser, variant, 'mobile', {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
  }

  await browser.close()
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
