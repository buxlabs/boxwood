const puppeteer = require('puppeteer')
const { promises: fs } = require('fs')
const Server = require('../Server')
const compile = require('../deprecated-compile')

async function suite (example, run) {
  const server = new Server()
  const { port } = await server.start()
  const source = await fs.readFile(example, 'utf8')
  const { template } = await compile(source)
  const html = template()
  server.get('/', (request, response) => response.send(html))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`)
  await run({ page })
  await browser.close()
  await server.stop()
}

module.exports = suite
