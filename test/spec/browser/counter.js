import test from 'ava'
import puppeteer from 'puppeteer'
import Server from '../../helpers/Server'
import { expect } from 'cherow';

test('counter', async assert => {
  const server = new Server()
  const { port } = await server.start()
  server.get('/', (request, response) => {
    response.send(`
      <h1>count: <span id="count">0</span></h1>
      <script>
        let count = 0;
        const element = document.getElementById("count")
        element.addEventListener("click", () => {
          count += 1
          element.innerHTML = count
        })
      </script>
    `)
  })
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`)
  var content = await page.content()
  assert.truthy(content.includes('count: <span id="count">0'))
  await page.click("#count")
  var content = await page.content()
  assert.truthy(content.includes('count: <span id="count">1'))
  await browser.close()
  await server.stop()
})
