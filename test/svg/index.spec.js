const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

test("#svg: it returns an svg", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  assert(
    template().includes('<line x1="0" y1="10" x2="10" y2="0" stroke="black" />')
  )
  assert(template().includes("<svg><rect></rect></svg>"))
})
