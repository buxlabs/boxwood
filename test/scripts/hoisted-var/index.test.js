const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { parseInlineScript, wrappers } = require("../helpers")

test("scripts: a var hoisted out of a block collides like any other name", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template({}))

  // The first script keeps the name, the second one pays for a wrapper
  assert.equal(wrappers(tree).length, 1)
})

test("scripts: each script reads back the value it declared", async () => {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const { window } = new JSDOM(template({}), { runScripts: "dangerously" })

  // Sharing one binding would leave both closures reading the last value.
  assert.equal(window.readFirst(), 1)
  assert.equal(window.readSecond(), 2)
})
