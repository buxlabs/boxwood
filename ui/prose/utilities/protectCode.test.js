const test = require("node:test")
const assert = require("node:assert")
const { maskCodeSegments, restoreCodeSegments } = require("./protectCode")

test("maskCodeSegments: masks fenced code block content", () => {
  const text = "before\n```js\nconst x = {count}\n```\nafter"
  const { text: masked, tokens } = maskCodeSegments(text)
  assert(!masked.includes("{count}"))
  assert(masked.includes("```js"))
  assert(masked.includes("```"))
  assert.strictEqual(tokens.size, 1)
  assert([...tokens.values()].includes("const x = {count}"))
})

test("maskCodeSegments: masks multi-line fenced content as one token", () => {
  const text = "```\nline1\nline2\n```"
  const { tokens } = maskCodeSegments(text)
  assert.strictEqual(tokens.size, 1)
  assert([...tokens.values()].includes("line1\nline2"))
})

test("maskCodeSegments: masks inline code content", () => {
  const text = "use `{count}` here"
  const { text: masked, tokens } = maskCodeSegments(text)
  assert(!masked.includes("{count}"))
  assert(/`.+`/.test(masked))
  assert.strictEqual(tokens.size, 1)
})

test("maskCodeSegments: masks unclosed fence to the end", () => {
  const text = "```\n{#if x}secret{/if}"
  const { text: masked } = maskCodeSegments(text)
  assert(!masked.includes("{#if"))
})

test("maskCodeSegments: leaves regular text untouched", () => {
  const text = "Hello {name}\n\n- {item}"
  const { text: masked, tokens } = maskCodeSegments(text)
  assert.strictEqual(masked, text)
  assert.strictEqual(tokens.size, 0)
})

test("restoreCodeSegments: restores tokens in nested trees", () => {
  const { text: masked, tokens } = maskCodeSegments("`{a}` and `{b}`")
  const [t1, t2] = [...tokens.keys()]
  const tree = [{ name: "p", attributes: {}, children: [[t1, { name: "code", attributes: {}, children: [t2] }]] }]
  const restored = restoreCodeSegments(tree, tokens)
  assert.strictEqual(restored[0].children[0][0], "{a}")
  assert.strictEqual(restored[0].children[0][1].children[0], "{b}")
})

test("restoreCodeSegments: leaves unknown values untouched", () => {
  const { tokens } = maskCodeSegments("`x`")
  assert.strictEqual(restoreCodeSegments(42, tokens), 42)
  assert.strictEqual(restoreCodeSegments(null, tokens), null)
})

test("maskCodeSegments: skips escaped backticks", () => {
  const text = "This is \\`not code\\`"
  const { text: masked, tokens } = maskCodeSegments(text)
  assert.strictEqual(masked, text)
  assert.strictEqual(tokens.size, 0)
})
