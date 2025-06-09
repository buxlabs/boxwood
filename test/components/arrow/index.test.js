const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/arrow: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ direction: "top" }),
    '<span class="arrow_1 top_1"></span>'
  )
  assert.deepEqual(
    template({ direction: "right" }),
    '<span class="arrow_1 right_1"></span>'
  )
  assert.deepEqual(
    template({ direction: "bottom" }),
    '<span class="arrow_1 bottom_1"></span>'
  )
  assert.deepEqual(
    template({ direction: "left" }),
    '<span class="arrow_1 left_1"></span>'
  )
})
