const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("nested elements", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // Test nested elements without arrays
  assert(html.includes("<ul><li><a>Hello</a></li></ul>"))

  // Test nested elements with arrays
  assert(html.includes("<ul><li><a>World</a></li></ul>"))

  // Test nested elements with attributes
  assert(html.includes('<ul><li><a href="#">Link</a></li></ul>'))

  // Test deeply nested elements
  assert(html.includes("<div><div><div><span>Deep</span></div></div></div>"))

  // Test that name attribute doesn't confuse the tag function
  assert(html.includes('<div name="myDiv" id="test">Content</div>'))

  // === Variadic Tests ===

  // Basic: multiple string children
  assert(html.includes("<div>FirstSecondThird</div>"))

  // Multiple element children
  assert(
    html.includes(
      "<div><span>First</span><span>Second</span><span>Third</span></div>",
    ),
  )

  // Variadic with attributes
  assert(
    html.includes(
      '<div class="container"><p>One</p><p>Two</p><p>Three</p></div>',
    ),
  )

  // Mixed: strings and elements
  assert(
    html.includes(
      "<p>Text <strong>bold</strong> more text <em>italic</em></p>",
    ),
  )

  // Deeply nested with variadic
  assert(
    html.includes(
      "<section><h1>Title</h1><p>Paragraph one</p><p>Paragraph two</p><div><span>nested</span><span>content</span></div></section>",
    ),
  )

  // Variadic with numbers
  assert(html.includes("<div>12345</div>"))

  // Variadic with mixed types
  assert(html.includes("<div>text42<span>element</span>more text</div>"))

  // Attributes with single child (ensure we didn't break this)
  assert(html.includes('<div id="single">Single child</div>'))

  // Attributes with number child
  assert(html.includes('<div id="number">123</div>'))

  // Complex nesting with variadic
  assert(
    html.includes(
      '<article class="post"><h2>Article Title</h2><p>First paragraph</p><p>Second paragraph</p><div><strong>Important: </strong><span>Some content</span><em> with emphasis</em></div></article>',
    ),
  )

  // Many children (stress test)
  assert(
    html.includes(
      "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li><li>Item 7</li><li>Item 8</li></ul>",
    ),
  )

  // Attributes with many children
  assert(
    html.includes(
      '<div class="grid"><div>Cell 1</div><div>Cell 2</div><div>Cell 3</div><div>Cell 4</div></div>',
    ),
  )
})
