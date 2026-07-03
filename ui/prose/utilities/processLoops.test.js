const test = require("node:test")
const assert = require("node:assert")
const { processLoops } = require("./processLoops")

// Basic loop tests
test("processLoops: expands simple loop with default item name", () => {
  const text = "{#each items}- {item}\n{/each}"
  const result = processLoops(text, { items: ["a", "b", "c"] })
  assert.strictEqual(result, "- a\n- b\n- c\n")
})

test("processLoops: expands loop with custom item name", () => {
  const text = "{#each items as thing}- {thing}\n{/each}"
  const result = processLoops(text, { items: ["x", "y", "z"] })
  assert.strictEqual(result, "- x\n- y\n- z\n")
})

test("processLoops: expands loop with item and index", () => {
  const text = "{#each items as item, i}{i}: {item}\n{/each}"
  const result = processLoops(text, { items: ["a", "b", "c"] })
  assert.strictEqual(result, "0: a\n1: b\n2: c\n")
})

test("processLoops: removes block when array is empty", () => {
  const text = "{#each items}- {item}\n{/each}"
  const result = processLoops(text, { items: [] })
  assert.strictEqual(result, "")
})

test("processLoops: removes block when array is undefined", () => {
  const text = "{#each items}- {item}\n{/each}"
  const result = processLoops(text, {})
  assert.strictEqual(result, "")
})

test("processLoops: removes block when no data provided", () => {
  const text = "{#each items}- {item}\n{/each}"
  const result = processLoops(text, null)
  assert.strictEqual(result, "")
})

test("processLoops: handles object properties in items", () => {
  const text = "{#each users as user}- {user.name}\n{/each}"
  const result = processLoops(text, {
    users: [{ name: "Alice" }, { name: "Bob" }],
  })
  assert.strictEqual(result, "- Alice\n- Bob\n")
})

test("processLoops: handles custom variable name with object properties", () => {
  const text = "{#each users as person}- {person.name} ({person.age})\n{/each}"
  const result = processLoops(text, {
    users: [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ],
  })
  assert.strictEqual(result, "- Alice (30)\n- Bob (25)\n")
})

test("processLoops: preserves whitespace and formatting", () => {
  const text = `{#each items}
  - {item}
{/each}`
  const result = processLoops(text, { items: ["a", "b"] })
  assert.strictEqual(
    result,
    `
  - a

  - b
`,
  )
})

test("processLoops: handles multiple loops", () => {
  const text = "{#each a}- {item}\n{/each}{#each b}* {item}\n{/each}"
  const result = processLoops(text, { a: ["1", "2"], b: ["x", "y"] })
  assert.strictEqual(result, "- 1\n- 2\n* x\n* y\n")
})

test("processLoops: handles nested loops", () => {
  const text =
    "{#each outer as o}{o}: {#each inner as i}{i} {/each}\n{/each}"
  const result = processLoops(text, { outer: ["A", "B"], inner: ["1", "2"] })
  assert.strictEqual(result, "A: 1 2 \nB: 1 2 \n")
})

test("processLoops: handles nested loops with different item names", () => {
  const text =
    "{#each groups as group}Group {group}:\n{#each items as item}  - {item}\n{/each}{/each}"
  const result = processLoops(text, {
    groups: ["A", "B"],
    items: ["1", "2"],
  })
  assert.strictEqual(
    result,
    "Group A:\n  - 1\n  - 2\nGroup B:\n  - 1\n  - 2\n",
  )
})

test("processLoops: handles array access in loop variable", () => {
  const text = "{#each items as item}- {item[0]}\n{/each}"
  const result = processLoops(text, {
    items: [
      ["a", "b"],
      ["c", "d"],
    ],
  })
  assert.strictEqual(result, "- a\n- c\n")
})

test("processLoops: handles numbers in array", () => {
  const text = "{#each nums}- {item}\n{/each}"
  const result = processLoops(text, { nums: [1, 2, 3] })
  assert.strictEqual(result, "- 1\n- 2\n- 3\n")
})

test("processLoops: handles content before and after", () => {
  const text = "Before\n{#each items}- {item}\n{/each}After"
  const result = processLoops(text, { items: ["a", "b"] })
  assert.strictEqual(result, "Before\n- a\n- b\nAfter")
})

test("processLoops: returns original text when no loops", () => {
  const text = "No loops here"
  const result = processLoops(text, { items: ["a", "b"] })
  assert.strictEqual(result, "No loops here")
})

test("processLoops: handles unclosed each block", () => {
  const text = "{#each items}- {item}"
  const result = processLoops(text, { items: ["a", "b"] })
  // Should return as-is when not properly closed
  assert.strictEqual(result, "{#each items}- {item}")
})

test("processLoops: handles nested property access in array path", () => {
  const text = "{#each data.items}- {item}\n{/each}"
  const result = processLoops(text, { data: { items: ["a", "b"] } })
  assert.strictEqual(result, "- a\n- b\n")
})

test("processLoops: handles array index in array path", () => {
  const text = "{#each groups[0]}- {item}\n{/each}"
  const result = processLoops(text, { groups: [["a", "b"], ["c", "d"]] })
  assert.strictEqual(result, "- a\n- b\n")
})

test("processLoops: accesses other data variables in loop", () => {
  const text = "{#each items}- {item} (prefix: {prefix})\n{/each}"
  const result = processLoops(text, { items: ["a", "b"], prefix: ">>>" })
  assert.strictEqual(result, "- a (prefix: >>>)\n- b (prefix: >>>)\n")
})

test("processLoops: handles complex object properties", () => {
  const text =
    "{#each products as product}**{product.name}**: ${product.price}\n{/each}"
  const result = processLoops(text, {
    products: [
      { name: "Widget", price: 10 },
      { name: "Gadget", price: 20 },
    ],
  })
  assert.strictEqual(result, "**Widget**: $10\n**Gadget**: $20\n")
})

test("processLoops: handles index with zero-based counting", () => {
  const text = "{#each items as item, idx}Item #{idx}: {item}\n{/each}"
  const result = processLoops(text, { items: ["first", "second", "third"] })
  assert.strictEqual(result, "Item #0: first\nItem #1: second\nItem #2: third\n")
})

test("processLoops: handles markdown formatting inside loops", () => {
  const text = "{#each items}## {item}\n\nDescription here.\n\n{/each}"
  const result = processLoops(text, { items: ["Title 1", "Title 2"] })
  assert.strictEqual(
    result,
    "## Title 1\n\nDescription here.\n\n## Title 2\n\nDescription here.\n\n",
  )
})

test("processLoops: handles single item array", () => {
  const text = "{#each items}- {item}\n{/each}"
  const result = processLoops(text, { items: ["only"] })
  assert.strictEqual(result, "- only\n")
})

test("processLoops: handles deeply nested object properties", () => {
  const text = "{#each users as user}{user.profile.name} - {user.profile.email}\n{/each}"
  const result = processLoops(text, {
    users: [
      { profile: { name: "Alice", email: "alice@example.com" } },
      { profile: { name: "Bob", email: "bob@example.com" } },
    ],
  })
  assert.strictEqual(
    result,
    "Alice - alice@example.com\nBob - bob@example.com\n",
  )
})

test("processLoops: handles loop with no content between tags", () => {
  const text = "{#each items}{/each}"
  const result = processLoops(text, { items: ["a", "b", "c"] })
  assert.strictEqual(result, "")
})

test("processLoops: handles boolean values in array", () => {
  const text = "{#each flags}- {item}\n{/each}"
  const result = processLoops(text, { flags: [true, false, true] })
  assert.strictEqual(result, "- true\n- false\n- true\n")
})
