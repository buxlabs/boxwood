const test = require('ava')
const { join } = require('path')
const suite = require('../../../helpers/feature/suite')
const path = (example) => join(__dirname, `./examples/${example}.html`)

const spec = (assert) => async ({ page }) => {
  var content = await page.content()
  assert.truthy(content.includes('Clicked 0 times'))
  await page.click("button")
  var content = await page.content()
  assert.truthy(content.includes('Clicked 1 time'))
  await page.click("button")
  var content = await page.content()
  assert.truthy(content.includes('Clicked 2 times'))
}

test('counter: vanilla', async assert => {
  await suite(path('vanilla'), spec(assert))
})

test('counter: scoped (esbuild)', async assert => {
  await suite(path('boxwood-esbuild'), spec(assert))
})

test('counter: scoped (rollup)', async assert => {
  await suite(path('boxwood-rollup'), spec(assert))
})

