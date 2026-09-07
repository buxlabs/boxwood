const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile, js, ScriptError } = require("../../..")

const head = (html) => html.slice(0, html.indexOf("</head>"))
const body = (html) => html.slice(html.indexOf("<body>"))

test("#scripts/inline-target: js.head lands in the head, js in the body", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // The assignment, not the name - the body script reads window.theme, so
  // the bare name legitimately appears in both.
  assert(head(html).includes('window.theme = "dark"'))
  assert(!body(html).includes('window.theme = "dark"'))
  assert(body(html).includes("#output"))
  assert(!head(html).includes("#output"))
})

test("#scripts/inline-target: head scripts merge into one tag", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  assert.strictEqual(html.match(/<script/g).length, 2) // one per target
  assert(head(html).includes("window.locale"))
})

test("#scripts/inline-target: the target never reaches the markup", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  assert(!html.includes("target="))
  assert(!/<script\s+[^>]/.test(html))
})

test("#scripts/inline-target: the head runs before the body", async () => {
  const { template } = await compile(__dirname)
  const dom = new JSDOM(template(), { runScripts: "dangerously" })

  // The body script reads what the head script set, so ordering is the test.
  assert.strictEqual(
    dom.window.document.querySelector("#output").textContent,
    "dark/pl",
  )
})

test("#scripts/inline-target: js.head interpolates by the same rules", async () => {
  // Children are an array here, the shape js.load produces for a script that
  // carries attributes.
  assert.deepStrictEqual(js.head`window.n = ${0}`.js.children, ["window.n = 0"])
  assert.throws(() => js.head`window.q = "${undefined}"`, ScriptError)
})
