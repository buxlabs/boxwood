const test = require("node:test")
const assert = require("node:assert")
const { validate } = require("./validate")

const types = (issues) => issues.map((issue) => issue.type)

test("validate: returns no issues for a valid template", () => {
  const text = [
    "# Hello {name}",
    "",
    "{#if admin}Admin{#else}User{/if}",
    "{#each items as item}- {item}{#else}Empty{/each}",
  ].join("\n")
  const issues = validate(text, { data: { name: "x", admin: true, items: [] } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unknown variable with line number", () => {
  const issues = validate("line one\nHello {imges}", { data: { images: [] } })
  assert.strictEqual(issues.length, 1)
  assert.strictEqual(issues[0].type, "unknown-variable")
  assert.strictEqual(issues[0].line, 2)
  assert(issues[0].message.includes("imges"))
})

test("validate: skips unknown variable check without data", () => {
  const issues = validate("Hello {anything}")
  assert.deepStrictEqual(issues, [])
})

test("validate: knows loop variables inside {#each}", () => {
  const text = "{#each items as product, i}{product.name} {i}{/each}"
  const issues = validate(text, { data: { items: [] } })
  assert.deepStrictEqual(issues, [])
})

test("validate: default loop variable is item", () => {
  const issues = validate("{#each things}{item}{/each}", { data: { things: [] } })
  assert.deepStrictEqual(issues, [])
})

test("validate: loop variable is unknown outside the loop", () => {
  const text = "{#each items}{item}{/each}\n{item}"
  const issues = validate(text, { data: { items: [] } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert.strictEqual(issues[0].line, 2)
})

test("validate: reports unsafe method", () => {
  const issues = validate("{items.push('x')}", { data: { items: [] } })
  assert.deepStrictEqual(types(issues), ["unsafe-method"])
})

test("validate: reports malformed expression", () => {
  const issues = validate("{items.slice(0,}", { data: { items: [] } })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
})

test("validate: reports unclosed {#each}", () => {
  const issues = validate("{#each items}- {item}", { data: { items: [] } })
  assert.deepStrictEqual(types(issues), ["unclosed-block"])
  assert.strictEqual(issues[0].line, 1)
})

test("validate: reports unclosed {#if}", () => {
  const issues = validate("{#if x}yes")
  assert.deepStrictEqual(types(issues), ["unclosed-block"])
})

test("validate: reports mismatched close tags", () => {
  const issues = validate("{#if x}{/each}")
  assert(types(issues).includes("unmatched-block"))
})

test("validate: reports {/if} without open block", () => {
  const issues = validate("text {/if}")
  assert.deepStrictEqual(types(issues), ["unmatched-block"])
})

test("validate: reports {#else} without open block", () => {
  const issues = validate("{#else}")
  assert.deepStrictEqual(types(issues), ["unmatched-block"])
})

test("validate: accepts {#elseif} inside {#if}", () => {
  const issues = validate("{#if a}1{#elseif b}2{#else}3{/if}")
  assert.deepStrictEqual(issues, [])
})

test("validate: validates condition expressions", () => {
  const issues = validate("{#if count > 3}big{/if}", { data: { total: 1 } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
})

test("validate: validates ?? operands", () => {
  const issues = validate("{nickname ?? nmae}", { data: { name: "x" } })
  assert.deepStrictEqual(types(issues), [
    "unknown-variable",
    "unknown-variable",
  ])
})

test("validate: accepts literals in expressions", () => {
  const issues = validate('{name ?? "Guest"} {count ?? 0}', {
    data: { name: "x", count: 1 },
  })
  assert.deepStrictEqual(issues, [])
})

test("validate: validates array literal elements", () => {
  const issues = validate("{[images[0], imges[1]]}", { data: { images: [] } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
})

test("validate: reports unknown component", () => {
  const issues = validate("<Galery images=\"{images}\" />", {
    data: { images: [] },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(types(issues), ["unknown-component"])
  assert(issues[0].message.includes("Galery"))
})

test("validate: accepts known component and validates its attributes", () => {
  const issues = validate("<Gallery images=\"{imges}\" />", {
    data: { images: [] },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
})

test("validate: skips content of fenced code blocks", () => {
  const text = "```js\n{unknownVar}\n{#if x}\n```"
  const issues = validate(text, { data: {} })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unclosed fenced code block", () => {
  const issues = validate("```js\ncode")
  assert.deepStrictEqual(types(issues), ["unclosed-code-block"])
})

test("validate: skips content of inline code", () => {
  const issues = validate("use `{unknownVar}` here", { data: {} })
  assert.deepStrictEqual(issues, [])
})

test("validate: skips content of comments", () => {
  const issues = validate("{!-- {unknownVar} {#if x} --}ok", { data: {} })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unclosed comment", () => {
  const issues = validate("text {!-- note")
  assert.deepStrictEqual(types(issues), ["unclosed-comment"])
})

test("validate: skips escaped braces", () => {
  const issues = validate("literal \\{name}", { data: {} })
  assert.deepStrictEqual(issues, [])
})

test("validate: handles empty and non-string input", () => {
  assert.deepStrictEqual(validate(""), [])
  assert.deepStrictEqual(validate(null), [])
})

test("validate: sorts issues by line number", () => {
  const text = "{#each items}\n{unknown}\n{/each}\n{bad.push(1)}"
  const issues = validate(text, { data: { items: [], bad: [] } })
  assert.deepStrictEqual(
    issues.map((issue) => issue.line),
    [2, 4],
  )
})

test("Prose.validate: knows builtin components and tags", () => {
  const Prose = require("../index")
  const issues = Prose.validate("<Stack>\ncontent\n</Stack>", { data: {} })
  assert.deepStrictEqual(issues, [])
})

test("Prose.validate: merges custom components with builtins", () => {
  const Prose = require("../index")
  const issues = Prose.validate("<Gallery images=\"{images}\" />", {
    data: { images: [] },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(issues, [])
})
