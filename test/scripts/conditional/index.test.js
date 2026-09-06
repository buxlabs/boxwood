const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { inlineScripts } = require("../helpers")

test("a different set of scripts produces a different bundle", async () => {
  const { template } = await compile(__dirname)

  const both = inlineScripts(template({ parts: ["alpha", "beta"] }))[0]
  assert.match(both, /window\.alpha/)
  assert.match(both, /window\.beta/)
  assert.doesNotMatch(both, /window\.gamma/)

  const other = inlineScripts(template({ parts: ["beta", "gamma"] }))[0]
  assert.doesNotMatch(other, /window\.alpha/)
  assert.match(other, /window\.beta/)
  assert.match(other, /window\.gamma/)

  // Rendering the first combination again must not pick up the second one
  const again = inlineScripts(template({ parts: ["alpha", "beta"] }))[0]
  assert.equal(again, both)

  // Order is part of the bundle, not just membership
  const reversed = inlineScripts(template({ parts: ["beta", "alpha"] }))[0]
  assert.notEqual(reversed, both)
})
