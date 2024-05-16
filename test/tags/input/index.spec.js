const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("attributes for an input", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(
    html.includes(
      '<input type="text" name="username" placeholder="Enter your username" value="John Doe" autofocus>'
    )
  )
  assert(
    html.includes(
      '<input type="text" name="password" placeholder="Enter your password" value="">'
    )
  )
})
