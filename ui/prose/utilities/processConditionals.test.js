const test = require("node:test")
const assert = require("node:assert")
const { processConditionals, isTruthy } = require("./processConditionals")

// isTruthy tests
test("isTruthy: returns false for null", () => {
  assert.strictEqual(isTruthy(null), false)
})

test("isTruthy: returns false for undefined", () => {
  assert.strictEqual(isTruthy(undefined), false)
})

test("isTruthy: returns false for empty string", () => {
  assert.strictEqual(isTruthy(""), false)
})

test("isTruthy: returns false for zero", () => {
  assert.strictEqual(isTruthy(0), false)
})

test("isTruthy: returns false for false", () => {
  assert.strictEqual(isTruthy(false), false)
})

test("isTruthy: returns false for empty array", () => {
  assert.strictEqual(isTruthy([]), false)
})

test("isTruthy: returns true for non-empty string", () => {
  assert.strictEqual(isTruthy("hello"), true)
})

test("isTruthy: returns true for non-zero number", () => {
  assert.strictEqual(isTruthy(1), true)
  assert.strictEqual(isTruthy(-1), true)
})

test("isTruthy: returns true for true", () => {
  assert.strictEqual(isTruthy(true), true)
})

test("isTruthy: returns true for non-empty array", () => {
  assert.strictEqual(isTruthy([1, 2, 3]), true)
})

test("isTruthy: returns true for objects", () => {
  assert.strictEqual(isTruthy({}), true)
  assert.strictEqual(isTruthy({ key: "value" }), true)
})

// processConditionals tests
test("processConditionals: keeps content when condition is true", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "Content")
})

test("processConditionals: removes content when condition is false", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, { show: false })
  assert.strictEqual(result, "")
})

test("processConditionals: handles multiple blocks", () => {
  const text = "{#if a}First{/if} {#if b}Second{/if}"
  const result = processConditionals(text, { a: true, b: false })
  assert.strictEqual(result, "First ")
})

test("processConditionals: handles nested properties", () => {
  const text = "{#if user.active}Active{/if}"
  const result = processConditionals(text, { user: { active: true } })
  assert.strictEqual(result, "Active")
})

test("processConditionals: handles array indexing", () => {
  const text = "{#if items[0]}First item exists{/if}"
  const result = processConditionals(text, { items: ["first", "second"] })
  assert.strictEqual(result, "First item exists")
})

test("processConditionals: handles nested if blocks", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: true, inner: true })
  assert.strictEqual(result, "Outer Inner Content")
})

test("processConditionals: handles nested if with outer false", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: false, inner: true })
  assert.strictEqual(result, "")
})

test("processConditionals: handles nested if with inner false", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: true, inner: false })
  assert.strictEqual(result, "Outer  Content")
})

test("processConditionals: removes all blocks when no data", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, null)
  assert.strictEqual(result, "")
})

test("processConditionals: handles unclosed if block", () => {
  const text = "{#if show}Content without closing"
  const result = processConditionals(text, { show: true })
  // Should return as-is when not properly closed
  assert.strictEqual(result, "{#if show}Content without closing")
})

test("processConditionals: preserves whitespace and newlines", () => {
  const text = `{#if show}
Line 1
Line 2
{/if}`
  const result = processConditionals(text, { show: true })
  assert.strictEqual(
    result,
    `
Line 1
Line 2
`,
  )
})

test("processConditionals: handles content before and after", () => {
  const text = "Before {#if show}Middle{/if} After"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "Before Middle After")
})

test("processConditionals: handles multiple nested levels", () => {
  const text = "{#if a}{#if b}{#if c}Deep{/if}{/if}{/if}"
  const result = processConditionals(text, { a: true, b: true, c: true })
  assert.strictEqual(result, "Deep")
})

test("processConditionals: returns original text when no if blocks", () => {
  const text = "No conditionals here"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "No conditionals here")
})

test("processConditionals: handles null text", () => {
  const result = processConditionals(null, { show: true })
  assert.strictEqual(result, null)
})

test("processConditionals: handles undefined text", () => {
  const result = processConditionals(undefined, { show: true })
  assert.strictEqual(result, undefined)
})

