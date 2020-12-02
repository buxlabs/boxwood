const test = require('ava')
const puppeteer = require('puppeteer')
const Server = require('../../helpers/Server')
const compile = require('../../helpers/compile')

test('counter: vanilla', async assert => {
  const server = new Server()
  const { port } = await server.start()
  server.get('/', (request, response) => {
    response.send(`
      <button>Clicked 0 times</button>
      <script>
        let count = 0;
        const element = document.querySelector("button")
        element.addEventListener("click", () => {
          count += 1
          element.innerHTML = "Clicked " + count + " " + (count === 1 ? "time" : "times")
        })
      </script>
    `)
  })
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
})

test('counter: scoped', async assert => {
  const server = new Server()
  const { port } = await server.start()
  server.get('/', async (request, response) => {
    const { template } = await compile(`
      <div id="app"></div>
      <script scoped>
        import { div, button, app } from "boxwood"

        const view = ({ count }) =>
          button({
            onclick: (state) => ({ ...state, count: state.count + 1 })
          }, \`Clicked \${count} \${count === 1 ? "time" : "times"}\`)

        app({
          view,
          state: { count: 0 },
          root: document.getElementById("app")
        })
      </script>
    `, {})
    response.send(template())
  })
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
})
