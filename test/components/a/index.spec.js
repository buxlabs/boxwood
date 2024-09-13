const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/a: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template(
      {
        className: "foo",
        href: "/bar",
        target: "_blank",
      },
      "foo"
    ),
    '<a class="link_1f29w foo" href="/bar" target="_blank">foo</a>'
  )
})