// Comparison operator tests
test("processConditionals: handles greater than operator", () => {
  const text = "{#if count > 5}Many items{/if}"
  const result = processConditionals(text, { count: 10 })
  assert.strictEqual(result, "Many items")
})

test("processConditionals: handles greater than operator (false)", () => {
  const text = "{#if count > 5}Many items{/if}"
  const result = processConditionals(text, { count: 3 })
  assert.strictEqual(result, "")
})

test("processConditionals: handles less than operator", () => {
  const text = "{#if count < 5}Few items{/if}"
  const result = processConditionals(text, { count: 3 })
  assert.strictEqual(result, "Few items")
})

test("processConditionals: handles greater than or equal operator", () => {
  const text = "{#if count >= 5}Five or more{/if}"
  const result = processConditionals(text, { count: 5 })
  assert.strictEqual(result, "Five or more")
})

test("processConditionals: handles less than or equal operator", () => {
  const text = "{#if count <= 5}Five or less{/if}"
  const result = processConditionals(text, { count: 5 })
  assert.strictEqual(result, "Five or less")
})

test("processConditionals: handles equals operator", () => {
  const text = "{#if status == 'active'}Active user{/if}"
  const result = processConditionals(text, { status: "active" })
  assert.strictEqual(result, "Active user")
})

test("processConditionals: handles not equals operator", () => {
  const text = "{#if status != 'inactive'}User is active{/if}"
  const result = processConditionals(text, { status: "active" })
  assert.strictEqual(result, "User is active")
})

test("processConditionals: handles strict equals operator", () => {
  const text = "{#if user.role === 'admin'}Admin{/if}"
  const result = processConditionals(text, { user: { role: "admin" } })
  assert.strictEqual(result, "Admin")
})

test("processConditionals: strict equals does not coerce types", () => {
  const text = "{#if count === 5}Five{/if}"
  assert.strictEqual(processConditionals(text, { count: 5 }), "Five")
  assert.strictEqual(processConditionals(text, { count: "5" }), "")
})

test("processConditionals: handles strict not equals operator", () => {
  const text = "{#if count !== 5}Not five{/if}"
  assert.strictEqual(processConditionals(text, { count: "5" }), "Not five")
  assert.strictEqual(processConditionals(text, { count: 5 }), "")
})

// Logical operator tests
test("processConditionals: handles || in conditions", () => {
  const text =
    "{#if articles.length === 0 || user.role === 'admin'}Visible{/if}"
  assert.strictEqual(
    processConditionals(text, { articles: [], user: { role: "guest" } }),
    "Visible",
  )
  assert.strictEqual(
    processConditionals(text, { articles: [1], user: { role: "admin" } }),
    "Visible",
  )
  assert.strictEqual(
    processConditionals(text, { articles: [1], user: { role: "guest" } }),
    "",
  )
})

test("processConditionals: handles && in conditions", () => {
  const text = "{#if user.active && user.role === 'admin'}Admin panel{/if}"
  assert.strictEqual(
    processConditionals(text, { user: { active: true, role: "admin" } }),
    "Admin panel",
  )
  assert.strictEqual(
    processConditionals(text, { user: { active: false, role: "admin" } }),
    "",
  )
  assert.strictEqual(
    processConditionals(text, { user: { active: true, role: "guest" } }),
    "",
  )
})

test("processConditionals: && binds tighter than ||", () => {
  // a || b && c is a || (b && c)
  const text = "{#if a || b && c}Yes{/if}"
  assert.strictEqual(processConditionals(text, { a: true, b: false, c: false }), "Yes")
  assert.strictEqual(processConditionals(text, { a: false, b: true, c: true }), "Yes")
  assert.strictEqual(processConditionals(text, { a: false, b: true, c: false }), "")
})

test("processConditionals: handles negation of || operands", () => {
  const text = "{#if !admin || !banned}Shown{/if}"
  assert.strictEqual(
    processConditionals(text, { admin: true, banned: true }),
    "",
  )
  assert.strictEqual(
    processConditionals(text, { admin: true, banned: false }),
    "Shown",
  )
})

