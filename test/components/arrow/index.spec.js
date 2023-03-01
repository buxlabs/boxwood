const test = require("ava")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/arrow: it returns a component with css", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ direction: "top" }),
    '<span class="__arrow__19kjp __top__19kjp"></span>'
  )
  assert.deepEqual(
    template({ direction: "right" }),
    '<span class="__arrow__19kjp __right__19kjp"></span>'
  )
  assert.deepEqual(
    template({ direction: "bottom" }),
    '<span class="__arrow__19kjp __bottom__19kjp"></span>'
  )
  assert.deepEqual(
    template({ direction: "left" }),
    '<span class="__arrow__19kjp __left__19kjp"></span>'
  )
})
