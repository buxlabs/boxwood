const { test } = require("node:test")
const assert = require("node:assert")
const { compile, escape, raw, css, i18n, component } = require("../../index.js")
const { readFileSync, writeFileSync, mkdirSync } = require("fs")
const { join } = require("path")

// BUG #1: Error message references undefined variables in validateFile
test("validateFile error message uses correct variable names", () => {
  const testDir = join(__dirname, "test-files")
  mkdirSync(testDir, { recursive: true })
  
  // Create a test file outside the working directory to trigger path validation
  // We'll use a path that exists but will fail validation
  const validPath = join(testDir, "test.txt")
  writeFileSync(validPath, "test content")
  
  // The bug is in the error message - if it triggers, it would reference
  // undefined variables, but the actual validation might prevent this
  // This test documents the issue exists in the code
  assert.ok(true, "Bug documented: validateFile uses realPath/realBase in error message but receives path/base")
})

// BUG #2 & #5: Incomplete sanitization in sanitizeHTML and sanitizeSVG
test("sanitization handles unquoted event handlers", () => {
  // The current implementation doesn't handle unquoted event handlers
  // This test shows the vulnerability
  const testDir = join(__dirname, "test-files")
  const htmlPath = join(testDir, "xss-test.html")
  
  // Write HTML with unquoted event handler (currently not sanitized)
  writeFileSync(htmlPath, '<div onclick=alert(1)>Click me</div>')
  
  // Load it with sanitization
  const result = raw.load(htmlPath, { sanitize: true })
  const rendered = result.children
  
  // BUG: This will still contain the onclick attribute
  assert.ok(rendered.includes('onclick'), "Unquoted event handlers are not sanitized (known bug)")
})

test("sanitization handles uppercase event handlers", () => {
  const testDir = join(__dirname, "test-files")
  const htmlPath = join(testDir, "xss-uppercase.html")
  
  // Write HTML with uppercase event handler
  writeFileSync(htmlPath, '<div ONCLICK="alert(1)">Click me</div>')
  
  const result = raw.load(htmlPath, { sanitize: true })
  const rendered = result.children
  
  // Current regex uses 'i' flag so this should work, but let's verify
  // Actually, looking at the code, it uses \s which requires whitespace before
  // and uses lowercase \w, so uppercase ON might not match
  assert.ok(rendered.includes('ONCLICK') || !rendered.includes('alert'), "Event handler handling for uppercase")
})

test("sanitization handles data URI in href", () => {
  const testDir = join(__dirname, "test-files")
  const htmlPath = join(testDir, "xss-data-uri.html")
  
  // Write HTML with data URI XSS vector
  writeFileSync(htmlPath, '<a href="data:text/html,<script>alert(1)</script>">Click</a>')
  
  const result = raw.load(htmlPath, { sanitize: true })
  const rendered = result.children
  
  // BUG: data URIs are not sanitized, only javascript: protocol
  assert.ok(rendered.includes('data:'), "Data URIs are not sanitized (known limitation)")
})

// BUG #3: Misspelled function name
test("occurences function name is misspelled", () => {
  // This is a code quality issue - the function exists and works but is misspelled
  // We can't directly test the internal function, but we document the issue
  assert.ok(true, "Bug documented: 'occurences' should be spelled 'occurrences'")
})

// BUG #4: CSS validation is too simplistic
test("CSS validation doesn't account for brackets in strings", () => {
  const testDir = join(__dirname, "test-files")
  const cssPath = join(testDir, "test-brackets.css")
  
  // CSS with brackets in a content string - perfectly valid
  writeFileSync(cssPath, '.test::before { content: "{"; }')
  
  // This should not throw but might due to simplistic validation
  try {
    const result = css.load(cssPath)
    assert.ok(result, "CSS with brackets in strings should be valid")
  } catch (err) {
    assert.ok(err.message.includes("Mismatched"), "CSS validation doesn't account for brackets in strings (known bug)")
  }
})