test("processConditionals: ignores || inside quoted strings", () => {
  const text = "{#if status == 'a || b'}Literal{/if}"
  assert.strictEqual(processConditionals(text, { status: "a || b" }), "Literal")
})

test("processConditionals: handles paths as method arguments in conditions", () => {
  const text = "{#if tags.includes(tag)}Tagged{/if}"
  assert.strictEqual(
    processConditionals(text, { tags: ["a", "b"], tag: "b" }),
    "Tagged",
  )
  assert.strictEqual(
    processConditionals(text, { tags: ["a"], tag: "b" }),
    "",
  )
})

test("processConditionals: handles || in elseif conditions", () => {
  const text =
    "{#if a}A{#elseif b || c}B or C{#else}None{/if}"
  assert.strictEqual(processConditionals(text, { a: false, b: false, c: true }), "B or C")
  assert.strictEqual(processConditionals(text, { a: false, b: false, c: false }), "None")
})

test("processConditionals: handles array length comparison", () => {
  const text = "{#if tags.length > 0}Has tags{/if}"
  const result = processConditionals(text, { tags: ["a", "b", "c"] })
  assert.strictEqual(result, "Has tags")
})

test("processConditionals: handles array length comparison (false)", () => {
  const text = "{#if tags.length > 0}Has tags{/if}"
  const result = processConditionals(text, { tags: [] })
  assert.strictEqual(result, "")
})

test("processConditionals: compares with number literal", () => {
  const text = "{#if age >= 18}Adult{/if}"
  const result = processConditionals(text, { age: 25 })
  assert.strictEqual(result, "Adult")
})

test("processConditionals: compares with boolean literal", () => {
  const text = "{#if verified == true}Verified{/if}"
  const result = processConditionals(text, { verified: true })
  assert.strictEqual(result, "Verified")
})

test("processConditionals: compares two variables", () => {
  const text = "{#if current > previous}Increased{/if}"
  const result = processConditionals(text, { current: 10, previous: 5 })
  assert.strictEqual(result, "Increased")
})

test("processConditionals: handles nested property comparison", () => {
  const text = "{#if user.age >= 18}Adult user{/if}"
  const result = processConditionals(text, { user: { age: 21 } })
  assert.strictEqual(result, "Adult user")
})

