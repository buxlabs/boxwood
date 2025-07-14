const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("radialGradient", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"></radialGradient>'))
})