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

  /*
   * The bundle used to be the source text byte for byte, and this asserted
   * exactly that. Every bundle is now generated from its tree, which is what
   * strips comments - so formatting legitimately differs and a byte compare
   * would fail for a reason nobody needs to hear about.
   *
   * What has to stay true is that the library adds nothing: the emitted
   * statements are the authored ones, in order, and no more of them. If the
   * library ever wraps, injects or reorders, this is where it shows.
   */
  const emitted = parse(bundle).body
  const authored = parse(source).body

  assert.strictEqual(emitted.length, authored.length)
  emitted.forEach((node, index) => {
    assert.strictEqual(generate(node), generate(authored[index]))
  })
})

test("#reactivity/overhead: comments do not reach the browser", async () => {
  const { template } = await compile(join(__dirname, "../counter"))
  const [bundle] = inlineScripts(template({ start: 0 }))

  // counter/client.js is 41% comments by weight. None of it is the visitor's
  // to download.
  assert(!bundle.includes("//"))
  assert(!bundle.includes("/*"))
  assert(bundle.includes("[data-counter]"))
})

test("#reactivity/overhead: a page without scripts carries no script tag", async () => {
  const { template } = await compile(
    join(__dirname, "../../components/with-styles"),
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
  assert.strictEqual(
    wrappers(parse(inlineScripts(plain.template())[0])).length,
    0,
  )

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
    join(__dirname, "../../scripts/colliding-declarations"),
  )
  const tree = parse(inlineScripts(template({}))[0])
  assert.strictEqual(wrappers(tree).length, 1)
})
