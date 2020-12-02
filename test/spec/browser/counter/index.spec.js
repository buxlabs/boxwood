const test = require('ava')
const puppeteer = require('puppeteer')
const { promises: fs } = require('fs')
const { join } = require('path')
const Server = require('../../../helpers/Server')
const compile = require('../../../helpers/compile')

async function suite (assert, example) {
  const server = new Server()
  const { port } = await server.start()
  const source = await fs.readFile(join(__dirname, `./examples/${example}.html`), 'utf8')
  const { template } = await compile(source)
  const html = template()
  server.get('/', (request, response) => response.send(html))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`)
  var content = await page.content()
  assert.truthy(content.includes('Clicked 0 times'))
  await page.click("button")
  var content = await page.content()
  assert.truthy(content.includes('Clicked 1 time'))
  await page.click("button")
  var content = await page.content()
  assert.truthy(content.includes('Clicked 2 times'))
  await browser.close()
  await server.stop()
}

test('counter: vanilla', async assert => {
  await suite(assert, 'vanilla')
})

test('counter: scoped', async assert => {
  await suite(assert, 'boxwood')
})
