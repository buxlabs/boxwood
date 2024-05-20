const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("script tag is inside of head", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(
    html,
    "<!DOCTYPE html><html><head><script>const foo = {}\n</script></head><body><div>hello, world!</div></body></html>"
  )
})
