const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile, ScriptError } = require("../..")

test("#function-values: a lone function argument is a child, not attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // This used to fall into the attributes branch of tag() and render as an
  // empty element, dropping the value without a word.
  assert(html.includes('<span id="lone">5</span>'))
})

test("#function-values: a thunk is called and its result rendered", async () => {
  const { template } = await compile(__dirname)

  assert(template().includes('<div id="thunk">10</div>'))
})

test("#function-values: a function among other children renders in place", async () => {
  const { template } = await compile(__dirname)

  assert(template().includes('<p id="between">Count: 5 and counting</p>'))
})

test("#function-values: a function child is never rendered as an element", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // <br>, <count></count>, <style></style> - all of them came from .name.
  assert(html.includes('<p id="named">break bold inline</p>'))
  assert(!/<(count|br|script|unsafe)\b/.test(html))
})

test("#function-values: a function child called style leaves the page alone", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // walk() collects every node named "style" into the page's stylesheet.
  assert(!html.includes("<style"))
  assert(!html.includes("undefined"))
})

test("#function-values: a function child called script is not swallowed", async () => {
  const { template } = await compile(__dirname)

  // This one was marked ignored and disappeared from the markup entirely.
  assert(template().includes("inline"))
  assert(!template().includes("<script"))
})

test("#function-values: the returned value is escaped like any other text", async () => {
  const { template } = await compile(__dirname)

  assert(
    template().includes(
      '<p id="escaped">&lt;script&gt;alert(1)&lt;/script&gt;</p>',
    ),
  )
})

test("#function-values: an attribute that is a function is refused", async () => {
  const { template } = await compile(join(__dirname, "fixtures/attribute.js"))

  // It used to render as <div>text</div> - no class, no error.
  assert.throws(() => template(), ScriptError)
  assert.throws(() => template(), /"class" cannot be a function/)
})

test("#function-values: a handler attribute given a function is refused", async () => {
  const { template } = await compile(join(__dirname, "fixtures/handler.js"))

  assert.throws(() => template(), /"onclick" was given a function/)
  assert.throws(() => template(), /js``/)
})

test("#function-values: a handler attribute given a string still renders", async () => {
  const { template } = await compile(join(__dirname, "fixtures/inline.js"))

  // The contrast: only a function is refused. A string is a real inline
  // handler and goes into the markup exactly as before.
  assert.strictEqual(
    template(),
    '<button onclick="window.alert(&#39;hi&#39;)">Go</button>',
  )
})
