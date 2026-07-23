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

test("validate: accepts paths as method arguments", () => {
  const issues = validate("{images.slice(0, limit)}", {
    data: { images: [], limit: 2 },
  })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unknown variable in a method argument", () => {
  const issues = validate("{images.slice(0, limti)}", {
    data: { images: [], limit: 2 },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("limti"))
})

test("validate: reports unsafe method in a method argument", () => {
  const issues = validate("{images.slice(0, items.pop())}", {
    data: { images: [], items: [] },
  })
  assert.deepStrictEqual(types(issues), ["unsafe-method"])
  assert(issues[0].message.includes("pop"))
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

test("validate: validates || and && condition operands", () => {
  const text = "{#if articles.length === 0 || usr.role === 'admin'}x{/if}"
  const issues = validate(text, { data: { articles: [], user: {} } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("usr"))
})

test("validate: accepts valid logical conditions", () => {
  const text =
    "{#if articles.length === 0 || user.role === 'admin' && user.active}x{/if}"
  const issues = validate(text, { data: { articles: [], user: {} } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports empty logical operand in a condition", () => {
  const issues = validate("{#if a ||}x{/if}", { data: { a: 1 } })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
})

test("validate: validates condition expressions", () => {
  const issues = validate("{#if count > 3}big{/if}", { data: { total: 1 } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
})

test("validate: validates || operands", () => {
  const issues = validate('{title || imges[0]}', { data: { title: "", images: [] } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("imges"))
})

test("validate: accepts valid || fallbacks", () => {
  const issues = validate('{title || "Untitled"}', { data: { title: "" } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports mixed ?? and || as malformed", () => {
  const issues = validate("{a ?? b || c}", { data: { a: 1, b: 2, c: 3 } })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
  assert(issues[0].message.includes("mix"))
})

test("validate: validates && operands", () => {
  const issues = validate("{active && usr.name}", {
    data: { active: true, user: {} },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("usr"))
})

test("validate: validates && operands nested in ||", () => {
  const issues = validate("{a || b && unknwn}", { data: { a: 1, b: 2 } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("unknwn"))
})

test("validate: reports mixed ?? and && as malformed", () => {
  const issues = validate("{a ?? b && c}", { data: { a: 1, b: 2, c: 3 } })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
  assert(issues[0].message.includes("mix"))
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

test("validate: validates spread elements in array literals", () => {
  const issues = validate("{[...images.slice(0, 1), ...imges.slice(2)]}", {
    data: { images: [] },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("imges"))
})

test("validate: accepts valid spread elements", () => {
  const issues = validate("{[...images.slice(1, 2), ...images.slice(4, 5)]}", {
    data: { images: [] },
  })
  assert.deepStrictEqual(issues, [])
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

test("validate: validates expressions in multi-line component tags", () => {
  const text = [
    '<Gallery images="{[',
    "  images[0],",
    "  imges[1]",
    ']}" />',
  ].join("\n")
  const issues = validate(text, {
    data: { images: [] },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("imges"))
})

test("validate: accepts valid multi-line component tags", () => {
  const text = [
    "<Gallery",
    '  images="{[',
    "  images[0],",
    "  images[1]",
    ']}"',
    "/>",
  ].join("\n")
  const issues = validate(text, {
    data: { images: [] },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(issues, [])
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

test("validate: validates partial interpolation in attributes", () => {
  const issues = validate('<Gallery href="/products/{prodcutId}" />', {
    data: { productId: 1 },
    components: { Gallery: () => null },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
})

test("validate: accepts expressions in {#each} headers", () => {
  const text = "{#each posts.slice(0, 3) as post}{post.title}{/each}"
  const issues = validate(text, { data: { posts: [] } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unknown variable in an {#each} header expression", () => {
  const text = "{#each psts.slice(0, 3) as post}{post.title}{/each}"
  const issues = validate(text, { data: { posts: [] } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("psts"))
})

test("validate: validates arithmetic operands", () => {
  const issues = validate("{indx + 1}", { data: { index: 0 } })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("indx"))
})

test("validate: accepts valid arithmetic", () => {
  const issues = validate("{i + 1} {items.length - 1} {price * quantity}", {
    data: { i: 0, items: [], price: 1, quantity: 2 },
  })
  assert.deepStrictEqual(issues, [])
})

test("validate: accepts ?? and arithmetic in conditions", () => {
  const text = "{#if title ?? subtitle}x{/if}\n{#if items.length - 1 > 0}y{/if}"
  const issues = validate(text, { data: { title: "", subtitle: "", items: [] } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports unknown variable in a condition expression", () => {
  const issues = validate("{#if titel ?? subtitle}x{/if}", {
    data: { title: "", subtitle: "" },
  })
  assert.deepStrictEqual(types(issues), ["unknown-variable"])
  assert(issues[0].message.includes("titel"))
})

test("validate: accepts expressions in method arguments", () => {
  const issues = validate("{a.slice(0, n - 1)}", { data: { a: [], n: 3 } })
  assert.deepStrictEqual(issues, [])
})

test("validate: reports empty expression braces", () => {
  const issues = validate("Hello {}", { data: {} })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
  assert(issues[0].message.includes("Empty expression"))
})

test("validate: reports empty expression with whitespace", () => {
  const issues = validate("Hello { }", { data: {} })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
})

test("validate: reports empty expression in attributes", () => {
  const issues = validate('<Center title="{}" />', {
    components: { Center: () => null },
  })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
})

test("validate: skips escaped and inline-code empty braces", () => {
  assert.deepStrictEqual(validate("literal \\{} braces", { data: {} }), [])
  assert.deepStrictEqual(validate("use `{}` in code", { data: {} }), [])
})

test("validate: reports empty {#if} condition", () => {
  const issues = validate("{#if }x{/if}", { data: {} })
  assert.deepStrictEqual(types(issues), ["malformed-block"])
  assert(issues[0].message.includes("Empty condition"))
})

test("validate: reports empty {#elseif} condition", () => {
  const issues = validate("{#if a}1{#elseif }2{/if}", { data: { a: 1 } })
  assert.deepStrictEqual(types(issues), ["malformed-block"])
})

test("validate: reports prototype-chain access", () => {
  const issues = validate("{x.constructor}", { data: { x: {} } })
  assert.deepStrictEqual(types(issues), ["forbidden-property"])
  assert(issues[0].message.includes("prototype access"))
})

test("validate: reports oversized expressions instead of hanging", () => {
  const huge = "{" + "a".repeat(1001) + "}"
  const issues = validate(huge, { data: {} })
  assert.deepStrictEqual(types(issues), ["malformed-expression"])
})
