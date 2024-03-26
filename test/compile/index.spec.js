const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")
const { join } = require("path")

test("compile: it returns a template", async () => {
  const { template } = await compile(join(__dirname, "./fixtures/literal.js"))

  assert.deepEqual(template(), "foo")
})

test("compile: it returns a template which can have parameters", async () => {
  const { template } = await compile(
    join(__dirname, "./fixtures/parameters.js")
  )

  assert.deepEqual(template({ foo: "bar" }), "bar")
})

test("compile: it returns a template which can require dependencies", async () => {
  const { template } = await compile(
    join(__dirname, "./fixtures/dependencies.js")
  )

  assert.deepEqual(template(), "foo/bar")
})

test("compile: it works with attribute aliases", async () => {
  const { template } = await compile(
    join(__dirname, "./fixtures/attributes.js")
  )

  assert.deepEqual(
    template({ className: "foo", htmlFor: "bar" }, "baz"),
    '<label class="foo" for="bar">baz</label>'
  )
})

test("compile: it works with div tags", async () => {
  const { template } = await compile(join(__dirname, "./fixtures/tag/div.js"))

  assert.deepEqual(
    template(),
    '<div>foo</div><br><div id="bar"></div><br id="baz"><div></div>'
  )
})

test("compile: it works with input tags", async () => {
  const { template } = await compile(join(__dirname, "./fixtures/tag/input.js"))

  assert.deepEqual(template(), "<input checked>")
})

test("compile: it escapes html", async () => {
  const { template } = await compile(join(__dirname, "./fixtures/escape.js"))

  assert.deepEqual(
    template(),
    "<code>&lt;h1&gt;foo&lt;/h1&gt;</code><code>&lt;h2&gt;bar&lt;/h2&gt;&lt;h2&gt;baz&lt;/h2&gt;</code>"
  )
})