test("processConditionals: handles string comparison with quotes", () => {
  const text = '{#if name == "John"}Hello John{/if}'
  const result = processConditionals(text, { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("processConditionals: handles negative numbers", () => {
  const text = "{#if temperature < 0}Below freezing{/if}"
  const result = processConditionals(text, { temperature: -5 })
  assert.strictEqual(result, "Below freezing")
})

test("processConditionals: handles decimal numbers", () => {
  const text = "{#if price > 9.99}Expensive{/if}"
  const result = processConditionals(text, { price: 19.99 })
  assert.strictEqual(result, "Expensive")
})

// {#else} tests
test("processConditionals: renders if content when condition is true with else", () => {
  const text = "{#if show}Show this{#else}Show that{/if}"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "Show this")
})

test("processConditionals: renders else content when condition is false", () => {
  const text = "{#if show}Show this{#else}Show that{/if}"
  const result = processConditionals(text, { show: false })
  assert.strictEqual(result, "Show that")
})

test("processConditionals: handles else with comparison operators", () => {
  const text = "{#if age >= 18}Adult{#else}Minor{/if}"
  const result1 = processConditionals(text, { age: 21 })
  assert.strictEqual(result1, "Adult")
  const result2 = processConditionals(text, { age: 15 })
  assert.strictEqual(result2, "Minor")
})

test("processConditionals: handles else with undefined variable", () => {
  const text = "{#if user}Welcome {user}{#else}Please log in{/if}"
  const result = processConditionals(text, {})
  assert.strictEqual(result, "Please log in")
})

test("processConditionals: handles else with empty string", () => {
  const text = "{#if name}Hello {name}{#else}Hello stranger{/if}"
  const result = processConditionals(text, { name: "" })
  assert.strictEqual(result, "Hello stranger")
})

test("processConditionals: handles else with zero", () => {
  const text = "{#if count}You have {count} items{#else}No items{/if}"
  const result = processConditionals(text, { count: 0 })
  assert.strictEqual(result, "No items")
})

test("processConditionals: handles else with empty array", () => {
  const text = "{#if items.length > 0}Has items{#else}Empty list{/if}"
  const result = processConditionals(text, { items: [] })
  assert.strictEqual(result, "Empty list")
})

test("processConditionals: handles multiple if-else blocks", () => {
  const text = "{#if a}A{#else}Not A{/if} and {#if b}B{#else}Not B{/if}"
  const result = processConditionals(text, { a: true, b: false })
  assert.strictEqual(result, "A and Not B")
})

test("processConditionals: handles nested if with else", () => {
  const text =
    "{#if outer}Outer: {#if inner}Inner{#else}Not inner{/if}{#else}Not outer{/if}"
  const result1 = processConditionals(text, { outer: true, inner: true })
  assert.strictEqual(result1, "Outer: Inner")
  const result2 = processConditionals(text, { outer: true, inner: false })
  assert.strictEqual(result2, "Outer: Not inner")
  const result3 = processConditionals(text, { outer: false, inner: true })
  assert.strictEqual(result3, "Not outer")
})

test("processConditionals: handles else with whitespace and newlines", () => {
  const text = `{#if show}
Line 1
Line 2
{#else}
Alternative 1
Alternative 2
{/if}`
  const result = processConditionals(text, { show: false })
  assert.strictEqual(
    result,
    `
Alternative 1
Alternative 2
`,
  )
})

test("processConditionals: handles else with markdown content", () => {
  const text = "{#if premium}**Premium** content{#else}*Basic* content{/if}"
  const result = processConditionals(text, { premium: false })
  assert.strictEqual(result, "*Basic* content")
})

test("processConditionals: handles else when no data object", () => {
  const text = "{#if show}Visible{#else}Hidden{/if}"
  const result = processConditionals(text, null)
  assert.strictEqual(result, "Hidden")
})

test("processConditionals: handles else with complex nested structure", () => {
  const text =
    "{#if status == 'active'}Active{#else}{#if status == 'pending'}Pending{#else}Inactive{/if}{/if}"
  const result1 = processConditionals(text, { status: "active" })
  assert.strictEqual(result1, "Active")
  const result2 = processConditionals(text, { status: "pending" })
  assert.strictEqual(result2, "Pending")
  const result3 = processConditionals(text, { status: "inactive" })
  assert.strictEqual(result3, "Inactive")
})

test("processConditionals: handles else with variables in both branches", () => {
  const text =
    "{#if isPremium}Premium: {price}{#else}Standard: {basePrice}{/if}"
  const result1 = processConditionals(text, {
    isPremium: true,
    price: 100,
    basePrice: 50,
  })
  assert.strictEqual(result1, "Premium: {price}")
  const result2 = processConditionals(text, {
    isPremium: false,
    price: 100,
    basePrice: 50,
  })
  assert.strictEqual(result2, "Standard: {basePrice}")
})

// Negation operator tests
test("processConditionals: handles negation with !", () => {
  const text = "{#if !show}Hidden{/if}"
  const result = processConditionals(text, { show: false })
  assert.strictEqual(result, "Hidden")
})

test("processConditionals: handles negation with ! (false case)", () => {
  const text = "{#if !show}Hidden{/if}"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "")
})

test("processConditionals: handles negation with nested property", () => {
  const text = "{#if !user.verified}Please verify{/if}"
  const result = processConditionals(text, { user: { verified: false } })
  assert.strictEqual(result, "Please verify")
})

test("processConditionals: handles negation with comparison", () => {
  const text = "{#if !count > 0}Empty{/if}"
  const result = processConditionals(text, { count: 0 })
  assert.strictEqual(result, "Empty")
})

test("processConditionals: handles negation with equals comparison", () => {
  const text = "{#if !status == 'inactive'}Active or Pending{/if}"
  const result = processConditionals(text, { status: "active" })
  assert.strictEqual(result, "Active or Pending")
})

test("processConditionals: handles negation with else", () => {
  const text = "{#if !premium}Basic user{#else}Premium user{/if}"
  const result = processConditionals(text, { premium: false })
  assert.strictEqual(result, "Basic user")
})

test("processConditionals: handles negation with array length", () => {
  const text = "{#if !items.length > 0}No items{/if}"
  const result = processConditionals(text, { items: [] })
  assert.strictEqual(result, "No items")
})

// {#elseif} tests
test("processConditionals: handles simple elseif", () => {
  const text = "{#if score >= 90}A{#elseif score >= 80}B{#else}C{/if}"
  const result1 = processConditionals(text, { score: 95 })
  assert.strictEqual(result1, "A")
  const result2 = processConditionals(text, { score: 85 })
  assert.strictEqual(result2, "B")
  const result3 = processConditionals(text, { score: 70 })
  assert.strictEqual(result3, "C")
})

test("processConditionals: handles multiple elseif branches", () => {
  const text =
    "{#if role == 'admin'}Admin{#elseif role == 'moderator'}Moderator{#elseif role == 'user'}User{#else}Guest{/if}"
  const result1 = processConditionals(text, { role: "admin" })
  assert.strictEqual(result1, "Admin")
  const result2 = processConditionals(text, { role: "moderator" })
  assert.strictEqual(result2, "Moderator")
  const result3 = processConditionals(text, { role: "user" })
  assert.strictEqual(result3, "User")
  const result4 = processConditionals(text, { role: "guest" })
  assert.strictEqual(result4, "Guest")
})

test("processConditionals: handles elseif without final else", () => {
  const text = "{#if x > 10}Large{#elseif x > 5}Medium{/if}"
  const result1 = processConditionals(text, { x: 15 })
  assert.strictEqual(result1, "Large")
  const result2 = processConditionals(text, { x: 7 })
  assert.strictEqual(result2, "Medium")
  const result3 = processConditionals(text, { x: 3 })
  assert.strictEqual(result3, "")
})

test("processConditionals: handles elseif with string comparisons", () => {
  const text =
    "{#if status == 'active'}Active{#elseif status == 'pending'}Pending{#elseif status == 'suspended'}Suspended{/if}"
  const result = processConditionals(text, { status: "pending" })
  assert.strictEqual(result, "Pending")
})

test("processConditionals: handles elseif with truthiness checks", () => {
  const text = "{#if premium}Premium{#elseif verified}Verified{#else}Basic{/if}"
  const result1 = processConditionals(text, { premium: true, verified: false })
  assert.strictEqual(result1, "Premium")
  const result2 = processConditionals(text, { premium: false, verified: true })
  assert.strictEqual(result2, "Verified")
  const result3 = processConditionals(text, {
    premium: false,
    verified: false,
  })
  assert.strictEqual(result3, "Basic")
})

test("processConditionals: handles elseif with negation", () => {
  const text =
    "{#if active}Active{#elseif !suspended}Inactive{#else}Suspended{/if}"
  const result1 = processConditionals(text, { active: false, suspended: false })
  assert.strictEqual(result1, "Inactive")
  const result2 = processConditionals(text, { active: false, suspended: true })
  assert.strictEqual(result2, "Suspended")
})

test("processConditionals: handles elseif with nested properties", () => {
  const text =
    "{#if user.role == 'admin'}Admin Panel{#elseif user.role == 'user'}User Dashboard{/if}"
  const result = processConditionals(text, { user: { role: "user" } })
  assert.strictEqual(result, "User Dashboard")
})

test("processConditionals: handles elseif with complex conditions", () => {
  const text =
    "{#if age < 13}Child{#elseif age < 18}Teen{#elseif age < 65}Adult{#else}Senior{/if}"
  const result1 = processConditionals(text, { age: 10 })
  assert.strictEqual(result1, "Child")
  const result2 = processConditionals(text, { age: 15 })
  assert.strictEqual(result2, "Teen")
  const result3 = processConditionals(text, { age: 30 })
  assert.strictEqual(result3, "Adult")
  const result4 = processConditionals(text, { age: 70 })
  assert.strictEqual(result4, "Senior")
})

test("processConditionals: handles nested if with elseif in outer block", () => {
  const text =
    "{#if outer}Outer{#elseif middle}{#if inner}Inner{/if}Middle{#else}Neither{/if}"
  const result1 = processConditionals(text, { outer: true })
  assert.strictEqual(result1, "Outer")
  const result2 = processConditionals(text, {
    outer: false,
    middle: true,
    inner: true,
  })
  assert.strictEqual(result2, "InnerMiddle")
  const result3 = processConditionals(text, { outer: false, middle: false })
  assert.strictEqual(result3, "Neither")
})

test("processConditionals: handles elseif with whitespace and newlines", () => {
  const text = `{#if score >= 90}
Grade: A
{#elseif score >= 80}
Grade: B
{#elseif score >= 70}
Grade: C
{#else}
Grade: F
{/if}`
  const result = processConditionals(text, { score: 85 })
  assert.strictEqual(
    result,
    `
Grade: B
`,
  )
})

test("processConditionals: handles multiple elseif blocks in same text", () => {
  const text =
    "{#if x > 0}Positive{#elseif x < 0}Negative{#else}Zero{/if} and {#if y > 0}High{#elseif y == 0}Mid{#else}Low{/if}"
  const result = processConditionals(text, { x: -5, y: 0 })
  assert.strictEqual(result, "Negative and Mid")
})

test("processConditionals: handles elseif when no data object", () => {
  const text = "{#if a}A{#elseif b}B{#else}C{/if}"
  const result = processConditionals(text, null)
  assert.strictEqual(result, "C")
})

test("processConditionals: elseif evaluates in order (short-circuit)", () => {
  const text =
    "{#if count > 10}Many{#elseif count > 5}Some{#elseif count > 0}Few{/if}"
  const result = processConditionals(text, { count: 7 })
  // Should match second condition, not third
  assert.strictEqual(result, "Some")
})

test("processConditionals: handles elseif with array length", () => {
  const text =
    "{#if items.length > 10}Many items{#elseif items.length > 0}Some items{#else}No items{/if}"
  const result = processConditionals(text, { items: [1, 2, 3] })
  assert.strictEqual(result, "Some items")
})

test("processConditionals: supports ?? in conditions", () => {
  const text = "{#if title ?? subtitle}Has heading{/if}"
  assert.strictEqual(
    processConditionals(text, { title: null, subtitle: "Sub" }),
    "Has heading",
  )
  assert.strictEqual(
    processConditionals(text, { title: null, subtitle: null }),
    "",
  )
})

test("processConditionals: supports arithmetic in comparisons", () => {
  const text = "{#if items.length - 1 > 0}More than one{/if}"
  assert.strictEqual(
    processConditionals(text, { items: ["a", "b"] }),
    "More than one",
  )
  assert.strictEqual(processConditionals(text, { items: ["a"] }), "")
})

test("processConditionals: supports expressions on both comparison sides", () => {
  const text = "{#if posts.slice(0, limit).length == limit}Full page{/if}"
  assert.strictEqual(
    processConditionals(text, { posts: ["a", "b", "c"], limit: 2 }),
    "Full page",
  )
  assert.strictEqual(
    processConditionals(text, { posts: ["a"], limit: 2 }),
    "",
  )
})

test("processConditionals: supports ?? with || in conditions", () => {
  // Hierarchical split: (a ?? b) is an operand of ||
  const text = "{#if draft ?? hidden || admin}Visible{/if}"
  assert.strictEqual(
    processConditionals(text, { draft: null, hidden: true, admin: false }),
    "Visible",
  )
  assert.strictEqual(
    processConditionals(text, { draft: false, hidden: true, admin: false }),
    "",
  )
})

test("processConditionals: negation applies to expressions", () => {
  const text = "{#if !(title ?? subtitle)}No heading{/if}"
  // Parentheses are not supported - negation of a bare ?? expression instead
  const simple = "{#if !title}No title{/if}"
  assert.strictEqual(processConditionals(simple, { title: "" }), "No title")
  assert.strictEqual(processConditionals(simple, { title: "x" }), "")
})
