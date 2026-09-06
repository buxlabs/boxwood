const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { parse, generate } = require("abstract-syntax-tree")
const { compile } = require("../../..")
const { inlineScripts, wrappers } = require("../../scripts/helpers")

const source = require("./script")

const normalise = (code) => generate(parse(code))

test("#reactivity/overhead: the bundle is the authored code and nothing else", async () => {
  const { template } = await compile(__dirname)
  const [bundle] = inlineScripts(template())

  // Compared as syntax trees, so reformatting alone would not fail this.
  assert.strictEqual(normalise(bundle), normalise(source))
})

test("#reactivity/overhead: nothing is added around the authored code", async () => {
  const { template } = await compile(__dirname)
  const [bundle] = inlineScripts(template())

  // Stricter than the test above and deliberately so: today the emitted
  // bundle is the source text, byte for byte. If this one starts failing
  // while the tree comparison still passes, the library began transforming
  // client code - worth knowing about, whether or not it is intended.
  assert.strictEqual(bundle, source)
})

test("#reactivity/overhead: a page without scripts carries no script tag", async () => {
  const { template } = await compile(
    join(__dirname, "../../components/with-styles")
  )
  const html = template({ text: "hello" })

  assert(!html.includes("<script"))
  assert(html.includes("<style>")) // the styles it does have still arrive
})

test("#reactivity/overhead: a page without styles carries no style tag", async () => {
  const { template } = await compile(__dirname)

  assert(!template().includes("<style"))
})

test("#reactivity/overhead: the script tag carries no attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // No type=module, no defer, no nonce unless something asked for one.
  assert(html.includes("<script>"))
  assert(!/<script\s+[^>]/.test(html))
})

/*
 * The merge step can wrap scripts in an IIFE, and that wrapper is a remedy for
 * a name collision rather than a default. Pinning both halves, because a
 * reactive layer that starts wrapping everything would be free to hide a
 * runtime in there.
 */
test("#reactivity/overhead: scripts are not wrapped unless a collision forces it", async () => {
  const plain = await compile(__dirname)
  assert.strictEqual(wrappers(parse(inlineScripts(plain.template())[0])).length, 0)

  for (const [dir, props] of [
    ["counter", { start: 0 }],
    ["counters", { starts: [1, 2] }],
    ["cart", { products: [{ id: "a", name: "x", price: 1 }] }],
  ]) {
    const { template } = await compile(join(__dirname, "..", dir))
    const tree = parse(inlineScripts(template(props))[0])
    assert.strictEqual(wrappers(tree).length, 0, `${dir} should not be wrapped`)
  }

  // The contrast: two top level declarations of the same name do get wrapped.
  const { template } = await compile(
    join(__dirname, "../../scripts/colliding-declarations")
  )
  const tree = parse(inlineScripts(template({}))[0])
  assert.strictEqual(wrappers(tree).length, 1)
})
