import test from 'ava'
import puppeteer from 'puppeteer'
import Server from '../../helpers/Server'
import compile from '../../helpers/compile'

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
  await browser.close()
  await server.stop()
})

test.skip('counter: scoped', async assert => {
  const server = new Server()
  const { port } = await server.start()
  server.get('/', async (request, response) => {
    const { template } = await compile(`
      <button onclick={onClick}>Clicked {count} {count === 1 ? 'time' : 'times'}</button>
      <script scoped>
        let count = 0;
        function onClick () {
          count += 1
        }
      </script>
    `, {})
    console.log(template.toString())
    response.send(template())
  })
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`)
  var content = await page.content()
  console.log(content)
  assert.truthy(content.includes('Clicked 0 times'))
  await page.click("button")
  var content = await page.content()
  assert.truthy(content.includes('Clicked 1 time'))
  await browser.close()
  await server.stop()
})
