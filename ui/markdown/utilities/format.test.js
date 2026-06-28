const test = require("node:test")
const assert = require("node:assert")
const { format } = require("./format")

// Mock components for testing
const mockComponents = {
  A: (props, children) => ({ type: "a", props, children }),
  Img: (props) => ({ type: "img", props }),
  Code: (props, children) => ({ type: "code", props, children }),
  Strong: (children) => ({ type: "strong", children }),
  Em: (children) => ({ type: "em", children }),
}

test("returns text unchanged when no special characters", () => {
  const result = format("plain text", mockComponents)
  assert.strictEqual(result, "plain text")
})

test("formats bold text with **", () => {
  const result = format("This is **bold** text", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result.length, 3)
  assert.strictEqual(result[0], "This is ")
  assert.deepStrictEqual(result[1], { type: "strong", children: "bold" })
  assert.strictEqual(result[2], " text")
})

test("formats italic text with *", () => {
  const result = format("This is *italic* text", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[1].type, "em")
  assert.strictEqual(result[1].children, "italic")
})

test("formats inline code with backticks", () => {
  const result = format("This is `code` here", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[1].type, "code")
  assert.strictEqual(result[1].children, "code")
})

test("formats markdown links", () => {
  const result = format("[link text](/url)", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "a")
  assert.strictEqual(result[0].props.href, "/url")
  assert.strictEqual(result[0].children, "link text")
})

test("formats markdown images", () => {
  const result = format("![alt text](/image.png)", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "img")
  assert.strictEqual(result[0].props.src, "/image.png")
  assert.strictEqual(result[0].props.alt, "alt text")
})

test("formats multiple bold elements", () => {
  const result = format("**first** and **second**", mockComponents)
  assert.strictEqual(result[0].type, "strong")
  assert.strictEqual(result[2].type, "strong")
})

test("formats bold and italic in sequence", () => {
  const result = format("*italic* and **bold**", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "em")
  assert.strictEqual(result[2].type, "strong")
})

test("formats bold and italic mixed", () => {
  const result = format("**bold with *italic* inside**", mockComponents)
  assert.strictEqual(result[0].type, "strong")
  // Due to parsing order, nested elements work when bold is outer
  const children = result[0].children  
  assert(Array.isArray(children))
})

test("formats link with bold text inside", () => {
  const result = format("[**bold link**](/url)", mockComponents)
  assert.strictEqual(result[0].type, "a")
  assert(Array.isArray(result[0].children))
  assert.strictEqual(result[0].children[0].type, "strong")
})

test("formats link with image inside", () => {
  const result = format("[![alt](/img.png)](/link)", mockComponents)
  assert.strictEqual(result[0].type, "a")
  assert.strictEqual(result[0].props.href, "/link")
  assert(Array.isArray(result[0].children))
  assert.strictEqual(result[0].children[0].type, "img")
})

test("handles incomplete bold syntax", () => {
  const result = format("**incomplete", mockComponents)
  // When bold is incomplete, it treats ** as separate asterisks
  assert(Array.isArray(result))
})

test("handles incomplete italic syntax", () => {
  const result = format("*incomplete", mockComponents)
  // When italic is incomplete, it treats * as separate character
  assert(Array.isArray(result))
})

test("handles incomplete code syntax", () => {
  const result = format("`incomplete", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0], "`")
  assert.strictEqual(result[1], "incomplete")
})

test("handles incomplete link syntax", () => {
  const result = format("[incomplete", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0], "[")
})

test("handles incomplete image syntax", () => {
  const result = format("![incomplete", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0], "!")
})

test("formats multiple different elements together", () => {
  const result = format("**bold** and *italic* and `code`", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "strong")
  assert.strictEqual(result[2].type, "em")
  assert.strictEqual(result[4].type, "code")
})

test("handles empty string", () => {
  const result = format("", mockComponents)
  assert.strictEqual(result, "")
})

test("handles string with only spaces", () => {
  const result = format("   ", mockComponents)
  assert.strictEqual(result, "   ")
})

test("handles adjacent bold elements", () => {
  const result = format("**first****second**", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "strong")
  assert.strictEqual(result[1].type, "strong")
})

test("handles link with complex nested content", () => {
  const result = format("[**bold** and *italic* text](/url)", mockComponents)
  assert.strictEqual(result[0].type, "a")
  assert(Array.isArray(result[0].children))
})

test("formats image with empty alt text", () => {
  const result = format("![](/image.png)", mockComponents)
  assert.strictEqual(result[0].type, "img")
  assert.strictEqual(result[0].props.alt, "")
  assert.strictEqual(result[0].props.src, "/image.png")
})

test("handles text with exclamation mark not followed by bracket", () => {
  const result = format("Hello! World", mockComponents)
  // Should return as array with single string element when ! is found
  if (Array.isArray(result)) {
    assert.strictEqual(result[0], "Hello! World")
  } else {
    assert.strictEqual(result, "Hello! World")
  }
})

test("handles bracket not part of link", () => {
  const result = format("Some [text] here", mockComponents)
  assert(Array.isArray(result))
  // Should treat as regular text since no () after ]
})

test("handles multiple images", () => {
  const result = format("![first](/1.png) and ![second](/2.png)", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "img")
  assert.strictEqual(result[2].type, "img")
})

test("handles multiple links", () => {
  const result = format("[first](/1) and [second](/2)", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0].type, "a")
  assert.strictEqual(result[2].type, "a")
})

test("handles code with special characters inside", () => {
  const result = format("`**not bold**`", mockComponents)
  assert.strictEqual(result[0].type, "code")
  assert.strictEqual(result[0].children, "**not bold**")
})

test("handles single asterisk at end", () => {
  const result = format("text*", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0], "text")
  assert.strictEqual(result[1], "*")
})

test("handles double asterisk at end", () => {
  const result = format("text**", mockComponents)
  assert(Array.isArray(result))
  assert.strictEqual(result[0], "text")
  assert.strictEqual(result[1], "*")
})
