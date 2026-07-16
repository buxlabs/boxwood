const test = require("node:test")
const assert = require("node:assert")
const {
  parseCustomTag,
  parseAttributes,
  resolveAttributes,
} = require("./parseCustomTag")

test("parseAttributes: parses empty attributes", () => {
  const result = parseAttributes("")
  assert.deepStrictEqual(result, {})
})

test("parseAttributes: parses double-quoted attribute", () => {
  const result = parseAttributes('type="warning"')
  assert.deepStrictEqual(result, { type: "warning" })
})

test("parseAttributes: parses single-quoted attribute", () => {
  const result = parseAttributes("type='info'")
  assert.deepStrictEqual(result, { type: "info" })
})

test("parseAttributes: parses variable reference", () => {
  const result = parseAttributes("type={variant}")
  assert.deepStrictEqual(result, { type: { __variable: "variant" } })
})

test("parseAttributes: parses multiple attributes", () => {
  const result = parseAttributes('type="warning" title="Alert" visible')
  assert.deepStrictEqual(result, {
    type: "warning",
    title: "Alert",
    visible: true,
  })
})

test("parseAttributes: parses mixed quotes and variables", () => {
  const result = parseAttributes('type="warning" title={alertTitle} visible')
  assert.deepStrictEqual(result, {
    type: "warning",
    title: { __variable: "alertTitle" },
    visible: true,
  })
})

test("parseAttributes: parses boolean attributes", () => {
  const result = parseAttributes("disabled required")
  assert.deepStrictEqual(result, { disabled: true, required: true })
})

test("parseAttributes: handles attributes with hyphens", () => {
  const result = parseAttributes('data-id="123" aria-label="test"')
  assert.deepStrictEqual(result, {
    "data-id": "123",
    "aria-label": "test",
  })
})

test("parseAttributes: handles attributes with colons", () => {
  const result = parseAttributes('xmlns:xlink="http://www.w3.org/1999/xlink"')
  assert.deepStrictEqual(result, {
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
  })
})

test("parseAttributes: handles escaped quotes", () => {
  const result = parseAttributes('title="She said \\"hello\\""')
  assert.deepStrictEqual(result, { title: 'She said "hello"' })
})

test("parseAttributes: handles extra whitespace", () => {
  const result = parseAttributes('  type  =  "warning"   title  =  "Alert"  ')
  assert.deepStrictEqual(result, { type: "warning", title: "Alert" })
})

test("parseCustomTag: returns null for non-custom tag", () => {
  const components = { Alert: () => {} }
  const result = parseCustomTag("# Heading", components)
  assert.strictEqual(result, null)
})

test("parseCustomTag: returns null when no components provided", () => {
  const result = parseCustomTag("<Alert>", null)
  assert.strictEqual(result, null)
})

test("parseCustomTag: parses self-closing tag", () => {
  const Alert = () => {}
  const components = { Alert }
  const result = parseCustomTag("<Alert />", components)
  assert.strictEqual(result.type, "custom-component")
  assert.strictEqual(result.tagName, "Alert")
  assert.strictEqual(result.component, Alert)
  assert.strictEqual(result.selfClosing, true)
  assert.deepStrictEqual(result.attributes, {})
})

test("parseCustomTag: parses self-closing tag with attributes", () => {
  const Button = () => {}
  const components = { Button }
  const result = parseCustomTag('<Button variant="primary" />', components)
  assert.strictEqual(result.type, "custom-component")
  assert.strictEqual(result.tagName, "Button")
  assert.strictEqual(result.selfClosing, true)
  assert.deepStrictEqual(result.attributes, { variant: "primary" })
})

test("parseCustomTag: parses opening tag", () => {
  const Alert = () => {}
  const components = { Alert }
  const result = parseCustomTag("<Alert>", components)
  assert.strictEqual(result.type, "custom-component-open")
  assert.strictEqual(result.tagName, "Alert")
  assert.strictEqual(result.component, Alert)
  assert.strictEqual(result.selfClosing, false)
})

test("parseCustomTag: parses opening tag with attributes", () => {
  const Alert = () => {}
  const components = { Alert }
  const result = parseCustomTag(
    '<Alert type="warning" title="Warning">',
    components,
  )
  assert.strictEqual(result.type, "custom-component-open")
  assert.strictEqual(result.tagName, "Alert")
  assert.deepStrictEqual(result.attributes, {
    type: "warning",
    title: "Warning",
  })
})

test("parseCustomTag: parses closing tag", () => {
  const Alert = () => {}
  const components = { Alert }
  const result = parseCustomTag("</Alert>", components)
  assert.strictEqual(result.type, "custom-component-close")
  assert.strictEqual(result.tagName, "Alert")
  assert.strictEqual(result.component, Alert)
})

