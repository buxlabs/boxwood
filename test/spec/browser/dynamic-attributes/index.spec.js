const test = require('ava')
const { join } = require('path')
const suite = require('../../../helpers/feature/suite')
const path = (example) => join(__dirname, `./examples/${example}.html`)

const spec = (assert) => async ({ page }) => {
  const img = await page.$("img[src='test.png'][alt='test']")
  assert.truthy(img)
}

test('counter: vanilla', async assert => {
  await suite(path('vanilla'), spec(assert))
})

test('counter: scoped', async assert => {
  await suite(path('boxwood'), spec(assert))
})
