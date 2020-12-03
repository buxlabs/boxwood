const test = require('ava')
const { join } = require('path')
const suite = require('../../../helpers/feature/suite')
const path = (example) => join(__dirname, `./examples/${example}.html`)

const spec = (assert) => async ({ page }) => {
  const content = await page.content()
  assert.truthy(content.includes('Hello, world!'))
  const paragraph = await page.$('p')
  const property = await paragraph.getProperty('style')
  const value = await property.jsonValue()
  assert.deepEqual(value, { 0: 'color', 1: 'font-weight' })
}

test('counter: vanilla', async assert => {
  await suite(path('vanilla'), spec(assert))
})

test('counter: scoped', async assert => {
  await suite(path('boxwood'), spec(assert))
})