test("parseCustomTag: supports kebab-case component names", () => {
  const CustomTag = () => {}
  const components = { "custom-tag": CustomTag }
  const result = parseCustomTag("<custom-tag />", components)
  assert.strictEqual(result.type, "custom-component")
  assert.strictEqual(result.tagName, "custom-tag")
  assert.strictEqual(result.component, CustomTag)
})

test("parseCustomTag: handles tags with extra whitespace", () => {
  const Alert = () => {}
  const components = { Alert }
  const result = parseCustomTag("  <Alert />  ", components)
  assert.strictEqual(result.type, "custom-component")
  assert.strictEqual(result.tagName, "Alert")
})

test("parseCustomTag: ignores unknown components", () => {
  const components = { Alert: () => {} }
  const result = parseCustomTag("<Button />", components)
  assert.strictEqual(result, null)
})

test("resolveAttributes: resolves simple attributes", () => {
  const attrs = { type: "warning", title: "Alert" }
  const data = { variant: "info" }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { type: "warning", title: "Alert" })
})

test("resolveAttributes: resolves variable references", () => {
  const attrs = {
    type: { __variable: "variant" },
    title: "Alert",
  }
  const data = { variant: "warning" }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { type: "warning", title: "Alert" })
})

test("resolveAttributes: resolves multiple variables", () => {
  const attrs = {
    type: { __variable: "variant" },
    title: { __variable: "heading" },
  }
  const data = { variant: "info", heading: "Information" }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { type: "info", title: "Information" })
})

test("resolveAttributes: handles missing variable as undefined", () => {
  const attrs = {
    type: { __variable: "variant" },
    title: "Alert",
  }
  const data = {}
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { type: undefined, title: "Alert" })
})

test("resolveAttributes: handles null data", () => {
  const attrs = {
    type: { __variable: "variant" },
  }
  const result = resolveAttributes(attrs, null)
  assert.deepStrictEqual(result, { type: undefined })
})

test("resolveAttributes: handles empty attributes", () => {
  const result = resolveAttributes({}, { variant: "info" })
  assert.deepStrictEqual(result, {})
})

test("resolveAttributes: preserves non-variable attributes", () => {
  const attrs = {
    type: "warning",
    count: 5,
    visible: true,
    data: null,
  }
  const result = resolveAttributes(attrs, {})
  assert.deepStrictEqual(result, {
    type: "warning",
    count: 5,
    visible: true,
    data: null,
  })
})

test("resolveAttributes: resolves method call on array variable", () => {
  const attrs = { images: { __variable: "images.slice(0, 2)" } }
  const data = { images: ["a.jpg", "b.jpg", "c.jpg", "d.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { images: ["a.jpg", "b.jpg"] })
})

test("resolveAttributes: resolves chained method call with property access", () => {
  const attrs = { images: { __variable: "gallery.images.slice(1)" } }
  const data = { gallery: { images: ["a.jpg", "b.jpg", "c.jpg"] } }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { images: ["b.jpg", "c.jpg"] })
})

test("resolveAttributes: returns undefined for unsafe method call", () => {
  const attrs = { images: { __variable: "images.push('x.jpg')" } }
  const data = { images: ["a.jpg", "b.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { images: undefined })
  assert.deepStrictEqual(data.images, ["a.jpg", "b.jpg"])
})

test("parseAttributes: parses array literal in quoted attribute", () => {
  const result = parseAttributes('source="{[images[0], images[2]]}"')
  assert.deepStrictEqual(result, {
    source: { __variable: "[images[0], images[2]]" },
  })
})

test("resolveAttributes: resolves array literal of variables", () => {
  const attrs = { source: { __variable: "[images[0], images[2]]" } }
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { source: ["a.jpg", "c.jpg"] })
})

test("resolveAttributes: resolves array literal mixing variables and literals", () => {
  const attrs = { source: { __variable: '[images[0], "static.jpg"]' } }
  const data = { images: ["a.jpg", "b.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { source: ["a.jpg", "static.jpg"] })
})

test("resolveAttributes: resolves array literal with method calls", () => {
  const attrs = { source: { __variable: "[images.at(0), images.at(-1)]" } }
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { source: ["a.jpg", "c.jpg"] })
})

test("resolveAttributes: resolves ?? fallback in attribute", () => {
  const attrs = { source: { __variable: 'cover ?? images[0]' } }
  const data = { images: ["a.jpg", "b.jpg"] }
  const result = resolveAttributes(attrs, data)
  assert.deepStrictEqual(result, { source: "a.jpg" })
})

test("resolveAttributes: resolves ?? with array literal fallback", () => {
  const attrs = { images: { __variable: 'gallery ?? ["placeholder.jpg"]' } }
  const result = resolveAttributes(attrs, {})
  assert.deepStrictEqual(result, { images: ["placeholder.jpg"] })
})
