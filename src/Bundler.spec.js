import test from "ava"
import Bundler from "./Bundler"

test("Bundler: keeps simple code", async assert => {
  const source = 'const foo = "bar"; console.log(foo)'
  const bundler = new Bundler()
  const output = await bundler.bundle(source)
  assert.truthy(output.includes(source))
})
