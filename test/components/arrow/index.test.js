const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/arrow: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ direction: "top" }),
    '<span class="arrow_14pisp top_1hggxx"></span>'
  )
  assert.deepEqual(
    template({ direction: "right" }),
    '<span class="arrow_14pisp right_151ary"></span>'
  )
  assert.deepEqual(
    template({ direction: "bottom" }),
    '<span class="arrow_14pisp bottom_1tbxy4"></span>'
  )
  assert.deepEqual(
    template({ direction: "left" }),
    '<span class="arrow_14pisp left_1ncnen"></span>'
  )
})