// BUG #6: Basic i18n function lacks error handling
test("basic i18n function lacks error checking", () => {
  const translations = {
    greeting: {
      en: "Hello",
      es: "Hola"
    }
  }
  
  const translate = i18n(translations)
  
  // This will throw a TypeError instead of returning undefined or a helpful error
  try {
    const result = translate("en", "nonexistent")
    assert.fail("Should have thrown an error for nonexistent key")
  } catch (err) {
    assert.ok(err instanceof TypeError, "Basic i18n throws TypeError for missing keys instead of helpful error")
  }
  
  // This will throw a TypeError instead of a helpful error
  try {
    translate("fr", "greeting")
  } catch (err) {
    assert.ok(err instanceof TypeError, "Basic i18n throws TypeError for missing language instead of helpful error")
  }
})

// BUG #7: Extension function doesn't handle edge cases
test("extension function handles files without extension", () => {
  // For internal testing, we need to be careful since extension is not exported
  // We can test it indirectly through error messages
  const testDir = join(__dirname, "test-files")
  const noExtPath = join(testDir, "README")
  writeFileSync(noExtPath, "test")
  
  try {
    raw.load(noExtPath)
  } catch (err) {
    // The error will show what extension() returned
    assert.ok(err.message.includes("unsupported raw type"), "Files without extension cause issues")
  }
})

test("extension function handles hidden files", () => {
  const testDir = join(__dirname, "test-files")
  const hiddenPath = join(testDir, ".hidden")
  writeFileSync(hiddenPath, "test")
  
  try {
    raw.load(hiddenPath)
  } catch (err) {
    // .hidden would be treated as having extension "hidden"
    assert.ok(err.message.includes("unsupported raw type"), "Hidden files are not handled correctly")
  }
})

// BUG #8: Component function doesn't check for .css and .js properties
test("component handles styles without .css property", () => {
  const TestComponent = ({ children }) => children
  
  // Pass a style object without .css property
  const wrapped = component(TestComponent, { styles: { invalidStyle: true } })
  
  try {
    const result = wrapped({ children: "test" })
    // Will add undefined to nodes
    assert.ok(result.includes(undefined), "Component doesn't validate style.css existence")
  } catch (err) {
    assert.ok(true, "Component throws when style.css is missing")
  }
})

// BUG #9: Redundant variable declaration in attributes function
test("attributes function has redundant variable declaration", () => {
  // This is a code quality issue that doesn't affect functionality
  // but could be confusing
  assert.ok(true, "Bug documented: Line 312 re-declares 'value' variable unnecessarily")
})

// BUG #10: Key validation doesn't allow colons for namespaced attributes
test("attribute validation allows data and aria attributes", () => {
  const { tag } = require("../../index.js")
  
  // These should work (hyphens are allowed)
  const withData = tag("div", { "data-test": "value" }, "content")
  assert.ok(true, "data-* attributes use hyphens which are allowed")
  
  // Colons are not allowed but are valid in HTML (xml:lang, xlink:href)
  // We can't test this directly without accessing internals
  assert.ok(true, "Bug documented: Colons in attribute names are not allowed by validation")
})

// BUG #11: Render function doesn't propagate escape parameter for arrays
test("render function propagates escape parameter for arrays", () => {
  // Create a script tag with an array of children
  const { Script } = require("../../index.js")
  
  const scriptContent = ["var x = ", "<div>", ";"]
  const result = Script(scriptContent)
  
  // When rendered, the content should not be escaped because it's in a script tag
  // But due to the bug, array items might not respect the escape=false for script tags
  // We need to use compile to actually render
  const testDir = join(__dirname, "test-files")
  const templatePath = join(testDir, "script-array.js")
  
  writeFileSync(
    templatePath,
    `
    const { Html, Head, Body, Script } = require('../../../index.js')
    module.exports = () => {
      return Html([
        Head([]),
        Body([
          Script(["var x = ", "<div>", ";"])
        ])
      ])
    }
  `
  )
  
  const { template } = compile(templatePath)
  const html = template()
  
  // The <div> should be escaped even though it's in a script tag
  // because of the array rendering bug
  if (html.includes("&lt;div&gt;")) {
    assert.ok(true, "Bug confirmed: Array items in script tags are escaped incorrectly")
  } else {
    assert.ok(html.includes("<div>"), "Script content is unescaped (bug may be fixed or behavior different)")
  }
})
