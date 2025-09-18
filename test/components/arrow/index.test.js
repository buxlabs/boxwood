const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/arrow: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ direction: "top" }),
    '<span class="c1 c2"></span>'
  )
  assert.deepEqual(
    template({ direction: "right" }),
    '<span class="c1 c3"></span>'
  )
  assert.deepEqual(
    template({ direction: "bottom" }),
    '<span class="c1 c4"></span>'
  )
  assert.deepEqual(
    template({ direction: "left" }),
    '<span class="c1 c5"></span>'
  )
})
