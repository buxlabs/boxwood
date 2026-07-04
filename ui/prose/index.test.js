const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("renders with default props", async () => {
  const { template } = await compile(__dirname)
  const html = template("foo")
  assert(html.includes("foo"))
})

test("supports id", async () => {
  const { template } = await compile(__dirname)
  const html = template({ id: "hello" }, "bar")
  assert(html.includes("hello"))
  assert(html.includes("bar"))
})

test("renders unordered list with dash", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- First item
- Second item
- Third item
  `
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders unordered list with em dash", async () => {
  const { template } = await compile(__dirname)
  const prose = `
— First item
— Second item
— Third item
  `
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders mixed content with lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Shopping List

Here are the items:

- Apples
- Bananas
- Oranges

That's all!
  `
  const html = template(prose)
  assert(html.includes("<h1>Shopping List</h1>"))
  assert(html.includes("<p>Here are the items:</p>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Apples</li>"))
  assert(html.includes("<li>Bananas</li>"))
  assert(html.includes("<li>Oranges</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("That") && html.includes("s all!"))
})

test("handles list followed by heading", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item one
- Item two

## Next Section
  `
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item one</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<h2>Next Section</h2>"))
})

test("handles both dash types in same list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Regular dash
— Em dash
– En dash
• Bullet
- Regular again
  `
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Regular dash</li>"))
  assert(html.includes("<li>Em dash</li>"))
  assert(html.includes("<li>En dash</li>"))
  assert(html.includes("<li>Bullet</li>"))
  assert(html.includes("<li>Regular again</li>"))
  assert(html.includes("</ul>"))
})

test("renders ordered list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
1. First item
2. Second item
3. Third item
  `
  const html = template(prose)
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ol>"))
})

test("renders mixed unordered and ordered lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Shopping List

Buy these items:

- Apples
- Bananas
- Oranges

Follow these steps:

1. Go to store
2. Buy items
3. Return home
  `
  const html = template(prose)
  assert(html.includes("<h1>Shopping List</h1>"))
  assert(html.includes("<p>Buy these items:</p>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Apples</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<p>Follow these steps:</p>"))
  assert(html.includes("<ol>"))
  assert(html.includes("<li>Go to store</li>"))
  assert(html.includes("</ol>"))
})

test("handles transition from ordered to unordered list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
1. First ordered
2. Second ordered
- First unordered
- Second unordered
  `
  const html = template(prose)
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First ordered</li>"))
  assert(html.includes("<li>Second ordered</li>"))
  assert(html.includes("</ol>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First unordered</li>"))
  assert(html.includes("<li>Second unordered</li>"))
  assert(html.includes("</ul>"))
})

test("filters out empty list items", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item with content
- 
• 
- Another item
  `
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item with content</li>"))
  assert(html.includes("<li>Another item</li>"))
  assert(!html.includes("<li></li>"))
})

test("handles array of prose strings", async () => {
  const { template } = await compile(__dirname)
  const prose = ["# First", "# Second"]
  const html = template(prose)
  assert(html.includes("<h1>First</h1>"))
  assert(html.includes("<h1>Second</h1>"))
})

test("groups consecutive blockquotes", async () => {
  const { template } = await compile(__dirname)
  const prose = `
> First line
> Second line
> Third line

Regular paragraph
  `
  const html = template(prose)
  assert(html.includes("<blockquote>"))
  assert(html.includes("<p>First line\nSecond line\nThird line</p>"))
  assert(html.includes("</blockquote>"))
  assert(html.includes("Regular paragraph"))
  const blockquoteCount = (html.match(/<blockquote>/g) || []).length
  assert.strictEqual(blockquoteCount, 1)
})

test("renders bold text", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is **bold** text"
  const html = template(prose)
  assert(html.includes("<p>This is <strong>bold</strong> text</p>"))
})

test("renders italic text", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is *italic* text"
  const html = template(prose)
  assert(html.includes("<p>This is <em>italic</em> text</p>"))
})

test("renders bold and italic together", async () => {
  const { template } = await compile(__dirname)
  const prose = "**bold** and *italic* text"
  const html = template(prose)
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders inline prose in headings", async () => {
  const { template } = await compile(__dirname)
  const prose = "# Heading with **bold**"
  const html = template(prose)
  assert(html.includes("<h1>Heading with <strong>bold</strong></h1>"))
})

test("renders inline prose in lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item with **bold**
- Item with *italic*
  `
  const html = template(prose)
  assert(html.includes("<li>Item with <strong>bold</strong></li>"))
  assert(html.includes("<li>Item with <em>italic</em></li>"))
})

test("renders inline code with backticks", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is `inline code` in a sentence."
  const html = template(prose)
  assert(html.includes("<code>inline code</code>"))
  assert(html.includes("This is "))
  assert(html.includes(" in a sentence."))
})

test("renders inline code mixed with bold and italic", async () => {
  const { template } = await compile(__dirname)
  const prose = "Mix `code` and **bold** and *italic* together."
  const html = template(prose)
  assert(html.includes("<code>code</code>"))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders nested ordered list with unordered list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
1. hello
  - world
2. what happened
  `
  const html = template(prose)

  // The expected structure should be:
  // <ol>
  //   <li>hello
  //     <ul>
  //       <li>world</li>
  //     </ul>
  //   </li>
  //   <li>what happened</li>
  // </ol>

  assert(html.includes("<ol>"))
  assert(html.includes("<li>hello"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>world</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("</li>"))
  assert(html.includes("<li>what happened</li>"))
  assert(html.includes("</ol>"))

  // Verify proper nesting: ul should appear between the first li's opening and closing tags
  const olCount = (html.match(/<ol>/g) || []).length
  assert.strictEqual(olCount, 1, "Should have exactly one <ol> tag")

  const ulCount = (html.match(/<ul>/g) || []).length
  assert.strictEqual(ulCount, 1, "Should have exactly one <ul> tag")

  // Check structure: the ul should be nested inside the first li
  const pattern =
    /<ol><li>hello<ul><li>world<\/li><\/ul><\/li><li>what happened<\/li><\/ol>/
  assert(
    pattern.test(html),
    `HTML structure doesn't match expected nested pattern. Got: ${html}`,
  )
})

test("renders nested unordered list with ordered list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- First item
  1. Nested one
  2. Nested two
- Second item
  `
  const html = template(prose)

  const ulCount = (html.match(/<ul>/g) || []).length
  assert.strictEqual(ulCount, 1, "Should have exactly one <ul> tag")

  const olCount = (html.match(/<ol>/g) || []).length
  assert.strictEqual(olCount, 1, "Should have exactly one <ol> tag")

  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item"))
  assert(html.includes("<ol>"))
  assert(html.includes("<li>Nested one</li>"))
  assert(html.includes("<li>Nested two</li>"))
  assert(html.includes("</ol>"))
  assert(html.includes("<li>Second item</li>"))
})

test("renders multiple nested items in same list", async () => {
  const { template } = await compile(__dirname)
  const prose = `
1. First
  - Nested A
  - Nested B
2. Second
  - Nested C
  `
  const html = template(prose)

  const olCount = (html.match(/<ol>/g) || []).length
  assert.strictEqual(olCount, 1, "Should have exactly one <ol> tag")

  const ulCount = (html.match(/<ul>/g) || []).length
  assert.strictEqual(
    ulCount,
    2,
    "Should have exactly two <ul> tags (one for each nested list)",
  )

  assert(html.includes("<li>First"))
  assert(html.includes("<li>Nested A</li>"))
  assert(html.includes("<li>Nested B</li>"))
  assert(html.includes("<li>Second"))
  assert(html.includes("<li>Nested C</li>"))
})

test("renders deeply nested lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
1. Level 1
  - Level 2
    1. Level 3
  `
  const html = template(prose)

  assert(html.includes("<ol>"))
  assert(html.includes("<li>Level 1"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Level 2"))
  assert(html.includes("<li>Level 3</li>"))

  // Should have 2 ol tags (outer and nested)
  const olCount = (html.match(/<ol>/g) || []).length
  assert.strictEqual(olCount, 2, "Should have exactly two <ol> tags")
})

test("handles mixed content with nested lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Title

Some text

1. First item
  - Nested bullet
  - Another bullet
2. Second item

More text
  `
  const html = template(prose)

  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes("<p>Some text</p>"))
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First item"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Nested bullet</li>"))
  assert(html.includes("<li>Another bullet</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("</ol>"))
  assert(html.includes("<p>More text</p>"))
})

test("renders prose links", async () => {
  const { template } = await compile(__dirname)
  const prose = "[some test](/some-link)"
  const html = template(prose)
  assert(html.includes('<a href="/some-link">some test</a>'))
})

test("renders multiple links in same paragraph", async () => {
  const { template } = await compile(__dirname)
  const prose =
    "Check out [Google](https://google.com) and [GitHub](https://github.com)"
  const html = template(prose)
  assert(html.includes('<a href="https://google.com">Google</a>'))
  assert(html.includes('<a href="https://github.com">GitHub</a>'))
})

test("renders links in headings", async () => {
  const { template } = await compile(__dirname)
  const prose = "# Heading with [link](/url)"
  const html = template(prose)
  assert(html.includes('<h1>Heading with <a href="/url">link</a></h1>'))
})

test("renders links in list items", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item with [link](/url)
- Another [item](/path) here
  `
  const html = template(prose)
  assert(html.includes('<li>Item with <a href="/url">link</a></li>'))
  assert(html.includes('<li>Another <a href="/path">item</a> here</li>'))
})

test("renders links mixed with bold and italic", async () => {
  const { template } = await compile(__dirname)
  const prose =
    "Visit **bold [link](https://example.com)** or *italic [link](/path)*"
  const html = template(prose)
  assert(html.includes('<a href="https://example.com">link</a>'))
  assert(html.includes('<a href="/path">link</a>'))
  assert(html.includes("<strong>"))
  assert(html.includes("<em>"))
})

test("handles invalid link syntax", async () => {
  const { template } = await compile(__dirname)
  const prose = "[text without closing paren](/url or [incomplete"
  const html = template(prose)
  // Should render as plain text when link syntax is invalid
  assert(html.includes("[text without closing paren](/url"))
  assert(html.includes("[incomplete"))
})

test("renders links with bold and italic inside link text", async () => {
  const { template } = await compile(__dirname)
  const prose = "[**bold** and *italic*](/url)"
  const html = template(prose)
  assert(html.includes('<a href="/url">'))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
  assert(html.includes("</a>"))
})

test("renders horizontal rule with dashes", async () => {
  const { template } = await compile(__dirname)
  const prose = "---"
  const html = template(prose)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with asterisks", async () => {
  const { template } = await compile(__dirname)
  const prose = "***"
  const html = template(prose)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with underscores", async () => {
  const { template } = await compile(__dirname)
  const prose = "___"
  const html = template(prose)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with spaces", async () => {
  const { template } = await compile(__dirname)
  const prose = "* * *"
  const html = template(prose)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with many characters", async () => {
  const { template } = await compile(__dirname)
  const prose = "-------"
  const html = template(prose)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule between paragraphs", async () => {
  const { template } = await compile(__dirname)
  const prose = `
First paragraph

---

Second paragraph
  `
  const html = template(prose)
  assert(html.includes("<p>First paragraph</p>"))
  assert(html.includes("<hr>"))
  assert(html.includes("<p>Second paragraph</p>"))
})

test("renders multiple horizontal rules", async () => {
  const { template } = await compile(__dirname)
  const prose = `
Section 1

---

Section 2

***

Section 3
  `
  const html = template(prose)
  const hrCount = (html.match(/<hr>/g) || []).length
  assert.strictEqual(hrCount, 2, "Should have exactly two <hr> tags")
  assert(html.includes("<p>Section 1</p>"))
  assert(html.includes("<p>Section 2</p>"))
  assert(html.includes("<p>Section 3</p>"))
})

test("renders basic image", async () => {
  const { template } = await compile(__dirname)
  const prose = "![alt text](/image.png)"
  const html = template(prose)
  assert(html.includes('<img src="/image.png" alt="alt text">'))
})

test("renders image without alt text", async () => {
  const { template } = await compile(__dirname)
  const prose = "![](/image.jpg)"
  const html = template(prose)
  assert(html.includes('<img src="/image.jpg" alt="">'))
})

test("renders multiple images in paragraph", async () => {
  const { template } = await compile(__dirname)
  const prose = "Look at ![first](/1.png) and ![second](/2.png)"
  const html = template(prose)
  assert(html.includes('<img src="/1.png" alt="first">'))
  assert(html.includes('<img src="/2.png" alt="second">'))
})

test("renders images in headings", async () => {
  const { template } = await compile(__dirname)
  const prose = "# Heading with ![icon](/icon.svg)"
  const html = template(prose)
  assert(html.includes("<h1>"))
  assert(html.includes('<img src="/icon.svg" alt="icon">'))
  assert(html.includes("</h1>"))
})

test("renders images in list items", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item with ![image](/img.png)
- Another ![pic](/pic.jpg) here
  `
  const html = template(prose)
  assert(html.includes('<li>Item with <img src="/img.png" alt="image"></li>'))
  assert(html.includes('<li>Another <img src="/pic.jpg" alt="pic"> here</li>'))
})

test("renders image with URL containing special characters", async () => {
  const { template } = await compile(__dirname)
  const prose = "![logo](https://example.com/images/logo.png)"
  const html = template(prose)
  assert(
    html.includes('<img src="https://example.com/images/logo.png" alt="logo">'),
  )
})

test("handles invalid image syntax", async () => {
  const { template } = await compile(__dirname)
  const prose = "![alt text without closing paren(/url or ![incomplete"
  const html = template(prose)
  // Should render as plain text when image syntax is invalid
  assert(html.includes("![alt text without closing paren(/url"))
  assert(html.includes("![incomplete"))
})

test("distinguishes between images and links", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is a [link](/url) and this is an ![image](/img.png)"
  const html = template(prose)
  assert(html.includes('<a href="/url">link</a>'))
  assert(html.includes('<img src="/img.png" alt="image">'))
})

test("renders image inside link", async () => {
  const { template } = await compile(__dirname)
  const prose = "[![alt text](/image.png)](/link)"
  const html = template(prose)
  assert(html.includes('<a href="/link">'))
  assert(html.includes('<img src="/image.png" alt="alt text">'))
  assert(html.includes("</a>"))
})

test("renders image inside link with surrounding text", async () => {
  const { template } = await compile(__dirname)
  const prose = "Click [![icon](/icon.png)](/home) to go home"
  const html = template(prose)
  assert(html.includes('<a href="/home">'))
  assert(html.includes('<img src="/icon.png" alt="icon">'))
  assert(html.includes("</a>"))
})

test("renders multiple images inside links", async () => {
  const { template } = await compile(__dirname)
  const prose = "[![first](/1.png)](/url1) and [![second](/2.png)](/url2)"
  const html = template(prose)
  assert(html.includes('<a href="/url1"><img src="/1.png" alt="first"></a>'))
  assert(html.includes('<a href="/url2"><img src="/2.png" alt="second"></a>'))
})

test("renders link with image and text", async () => {
  const { template } = await compile(__dirname)
  const prose = "[Click ![icon](/icon.png) here](/url)"
  const html = template(prose)
  assert(html.includes('<a href="/url">'))
  assert(html.includes("Click "))
  assert(html.includes('<img src="/icon.png" alt="icon">'))
  assert(html.includes(" here"))
  assert(html.includes("</a>"))
})

test("renders basic code block", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`
const x = 1
console.log(x)
\`\`\`
  `
  const html = template(prose)
  assert(html.includes("<pre>"))
  assert(html.includes("<code>"))
  assert(html.includes("const x = 1"))
  assert(html.includes("console.log(x)"))
  assert(html.includes("</code>"))
  assert(html.includes("</pre>"))
})

test("renders code block with language", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`javascript
function hello() {
  return "world"
}
\`\`\`
  `
  const html = template(prose)
  assert(html.includes("<pre>"))
  assert(html.includes('class="language-javascript"'))
  assert(html.includes("function hello()"))
  // Quotes are HTML-escaped
  assert(
    html.includes("return &quot;world&quot;") ||
      html.includes('return "world"'),
  )
})

test("renders code block with empty lines", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`
line 1

line 3
\`\`\`
  `
  const html = template(prose)
  assert(html.includes("line 1"))
  assert(html.includes("line 3"))
  // Empty line should be preserved
  assert(html.includes("line 1\n\nline 3"))
})

test("renders multiple code blocks", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`javascript
const x = 1
\`\`\`

Some text

\`\`\`python
y = 2
\`\`\`
  `
  const html = template(prose)
  const preCount = (html.match(/<pre>/g) || []).length
  assert.strictEqual(preCount, 2)
  assert(html.includes('class="language-javascript"'))
  assert(html.includes('class="language-python"'))
})

test("renders code block between other content", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Title

Some paragraph text

\`\`\`
code here
\`\`\`

More text
  `
  const html = template(prose)
  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes("<p>Some paragraph text</p>"))
  assert(html.includes("<pre>"))
  assert(html.includes("code here"))
  assert(html.includes("<p>More text</p>"))
})

test("handles code block with special prose characters", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`
**not bold**
*not italic*
[not a link](url)
\`\`\`
  `
  const html = template(prose)
  assert(html.includes("**not bold**"))
  assert(html.includes("*not italic*"))
  assert(html.includes("[not a link](url)"))
  // Should not contain formatted elements
  assert(!html.includes("<strong>"))
  assert(!html.includes("<em>"))
  assert(!html.includes("<a "))
})

test("handles unclosed code block", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`
code without closing
more code
  `
  const html = template(prose)
  // Should still create a code block with all remaining content
  assert(html.includes("<pre>"))
  assert(html.includes("code without closing"))
  assert(html.includes("more code"))
})

test("handles code block with indentation preserved", async () => {
  const { template } = await compile(__dirname)
  const prose = `
\`\`\`
function test() {
  if (true) {
    return 1
  }
}
\`\`\`
  `
  const html = template(prose)
  assert(html.includes("function test()"))
  assert(html.includes("  if (true)"))
  assert(html.includes("    return 1"))
})

test("renders autolink with angle brackets (URL)", async () => {
  const { template } = await compile(__dirname)
  const prose = "Visit <https://example.com> for more"
  const html = template(prose)
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
})

test("renders autolink with angle brackets (email)", async () => {
  const { template } = await compile(__dirname)
  const prose = "Contact <user@example.com> for help"
  const html = template(prose)
  assert(
    html.includes('<a href="mailto:user@example.com">user@example.com</a>'),
  )
})

test("renders multiple autolinks", async () => {
  const { template } = await compile(__dirname)
  const prose = "See <https://a.com> and <https://b.com>"
  const html = template(prose)
  assert(html.includes('<a href="https://a.com">https://a.com</a>'))
  assert(html.includes('<a href="https://b.com">https://b.com</a>'))
})

test("renders autolinks in lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Check <https://example.com>
- Email <admin@example.com>
  `
  const html = template(prose)
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
  assert(
    html.includes('<a href="mailto:admin@example.com">admin@example.com</a>'),
  )
})

test("renders autolinks with http protocol", async () => {
  const { template } = await compile(__dirname)
  const prose = "Visit <http://example.com>"
  const html = template(prose)
  assert(html.includes('<a href="http://example.com">http://example.com</a>'))
})

test("handles invalid autolink syntax", async () => {
  const { template } = await compile(__dirname)
  const prose = "<not a url or email>"
  const html = template(prose)
  // Should be treated as plain text and HTML-escaped
  assert(html.includes("&lt;not a url or email&gt;"))
})

test("renders autolinks mixed with other formatting", async () => {
  const { template } = await compile(__dirname)
  const prose = "**Important**: visit <https://example.com> for **details**"
  const html = template(prose)
  assert(html.includes("<strong>Important</strong>"))
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
  assert(html.includes("<strong>details</strong>"))
})

test("escapes asterisks with backslash", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is \\*not bold\\*"
  const html = template(prose)
  assert(html.includes("<p>This is *not bold*</p>"))
  assert(!html.includes("<strong>"))
})

test("escapes brackets with backslash", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is \\[not a link\\](url)"
  const html = template(prose)
  assert(html.includes("[not a link](url)"))
  assert(!html.includes("<a "))
})

test("escapes backticks with backslash", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is \\`not code\\`"
  const html = template(prose)
  assert(html.includes("`not code`"))
  assert(!html.includes("<code>"))
})

test("escapes backslash itself", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is a backslash: \\\\"
  const html = template(prose)
  assert(html.includes("backslash: \\"))
})

test("escapes exclamation mark for images", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is \\!\\[not an image\\](url)"
  const html = template(prose)
  assert(html.includes("![not an image](url)"))
  assert(!html.includes("<img"))
  assert(!html.includes("<a "))
})

test("escapes angle brackets for autolinks", async () => {
  const { template } = await compile(__dirname)
  const prose = "This is \\<not an autolink\\>"
  const html = template(prose)
  // Angle brackets are HTML-escaped in output
  assert(
    html.includes("&lt;not an autolink&gt;") ||
      html.includes("<not an autolink>"),
  )
  assert(!html.includes("<a href"))
})

test("handles mixed escaped and unescaped formatting", async () => {
  const { template } = await compile(__dirname)
  const prose = "**bold** and \\*not bold\\* and **more bold**"
  const html = template(prose)
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("*not bold*"))
  assert(html.includes("<strong>more bold</strong>"))
})

test("escapes only special prose characters", async () => {
  const { template } = await compile(__dirname)
  const prose = "Normal backslash\\n should stay"
  const html = template(prose)
  // \n is not a special prose char, so backslash should remain
  assert(html.includes("backslash\\n"))
})

test("handles escape at end of string", async () => {
  const { template } = await compile(__dirname)
  const prose = "Text ends with \\"
  const html = template(prose)
  assert(html.includes("ends with \\"))
})

test("escapes parentheses", async () => {
  const { template } = await compile(__dirname)
  const prose = "[link]\\(not url\\)"
  const html = template(prose)
  assert(html.includes("[link](not url)"))
  assert(!html.includes("<a "))
})

test("escapes in lists", async () => {
  const { template } = await compile(__dirname)
  const prose = `
- Item with \\*escaped asterisks\\*
- Item with \\[escaped brackets\\]
  `
  const html = template(prose)
  assert(html.includes("<li>Item with *escaped asterisks*</li>"))
  assert(html.includes("<li>Item with [escaped brackets]</li>"))
})

test("escapes in headings", async () => {
  const { template } = await compile(__dirname)
  const prose = "# Heading with \\*escaped\\* text"
  const html = template(prose)
  assert(html.includes("<h1>Heading with *escaped* text</h1>"))
  assert(!html.includes("<strong>"))
})

// Regression tests - escapes work correctly with all prose features

test("bold with escaped asterisk inside still renders bold", async () => {
  const { template } = await compile(__dirname)
  const prose = "**bold \\* text**"
  const html = template(prose)
  assert(html.includes("<strong>"))
  assert(html.includes("*"))
  assert(!html.includes("\\"))
})

test("link with escaped bracket in text still renders link", async () => {
  const { template } = await compile(__dirname)
  const prose = "[link \\[ text](https://example.com)"
  const html = template(prose)
  assert(html.includes('<a href="https://example.com">'))
  assert(html.includes("["))
  assert(!html.includes("\\"))
})

test("escaped opening bracket prevents link formation", async () => {
  const { template } = await compile(__dirname)
  const prose = "\\[not a link](url)"
  const html = template(prose)
  assert(html.includes("[not a link](url)"))
  assert(!html.includes("<a"))
})

test("escaped exclamation with following link creates link not image", async () => {
  const { template } = await compile(__dirname)
  const prose = "\\![text](url)"
  const html = template(prose)
  assert(html.includes("!"))
  assert(html.includes('<a href="url">'))
  assert(!html.includes("<img"))
})

test("escapes work in lists without breaking list rendering", async () => {
  const { template } = await compile(__dirname)
  const prose = "- Item \\*one\\*\n- Item **two**"
  const html = template(prose)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item *one*</li>"))
  assert(html.includes("<strong>two</strong>"))
})

test("escapes work in blockquotes without breaking blockquote", async () => {
  const { template } = await compile(__dirname)
  const prose = "> Quote \\*with\\* asterisks"
  const html = template(prose)
  assert(html.includes("<blockquote>"))
  assert(html.includes("*with*"))
  assert(!html.includes("<em>"))
})

test("multiple escapes across paragraphs don't interfere", async () => {
  const { template } = await compile(__dirname)
  const prose = "Para \\*one\\*\n\nPara **two**"
  const html = template(prose)
  assert(html.includes("*one*"))
  assert(html.includes("<strong>two</strong>"))
})

test("escaped backslash before prose character", async () => {
  const { template } = await compile(__dirname)
  const prose = "Text \\\\*italic*"
  const html = template(prose)
  assert(html.includes("\\"))
  assert(html.includes("<em>italic</em>"))
})

test("code blocks preserve backslashes", async () => {
  const { template } = await compile(__dirname)
  const prose = "```\ncode \\* with \\[ escapes\n```"
  const html = template(prose)
  assert(html.includes("<pre>"))
  assert(html.includes("\\*"))
  assert(html.includes("\\["))
})

test("nested prose with escapes - bold link with escaped bracket", async () => {
  const { template } = await compile(__dirname)
  const prose = "**[link \\] text](url)**"
  const html = template(prose)
  assert(html.includes("<strong>"))
  assert(html.includes('<a href="url">'))
  assert(html.includes("]"))
})

// Custom components and data variables tests
const { Div, Span } = require("../..")

// Test components for custom component tests
const Alert = (props, children) => {
  const type = (props && props.type) || "info"
  return Div({ class: `alert alert-${type}` }, children)
}

const Button = (props) => {
  const variant = (props && props.variant) || "default"
  const text = (props && props.text) || "Button"
  return Div({ class: `btn btn-${variant}` }, text)
}

const Card = (props, children) => {
  const title = props && props.title
  const content = title
    ? [
        Div({ class: "card-title" }, title),
        ...(Array.isArray(children) ? children : [children]),
      ]
    : children
  return Div({ class: "card" }, content)
}

test("renders custom self-closing component", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Button },
    },
    "<Button />",
  )
  assert(html.includes('<div class="btn btn-default">Button</div>'))
})

test("renders custom self-closing component with attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Button },
    },
    '<Button variant="primary" text="Click me" />',
  )

  assert(html.includes('<div class="btn btn-primary">Click me</div>'))
})

test("renders custom component with children", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
    },
    `
<Alert type="warning">
This is a warning message!
</Alert>
  `,
  )

  assert(html.includes('<div class="alert alert-warning">'))
  assert(html.includes("This is a warning message!"))
})

test("renders custom component with prose in children", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
    },
    `
<Alert type="info">
This is **bold** and *italic* text.
</Alert>
  `,
  )

  assert(html.includes('<div class="alert alert-info">'))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders variable in text", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      data: { name: "John" },
    },
    "Hello {name}!",
  )

  assert(html.includes("Hello John!"))
})

test("renders multiple variables", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      data: { name: "Alice", count: 5 },
    },
    "Hello {name}, you have {count} messages.",
  )
  assert(html.includes("Hello Alice, you have 5 messages."))
})

test("renders variable in component attribute", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
      data: { alertType: "warning" },
    },
    `
<Alert type={alertType}>
Message
</Alert>
  `,
  )

  assert(html.includes('<div class="alert alert-warning">'))
})

test("renders variables in text and components together", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
      data: { userName: "Bob", alertType: "success" },
    },
    `
# Welcome {userName}!

<Alert type={alertType}>
Hello **{userName}**!
</Alert>
  `,
  )

  assert(html.includes("<h1>Welcome Bob!</h1>"))
  assert(html.includes('<div class="alert alert-success">'))
  assert(html.includes("Hello <strong>Bob</strong>!"))
})

test("handles missing variable in text", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      data: {},
    },
    "Hello {name}!",
  )

  assert(html.includes("Hello {name}!"))
})

test("handles escaped variable", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      data: { name: "John" },
    },
    "Literal \\{name} and actual {name}",
  )

  assert(html.includes("Literal {name} and actual John"))
})

test("renders custom component with nested prose", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Card },
    },
    `
<Card title="My Card">
## Heading

This is a paragraph with a [link](http://example.com).

- Item 1
- Item 2
</Card>
  `,
  )

  assert(html.includes('<div class="card">'))
  assert(html.includes('<div class="card-title">My Card</div>'))
  assert(html.includes("<h2>Heading</h2>"))
  assert(html.includes('<a href="http://example.com">link</a>'))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item 1</li>"))
})

test("renders multiple custom components", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert, Button },
    },
    `
# Title

<Alert type="info">
Important information
</Alert>

<Button variant="primary" text="Click" />
  `,
  )
  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes('<div class="alert alert-info">'))
  assert(html.includes("Important information"))
  assert(html.includes('<div class="btn btn-primary">Click</div>'))
})

test("renders kebab-case component names", async () => {
  const CustomTag = (props) => Div({ class: "custom" }, "Custom")
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { "custom-tag": CustomTag },
    },
    "<custom-tag />",
  )
  assert(html.includes('<div class="custom">Custom</div>'))
})

test("renders nested custom components", async () => {
  const Outer = (props, children) => Div({ class: "outer" }, children)
  const Inner = (props, children) => Span({ class: "inner" }, children)
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Outer, Inner },
    },
    `
<Outer>
<Inner>
Nested content
</Inner>
</Outer>
  `,
  )
  assert(html.includes('<div class="outer">'))
  assert(html.includes('<span class="inner">'))
  assert(html.includes("Nested content"))
})

test("handles numeric data values", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      data: { count: 42, price: 99.99, zero: 0 },
    },
    "Count: {count}, Price: {price}, Zero: {zero}",
  )

  assert(html.includes("Count: 42, Price: 99.99, Zero: 0"))
})

test("handles boolean attributes", async () => {
  const Widget = (props) => {
    const disabled = props && props.disabled
    const className = disabled ? "widget disabled" : "widget"
    return Div({ class: className }, "Widget")
  }
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Widget },
    },
    "<Widget disabled />",
  )

  assert(html.includes('<div class="widget disabled">'))
})

test("ignores unknown component tags", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
    },
    `
<UnknownComponent />

<Alert type="info">
Known component
</Alert>
  `,
  )

  // Unknown components are treated as regular text
  assert(html.includes("UnknownComponent"))
  assert(html.includes('<div class="alert alert-info">'))
  assert(html.includes("Known component"))
})

test("works without custom components", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "# Title\n\nRegular prose content")

  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes("Regular prose content"))
})

test("works without data", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      components: { Alert },
    },
    `
<Alert type="info">
No variables here
</Alert>
  `,
  )

  assert(html.includes('<div class="alert alert-info">'))
  assert(html.includes("No variables here"))
})

// Builtin HTML tags tests - one test per tag to ensure comprehensive coverage
// Note: Tags work in multi-line format or self-closing format

test("renders div tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<div class="container">
Content
</div>
  `,
  )
  assert(html.includes('<div class="container">'))
  assert(html.includes("Content"))
})

test("renders span tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<span class="highlight">
Text
</span>
  `,
  )
  assert(html.includes('<span class="highlight">'))
  assert(html.includes("Text"))
})

test("renders article tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<article>
Article content
</article>
  `,
  )
  assert(html.includes("<article>"))
  assert(html.includes("Article content"))
})

test("renders section tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<section>
Section content
</section>
  `,
  )
  assert(html.includes("<section>"))
  assert(html.includes("Section content"))
})

test("renders header tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<header>
Header content
</header>
  `,
  )
  assert(html.includes("<header>"))
  assert(html.includes("Header content"))
})

test("renders footer tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<footer>
Footer content
</footer>
  `,
  )
  assert(html.includes("<footer>"))
  assert(html.includes("Footer content"))
})

test("renders main tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<main>
Main content
</main>
  `,
  )
  assert(html.includes("<main>"))
  assert(html.includes("Main content"))
})

test("renders aside tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<aside>
Sidebar content
</aside>
  `,
  )
  assert(html.includes("<aside>"))
  assert(html.includes("Sidebar content"))
})

test("renders nav tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<nav>
Navigation
</nav>
  `,
  )
  assert(html.includes("<nav>"))
  assert(html.includes("Navigation"))
})

test("renders h1 tag (alternative to # syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h1>
Heading 1
</h1>
  `,
  )
  assert(html.includes("<h1>"))
  assert(html.includes("Heading 1"))
})

test("renders h2 tag (alternative to ## syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h2>
Heading 2
</h2>
  `,
  )
  assert(html.includes("<h2>"))
  assert(html.includes("Heading 2"))
})

test("renders h3 tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h3>
Heading 3
</h3>
  `,
  )
  assert(html.includes("<h3>"))
  assert(html.includes("Heading 3"))
})

test("renders h4 tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h4>
Heading 4
</h4>
  `,
  )
  assert(html.includes("<h4>"))
  assert(html.includes("Heading 4"))
})

test("renders h5 tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h5>
Heading 5
</h5>
  `,
  )
  assert(html.includes("<h5>"))
  assert(html.includes("Heading 5"))
})

test("renders h6 tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<h6>
Heading 6
</h6>
  `,
  )
  assert(html.includes("<h6>"))
  assert(html.includes("Heading 6"))
})

test("renders p tag (alternative to prose paragraph)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<p>
Paragraph content
</p>
  `,
  )
  assert(html.includes("<p>"))
  assert(html.includes("Paragraph content"))
})

test("renders strong tag (alternative to **bold**)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<strong>
Bold text
</strong>
  `,
  )
  assert(html.includes("<strong>"))
  assert(html.includes("Bold text"))
})

test("renders em tag (alternative to *italic*)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<em>
Italic text
</em>
  `,
  )
  assert(html.includes("<em>"))
  assert(html.includes("Italic text"))
})

test("renders b tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<b>
Bold text
</b>
  `,
  )
  assert(html.includes("<b>"))
  assert(html.includes("Bold text"))
})

test("renders i tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<i>
Italic text
</i>
  `,
  )
  assert(html.includes("<i>"))
  assert(html.includes("Italic text"))
})

test("renders u tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<u>
Underlined text
</u>
  `,
  )
  assert(html.includes("<u>"))
  assert(html.includes("Underlined text"))
})

test("renders s tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<s>
Strikethrough text
</s>
  `,
  )
  assert(html.includes("<s>"))
  assert(html.includes("Strikethrough text"))
})

test("renders small tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<small>
Small text
</small>
  `,
  )
  assert(html.includes("<small>"))
  assert(html.includes("Small text"))
})

test("renders mark tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<mark>
Highlighted text
</mark>
  `,
  )
  assert(html.includes("<mark>"))
  assert(html.includes("Highlighted text"))
})

test("renders sub tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<sub>
2
</sub>
  `,
  )
  assert(html.includes("<sub>"))
  assert(html.includes("2"))
})

test("renders sup tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<sup>
2
</sup>
  `,
  )
  assert(html.includes("<sup>"))
  assert(html.includes("2"))
})

test("renders br tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<br />")
  assert(html.includes("<br>"))
})

test("renders wbr tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<wbr />")
  assert(html.includes("<wbr>"))
})

test("renders abbr tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<abbr title="HyperText Markup Language">
HTML
</abbr>
  `,
  )
  assert(html.includes('<abbr title="HyperText Markup Language">'))
  assert(html.includes("HTML"))
})

test("renders cite tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<cite>
The Great Gatsby
</cite>
  `,
  )
  assert(html.includes("<cite>"))
  assert(html.includes("The Great Gatsby"))
})

test("renders q tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<q>
Quoted text
</q>
  `,
  )
  assert(html.includes("<q>"))
  assert(html.includes("Quoted text"))
})

test("renders kbd tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<kbd>
Ctrl
</kbd>
  `,
  )
  assert(html.includes("<kbd>"))
  assert(html.includes("Ctrl"))
})

test("renders samp tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<samp>
Sample output
</samp>
  `,
  )
  assert(html.includes("<samp>"))
  assert(html.includes("Sample output"))
})

test("renders var tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<var>
x
</var>
  `,
  )
  assert(html.includes("<var>"))
  assert(html.includes("x"))
})

test("renders del tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<del>
Deleted text
</del>
  `,
  )
  assert(html.includes("<del>"))
  assert(html.includes("Deleted text"))
})

test("renders ins tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<ins>
Inserted text
</ins>
  `,
  )
  assert(html.includes("<ins>"))
  assert(html.includes("Inserted text"))
})

test("renders dfn tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<dfn>
Definition term
</dfn>
  `,
  )
  assert(html.includes("<dfn>"))
  assert(html.includes("Definition term"))
})

test("renders ul tag (alternative to - syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<ul>
<li>
Item
</li>
</ul>
  `,
  )
  assert(html.includes("<ul>"))
  assert(html.includes("<li>"))
  assert(html.includes("Item"))
})

test("renders ol tag (alternative to 1. syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<ol>
<li>
Item
</li>
</ol>
  `,
  )
  assert(html.includes("<ol>"))
  assert(html.includes("<li>"))
  assert(html.includes("Item"))
})

test("renders li tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<ul>
<li>
List item
</li>
</ul>
  `,
  )
  assert(html.includes("<li>"))
  assert(html.includes("List item"))
})

test("renders dl tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<dl>
<dt>
Term
</dt>
<dd>
Definition
</dd>
</dl>
  `,
  )
  assert(html.includes("<dl>"))
  assert(html.includes("<dt>"))
  assert(html.includes("<dd>"))
})

test("renders dt tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<dl>
<dt>
Term
</dt>
</dl>
  `,
  )
  assert(html.includes("<dt>"))
  assert(html.includes("Term"))
})

test("renders dd tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<dl>
<dd>
Definition
</dd>
</dl>
  `,
  )
  assert(html.includes("<dd>"))
  assert(html.includes("Definition"))
})

test("renders a tag (alternative to [text](url) syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<a href="/page">
Link
</a>
  `,
  )
  assert(html.includes('<a href="/page">'))
  assert(html.includes("Link"))
})

test("renders img tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, '<img src="image.jpg" alt="Description" />')
  assert(html.includes('<img src="image.jpg" alt="Description">'))
})

test("renders picture tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<picture>
<img src="image.jpg" alt="Image" />
</picture>
  `,
  )
  assert(html.includes("<picture>"))
  assert(html.includes('<img src="image.jpg" alt="Image">'))
})

test("renders source tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<picture>
<source srcset="image.webp" type="image/webp" />
<img src="image.jpg" alt="Image" />
</picture>
  `,
  )
  assert(html.includes('<source srcset="image.webp" type="image/webp">'))
})

test("renders code tag (alternative to backtick syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<code>
inline code
</code>
  `,
  )
  assert(html.includes("<code>"))
  assert(html.includes("inline code"))
})

test("renders pre tag (alternative to ``` syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<pre>
Preformatted text
</pre>
  `,
  )
  assert(html.includes("<pre>"))
  assert(html.includes("Preformatted text"))
})

test("renders table tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tr>
<td>
Cell
</td>
</tr>
</table>
  `,
  )
  assert(html.includes("<table>"))
  assert(html.includes("<tr>"))
  assert(html.includes("<td>"))
})

test("renders thead tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<thead>
<tr>
<th>
Header
</th>
</tr>
</thead>
</table>
  `,
  )
  assert(html.includes("<thead>"))
  assert(html.includes("<th>"))
})

test("renders tbody tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tbody>
<tr>
<td>
Data
</td>
</tr>
</tbody>
</table>
  `,
  )
  assert(html.includes("<tbody>"))
  assert(html.includes("<td>"))
})

test("renders tfoot tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tfoot>
<tr>
<td>
Footer
</td>
</tr>
</tfoot>
</table>
  `,
  )
  assert(html.includes("<tfoot>"))
})

test("renders tr tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tr>
<td>
Cell
</td>
</tr>
</table>
  `,
  )
  assert(html.includes("<tr>"))
})

test("renders th tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tr>
<th>
Header
</th>
</tr>
</table>
  `,
  )
  assert(html.includes("<th>"))
  assert(html.includes("Header"))
})

test("renders td tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<tr>
<td>
Data
</td>
</tr>
</table>
  `,
  )
  assert(html.includes("<td>"))
  assert(html.includes("Data"))
})

test("renders caption tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<caption>
Table caption
</caption>
</table>
  `,
  )
  assert(html.includes("<caption>"))
  assert(html.includes("Table caption"))
})

test("renders colgroup tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<colgroup>
<col />
</colgroup>
</table>
  `,
  )
  assert(html.includes("<colgroup>"))
  assert(html.includes("<col>"))
})

test("renders col tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<colgroup>
<col span="2" />
</colgroup>
</table>
  `,
  )
  assert(html.includes('<col span="2">'))
})

test("renders blockquote tag (alternative to > syntax)", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<blockquote>
Quote
</blockquote>
  `,
  )
  assert(html.includes("<blockquote>"))
  assert(html.includes("Quote"))
})

test("renders hr tag (self-closing)", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<hr />")
  assert(html.includes("<hr>"))
})

test("renders figure tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<figure>
<img src="image.jpg" alt="Image" />
</figure>
  `,
  )
  assert(html.includes("<figure>"))
  assert(html.includes('<img src="image.jpg" alt="Image">'))
})

test("renders figcaption tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<figure>
<img src="image.jpg" alt="Image" />
<figcaption>
Caption
</figcaption>
</figure>
  `,
  )
  assert(html.includes("<figcaption>"))
  assert(html.includes("Caption"))
})

test("renders details tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<details>
<summary>
Summary
</summary>
Details
</details>
  `,
  )
  assert(html.includes("<details>"))
  assert(html.includes("<summary>"))
  assert(html.includes("Summary"))
})

test("renders summary tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<details>
<summary>
Click to expand
</summary>
</details>
  `,
  )
  assert(html.includes("<summary>"))
  assert(html.includes("Click to expand"))
})

test("renders address tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<address>
Contact info
</address>
  `,
  )
  assert(html.includes("<address>"))
  assert(html.includes("Contact info"))
})

test("renders time tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<time datetime="2026-07-03">
July 3, 2026
</time>
  `,
  )
  assert(html.includes('<time datetime="2026-07-03">'))
  assert(html.includes("July 3, 2026"))
})

test("renders data tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<data value="12345">
Product code
</data>
  `,
  )
  assert(html.includes('<data value="12345">'))
  assert(html.includes("Product code"))
})

// Integration tests - mixing builtin tags with prose

test("mixes builtin HTML tags with prose syntax", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Markdown Heading

<div class="container">
  
Regular **prose** formatting works inside HTML tags.

<article>
<header>
<time datetime="2026-07-03">
July 3, 2026
</time>
</header>

Content with **bold** text.

</article>

</div>
  `
  const html = template({}, prose)
  assert(html.includes("<h1>Markdown Heading</h1>"))
  assert(html.includes('<div class="container">'))
  assert(html.includes("<strong>prose</strong>"))
  assert(html.includes("<article>"))
  assert(html.includes('<time datetime="2026-07-03">'))
  assert(html.includes("<strong>bold</strong>"))
})

test("renders nested builtin HTML tags", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<section>
<article>
<header>
<h2>
Title
</h2>
</header>
<p>
Content
</p>
<footer>
Footer
</footer>
</article>
</section>
  `,
  )
  assert(html.includes("<section>"))
  assert(html.includes("<article>"))
  assert(html.includes("<header>"))
  assert(html.includes("<h2>"))
  assert(html.includes("Title"))
  assert(html.includes("<p>"))
  assert(html.includes("Content"))
  assert(html.includes("<footer>"))
})

test("renders table with all table elements", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<table>
<caption>
Sample Table
</caption>
<colgroup>
<col span="2" />
</colgroup>
<thead>
<tr>
<th>
Header 1
</th>
<th>
Header 2
</th>
</tr>
</thead>
<tbody>
<tr>
<td>
Data 1
</td>
<td>
Data 2
</td>
</tr>
</tbody>
<tfoot>
<tr>
<td>
Footer 1
</td>
<td>
Footer 2
</td>
</tr>
</tfoot>
</table>
  `,
  )
  assert(html.includes("<caption>"))
  assert(html.includes("Sample Table"))
  assert(html.includes("<colgroup>"))
  assert(html.includes("<thead>"))
  assert(html.includes("<tbody>"))
  assert(html.includes("<tfoot>"))
})

test("renders description list", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<dl>
<dt>
Term 1
</dt>
<dd>
Definition 1
</dd>
<dt>
Term 2
</dt>
<dd>
Definition 2
</dd>
</dl>
  `,
  )
  assert(html.includes("<dl>"))
  assert(html.includes("Term 1"))
  assert(html.includes("Definition 1"))
  assert(html.includes("Term 2"))
  assert(html.includes("Definition 2"))
})

test("mixes builtin tags with custom components", async () => {
  const { template } = await compile(__dirname)
  const CustomAlert = (props, children) => {
    const { Div } = require("../..")
    return Div({ class: "custom-alert" }, children)
  }

  const html = template(
    { components: { CustomAlert } },
    `
<div class="wrapper">
<CustomAlert>

This is a **custom** component

</CustomAlert>

<article>

Regular HTML with **prose** formatting

</article>
</div>
  `,
  )

  assert(html.includes('<div class="wrapper">'))
  assert(html.includes('<div class="custom-alert">'))
  assert(html.includes("<strong>custom</strong>"))
  assert(html.includes("<article>"))
  assert(html.includes("<strong>prose</strong>"))
})

test("builtin tags work with attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<div id="main" class="container" data-test="value">
<span style="color: red;">
Styled text
</span>
</div>
  `,
  )
  assert(html.includes('id="main"'))
  assert(html.includes('class="container"'))
  assert(html.includes('data-test="value"'))
  assert(html.includes('style="color: red;"'))
})

test("custom components can override builtin tags", async () => {
  const { template } = await compile(__dirname)
  const CustomDiv = (props, children) => {
    const { Div } = require("../..")
    return Div({ class: "custom-override", ...props }, children)
  }

  const html = template(
    { components: { div: CustomDiv } },
    `
<div>
Content
</div>
`,
  )

  assert(html.includes('<div class="custom-override">'))
  assert(html.includes("Content"))
})

// Single-line tag tests - ensure tags work on one line

test("renders single-line p tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>Hello world</p>")
  assert(html.includes("<p>Hello world</p>"))
})

test("renders single-line div tag with attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, '<div class="container">Content</div>')
  assert(html.includes('<div class="container">Content</div>'))
})

test("renders single-line tag with prose formatting", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>Hello **bold** world</p>")
  assert(html.includes("<p>Hello <strong>bold</strong> world</p>"))
})

test("renders single-line tag with inline code", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>Use the `console.log()` function</p>")
  assert(html.includes("<code>console.log()</code>"))
})

test("renders single-line tag with link", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>Visit [example](https://example.com)</p>")
  assert(html.includes('<a href="https://example.com">example</a>'))
})

test("renders multiple single-line tags", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>First</p>\n<p>Second</p>\n<p>Third</p>")
  assert(html.includes("<p>First</p>"))
  assert(html.includes("<p>Second</p>"))
  assert(html.includes("<p>Third</p>"))
})

test("renders single-line span tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, '<span class="highlight">Important</span>')
  assert(html.includes('<span class="highlight">Important</span>'))
})

test("renders single-line strong tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<strong>Bold text</strong>")
  assert(html.includes("<strong>Bold text</strong>"))
})

test("renders single-line em tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<em>Italic text</em>")
  assert(html.includes("<em>Italic text</em>"))
})

test("renders single-line small tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<small>Fine print</small>")
  assert(html.includes("<small>Fine print</small>"))
})

test("renders single-line mark tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<mark>Highlighted</mark>")
  assert(html.includes("<mark>Highlighted</mark>"))
})

test("renders single-line kbd tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<kbd>Ctrl+C</kbd>")
  assert(html.includes("<kbd>Ctrl+C</kbd>"))
})

test("renders single-line code tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<code>const x = 5;</code>")
  assert(html.includes("<code>const x = 5;</code>"))
})

test("renders single-line cite tag", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<cite>Book Title</cite>")
  assert(html.includes("<cite>Book Title</cite>"))
})

test("renders single-line abbr tag", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    '<abbr title="Hypertext Markup Language">HTML</abbr>',
  )
  assert(html.includes('<abbr title="Hypertext Markup Language">HTML</abbr>'))
})

test("mixes single-line and multi-line tags", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<article>

<p>Single line paragraph</p>

<div>
Multi-line div
</div>

<p>Another **single** line</p>

</article>
  `,
  )
  assert(html.includes("<article>"))
  assert(html.includes("<p>Single line paragraph</p>"))
  assert(html.includes("<div>"))
  assert(html.includes("Multi-line div"))
  assert(html.includes("<p>Another <strong>single</strong> line</p>"))
})

test("single-line tags work within prose content", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
# Heading

<p>This is a **single-line** paragraph</p>

Regular prose paragraph here.

<div class="box">Single-line div content</div>

- List item 1
- List item 2
  `,
  )
  assert(html.includes("<h1>Heading</h1>"))
  assert(
    html.includes("<p>This is a <strong>single-line</strong> paragraph</p>"),
  )
  assert(html.includes("Regular prose paragraph here"))
  assert(html.includes('<div class="box">Single-line div content</div>'))
  assert(html.includes("<li>List item 1</li>"))
})

test("single-line tag with nested HTML entities", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "<p>Price: &lt;span&gt;$10&lt;/span&gt;</p>")
  // HTML entities in content get double-escaped for security
  assert(
    html.includes("<p>Price: &amp;lt;span&amp;gt;$10&amp;lt;/span&amp;gt;</p>"),
  )
})

test("single-line custom component", async () => {
  const { template } = await compile(__dirname)
  const Alert = (props, children) => {
    const { Div } = require("../..")
    return Div({ class: "alert" }, children)
  }

  const html = template(
    { components: { Alert } },
    "<Alert>This is an alert message</Alert>",
  )
  assert(html.includes('<div class="alert">This is an alert message</div>'))
})

test("single-line builtin tag can override with custom component", async () => {
  const { template } = await compile(__dirname)
  const CustomP = (props, children) => {
    const { P } = require("../..")
    return P({ class: "custom-p", ...props }, children)
  }

  const html = template({ components: { p: CustomP } }, "<p>Content</p>")
  assert(html.includes('<p class="custom-p">Content</p>'))
})

// Security tests - ensure unsafe tags are NOT available as builtin components

test("script tag is not available as builtin component", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<script>
alert('xss')
</script>
  `,
  )
  // Script tag should be escaped/treated as text, not rendered as component
  assert(!html.includes("<script>"))
  assert(html.includes("&lt;"))
})

test("iframe tag is not available as builtin component", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<iframe src="evil.com">
</iframe>
  `,
  )
  // Iframe should be escaped/treated as text
  assert(!html.includes("<iframe"))
  assert(html.includes("&lt;"))
})

test("form tag is not available as builtin component", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<form>
<input type="text" />
</form>
  `,
  )
  // Form should be escaped/treated as text
  assert(!html.includes("<form"))
  assert(html.includes("&lt;"))
})

test("style tag is not available as builtin component", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<style>
body { background: red; }
</style>
  `,
  )
  // Style should be escaped/treated as text
  assert(!html.includes("<style>"))
  assert(html.includes("&lt;"))
})

// Real-world example test

test("renders a complete article with builtin tags and prose", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {},
    `
<article>
<header>
<h1>
Understanding Web Development
</h1>
<address>
<time datetime="2026-07-03">
July 3, 2026
</time>
</address>
</header>

<section>

## Introduction

Web development combines **HTML**, **CSS**, and **JavaScript** to create modern web applications.

<figure>
<img src="/images/web-dev.jpg" alt="Web Development" />
<figcaption>
The three pillars of web development
</figcaption>
</figure>

</section>

<section>

## Key Concepts

<dl>
<dt>
HTML
</dt>
<dd>
HyperText Markup Language - the structure of web pages
</dd>
<dt>
CSS
</dt>
<dd>
Cascading Style Sheets - the presentation layer
</dd>
<dt>
JavaScript
</dt>
<dd>
The programming language of the web
</dd>
</dl>

</section>

<section>

## Code Example

Here's a simple example:

<pre>
<code>
function hello() {
  console.log("Hello, World!");
}
</code>
</pre>

You can also use inline code like \`const x = 5;\`

</section>

<footer>
<small>
Copyright © 2026
</small>
</footer>

</article>
  `,
  )

  // Verify structure
  assert(html.includes("<article>"))
  assert(html.includes("<header>"))
  assert(html.includes("<h1>"))
  assert(html.includes("Understanding Web Development"))
  assert(html.includes('<time datetime="2026-07-03">'))
  assert(html.includes("<section>"))
  assert(html.includes("<h2>Introduction</h2>"))
  assert(html.includes("<strong>HTML</strong>"))
  assert(html.includes("<figure>"))
  assert(html.includes("<figcaption>"))
  assert(html.includes("<dl>"))
  assert(html.includes("<dt>"))
  assert(html.includes("<dd>"))
  assert(html.includes("<pre>"))
  assert(html.includes("<code>"))
  assert(html.includes("function hello()"))
  assert(html.includes("<footer>"))
  assert(html.includes("<small>"))
})

// Conditional rendering tests
test("renders content inside {#if} block when condition is truthy", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showImage}
![Featured Image](image.jpg)
{/if}
`
  const html = template({ data: { showImage: true } }, prose)
  assert(html.includes("<img"))
  assert(html.includes("image.jpg"))
})

test("removes content inside {#if} block when condition is falsy", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showImage}
![Featured Image](image.jpg)
{/if}
`
  const html = template({ data: { showImage: false } }, prose)
  assert(!html.includes("<img"))
  assert(!html.includes("image.jpg"))
})

test("removes content when condition is null", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if author}
By {author}
{/if}
`
  const html = template({ data: { author: null } }, prose)
  assert(!html.includes("By"))
})

test("removes content when condition is undefined", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if author}
By {author}
{/if}
`
  const html = template({ data: {} }, prose)
  assert(!html.includes("By"))
})

test("removes content when condition is empty string", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if title}
# {title}
{/if}
`
  const html = template({ data: { title: "" } }, prose)
  assert(!html.includes("<h1>"))
})

test("renders content when condition is 0 (falsy but keep for now)", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if count}
Count: {count}
{/if}
`
  const html = template({ data: { count: 0 } }, prose)
  // 0 is falsy in JavaScript
  assert(!html.includes("Count:"))
})

test("renders content when condition is non-empty string", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if title}
# {title}
{/if}
`
  const html = template({ data: { title: "Hello" } }, prose)
  assert(html.includes("<h1>Hello</h1>"))
})

test("renders content when condition is non-zero number", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if count}
You have {count} items
{/if}
`
  const html = template({ data: { count: 5 } }, prose)
  assert(html.includes("You have 5 items"))
})

test("handles multiple {#if} blocks", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showTitle}
# {title}
{/if}

{#if showAuthor}
By {author}
{/if}
`
  const html = template(
    {
      data: {
        showTitle: true,
        title: "Post",
        showAuthor: false,
        author: "John",
      },
    },
    prose,
  )
  assert(html.includes("<h1>Post</h1>"))
  assert(!html.includes("By"))
  assert(!html.includes("John"))
})

test("handles nested properties in condition", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if user.profile.avatar}
![Avatar]({user.profile.avatar})
{/if}
`
  const html = template(
    { data: { user: { profile: { avatar: "avatar.jpg" } } } },
    prose,
  )
  assert(html.includes("<img"))
  assert(html.includes("avatar.jpg"))
})

test("handles array index in condition", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if images[0]}
![First]({images[0]})
{/if}
`
  const html = template(
    { data: { images: ["first.jpg", "second.jpg"] } },
    prose,
  )
  assert(html.includes("<img"))
  assert(html.includes("first.jpg"))
})

test("handles {#if} with markdown content inside", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showContent}
## Heading

This is **bold** and *italic*.

- Item 1
- Item 2
{/if}
`
  const html = template({ data: { showContent: true } }, prose)
  assert(html.includes("<h2>Heading</h2>"))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
  assert(html.includes("<ul>"))
})

test("handles {#if} with custom components inside", async () => {
  const { template } = await compile(__dirname)
  const Alert = (props, children) => {
    return `<div class="alert">${children}</div>`
  }
  const prose = `
{#if showAlert}
<Alert>Warning message</Alert>
{/if}
`
  const html = template(
    { data: { showAlert: true }, components: { Alert } },
    prose,
  )
  assert(html.includes("alert"))
  assert(html.includes("Warning message"))
})

test("handles {#if} with variables inside", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showMessage}
Message: {message}
{/if}
`
  const html = template(
    { data: { showMessage: true, message: "Hello!" } },
    prose,
  )
  assert(html.includes("Message: Hello!"))
})

test("handles unclosed {#if} gracefully", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showContent}
This has no closing tag
`
  const html = template({ data: { showContent: true } }, prose)
  // Should render as-is if not properly closed
  assert(html.includes("This has no closing tag"))
})

test("handles {#if} with no data object", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showContent}
Content here
{/if}
`
  const html = template(prose)
  // Without data, condition is undefined, so content should be removed
  assert(!html.includes("Content here"))
})

// Comparison operator tests
test("handles {#if} with greater than operator", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if count > 5}
You have many items
{/if}
`
  const html = template({ data: { count: 10 } }, prose)
  assert(html.includes("You have many items"))
})

test("handles {#if} with less than operator", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if count < 5}
You have few items
{/if}
`
  const html = template({ data: { count: 3 } }, prose)
  assert(html.includes("You have few items"))
})

test("handles {#if} with array length comparison", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if tags.length > 0}
**Tags:** {tags[0]}, {tags[1]}
{/if}
`
  const html = template({ data: { tags: ["tutorial", "beginner"] } }, prose)
  assert(html.includes("<strong>Tags:</strong>"))
  assert(html.includes("tutorial"))
  assert(html.includes("beginner"))
})

test("handles {#if} with empty array length comparison", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if tags.length > 0}
**Tags:** {tags[0]}
{/if}
`
  const html = template({ data: { tags: [] } }, prose)
  assert(!html.includes("Tags:"))
})

test("handles {#if} with equals operator for strings", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if status == 'published'}
This post is live!
{/if}
`
  const html = template({ data: { status: "published" } }, prose)
  assert(html.includes("This post is live!"))
})

test("handles {#if} with not equals operator", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if status != 'draft'}
This is not a draft
{/if}
`
  const html = template({ data: { status: "published" } }, prose)
  assert(html.includes("This is not a draft"))
})

test("handles {#if} with greater than or equal operator", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if age >= 18}
You can vote
{/if}
`
  const html = template({ data: { age: 18 } }, prose)
  assert(html.includes("You can vote"))
})

test("handles {#if} comparing two variables", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if current > previous}
Value increased
{/if}
`
  const html = template({ data: { current: 100, previous: 50 } }, prose)
  assert(html.includes("Value increased"))
})

// {#else} tests
test("renders if content when condition is true with else", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if isPremium}
# Premium Content

Access exclusive features
{#else}
# Standard Content

Upgrade for more features
{/if}
`
  const html = template({ data: { isPremium: true } }, prose)
  assert(html.includes("<h1>Premium Content</h1>"))
  assert(html.includes("Access exclusive features"))
  assert(!html.includes("Standard Content"))
})

test("renders else content when condition is false", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if isPremium}
# Premium Content

Access exclusive features
{#else}
# Standard Content

Upgrade for more features
{/if}
`
  const html = template({ data: { isPremium: false } }, prose)
  assert(html.includes("<h1>Standard Content</h1>"))
  assert(html.includes("Upgrade for more features"))
  assert(!html.includes("Premium Content"))
})

test("handles else with comparison operators", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if age >= 18}
**Status:** Adult
{#else}
**Status:** Minor
{/if}
`
  const html1 = template({ data: { age: 21 } }, prose)
  assert(html1.includes("Adult"))
  assert(!html1.includes("Minor"))

  const html2 = template({ data: { age: 15 } }, prose)
  assert(html2.includes("Minor"))
  assert(!html2.includes("Adult"))
})

test("handles else with undefined variable", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if user}
Welcome back, {user}!
{#else}
Please log in to continue
{/if}
`
  const html = template({ data: {} }, prose)
  assert(html.includes("Please log in to continue"))
  assert(!html.includes("Welcome back"))
})

test("handles multiple if-else blocks", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if showTitle}
# {title}
{#else}
# Untitled Document
{/if}

{#if showAuthor}
By {author}
{#else}
Author unknown
{/if}
`
  const html = template(
    {
      data: {
        showTitle: true,
        title: "My Article",
        showAuthor: false,
        author: "John",
      },
    },
    prose,
  )
  assert(html.includes("<h1>My Article</h1>"))
  assert(html.includes("Author unknown"))
  assert(!html.includes("Untitled Document"))
  assert(!html.includes("By John"))
})

test("handles nested if-else blocks", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if userType == 'premium'}
**Premium User**
{#if verified}
✓ Verified
{#else}
⚠ Not verified
{/if}
{#else}
**Free User**
{/if}
`
  const html1 = template(
    { data: { userType: "premium", verified: true } },
    prose,
  )
  assert(html1.includes("Premium User"))
  assert(html1.includes("✓ Verified"))
  assert(!html1.includes("Not verified"))

  const html2 = template(
    { data: { userType: "premium", verified: false } },
    prose,
  )
  assert(html2.includes("Premium User"))
  assert(html2.includes("⚠ Not verified"))
  assert(!html2.includes("✓ Verified"))

  const html3 = template({ data: { userType: "free", verified: true } }, prose)
  assert(html3.includes("Free User"))
  assert(!html3.includes("Premium User"))
  assert(!html3.includes("Verified"))
})

test("handles else within loops", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
**{user.name}**

{#if user.email}
Email: {user.email}
{#else}
No email provided
{/if}

---

{/each}
`
  const html = template(
    {
      data: {
        users: [
          { name: "Alice", email: "alice@example.com" },
          { name: "Bob", email: "" },
          { name: "Charlie" },
        ],
      },
    },
    prose,
  )
  assert(html.includes("Alice"))
  assert(html.includes("alice@example.com"))
  assert(html.includes("Bob"))
  assert(html.includes("No email provided"))
  assert(html.includes("Charlie"))
  // Count "No email provided" occurrences (Bob and Charlie)
  const noEmailMatches = (html.match(/No email provided/g) || []).length
  assert(noEmailMatches === 2)
})

test("handles else with array length check", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if tags.length > 0}
**Tags:** {tags[0]}, {tags[1]}
{#else}
*No tags available*
{/if}
`
  const html1 = template({ data: { tags: ["tutorial", "beginner"] } }, prose)
  assert(html1.includes("Tags:"))
  assert(html1.includes("tutorial"))
  assert(!html1.includes("No tags available"))

  const html2 = template({ data: { tags: [] } }, prose)
  assert(html2.includes("No tags available"))
  assert(!html2.includes("Tags:"))
})

// Loop rendering tests
test("renders simple loop with {#each items}", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each items}
- {item}
{/each}
`
  const html = template(
    { data: { items: ["Apple", "Banana", "Cherry"] } },
    prose,
  )
  assert(html.includes("<li>Apple</li>"))
  assert(html.includes("<li>Banana</li>"))
  assert(html.includes("<li>Cherry</li>"))
})

test("renders loop with custom item name", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each fruits as fruit}
- {fruit}
{/each}
`
  const html = template({ data: { fruits: ["Apple", "Banana"] } }, prose)
  assert(html.includes("<li>Apple</li>"))
  assert(html.includes("<li>Banana</li>"))
})

test("renders loop with item and index", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each items as item, i}
Item {i}: {item}
{/each}
`
  const html = template(
    { data: { items: ["First", "Second", "Third"] } },
    prose,
  )
  assert(html.includes("Item 0: First"))
  assert(html.includes("Item 1: Second"))
  assert(html.includes("Item 2: Third"))
})

test("renders loop with object properties", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
**{user.name}** - {user.email}
{/each}
`
  const html = template(
    {
      data: {
        users: [
          { name: "Alice", email: "alice@example.com" },
          { name: "Bob", email: "bob@example.com" },
        ],
      },
    },
    prose,
  )
  assert(html.includes("<strong>Alice</strong>"))
  assert(html.includes("alice@example.com"))
  assert(html.includes("<strong>Bob</strong>"))
  assert(html.includes("bob@example.com"))
})

test("renders loop with headings", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each sections as section}
## {section.title}

{section.content}

{/each}
`
  const html = template(
    {
      data: {
        sections: [
          { title: "Introduction", content: "Welcome to the guide." },
          { title: "Conclusion", content: "Thank you for reading." },
        ],
      },
    },
    prose,
  )
  assert(html.includes("<h2>Introduction</h2>"))
  assert(html.includes("Welcome to the guide."))
  assert(html.includes("<h2>Conclusion</h2>"))
  assert(html.includes("Thank you for reading."))
})

test("handles empty array in loop", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each items}
- {item}
{/each}
`
  const html = template({ data: { items: [] } }, prose)
  // Should not include any list items
  assert(!html.includes("<li>"))
})

test("handles nested loops", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each categories as category}
### {category}

{#each items}
- {item}
{/each}

{/each}
`
  const html = template(
    {
      data: {
        categories: ["Fruits", "Vegetables"],
        items: ["Apple", "Carrot"],
      },
    },
    prose,
  )
  assert(html.includes("<h3>Fruits</h3>"))
  assert(html.includes("<h3>Vegetables</h3>"))
  // Items should be repeated for each category
  const appleMatches = (html.match(/Apple/g) || []).length
  assert(appleMatches === 2)
})

test("handles loops with markdown formatting", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each products as product}
**{product.name}**

Price: $\{product.price}

---

{/each}
`
  const html = template(
    {
      data: {
        products: [
          { name: "Widget", price: 10 },
          { name: "Gadget", price: 20 },
        ],
      },
    },
    prose,
  )
  assert(html.includes("<strong>Widget</strong>"))
  assert(html.includes("Price: $10"))
  assert(html.includes("<strong>Gadget</strong>"))
  assert(html.includes("Price: $20"))
  assert(html.includes("<hr>"))
})

test("handles loops combined with conditionals", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
**{user.name}**

{#if user.verified}
✓ Verified user
{/if}

{/each}
`
  const html = template(
    {
      data: {
        users: [
          { name: "Alice", verified: true },
          { name: "Bob", verified: false },
          { name: "Charlie", verified: true },
        ],
      },
    },
    prose,
  )
  assert(html.includes("<strong>Alice</strong>"))
  assert(html.includes("<strong>Bob</strong>"))
  assert(html.includes("<strong>Charlie</strong>"))
  // Only Alice and Charlie should have the verified badge
  const verifiedMatches = (html.match(/✓ Verified user/g) || []).length
  assert(verifiedMatches === 2)
})

test("handles loop with nested property access", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
- {user.profile.name} ({user.profile.role})
{/each}
`
  const html = template(
    {
      data: {
        users: [
          { profile: { name: "Alice", role: "Admin" } },
          { profile: { name: "Bob", role: "User" } },
        ],
      },
    },
    prose,
  )
  assert(html.includes("Alice (Admin)"))
  assert(html.includes("Bob (User)"))
})

test("handles loop with array property access", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
- {user.name}: {user.tags[0]}, {user.tags[1]}
{/each}
`
  const html = template(
    {
      data: {
        users: [
          { name: "Alice", tags: ["developer", "designer"] },
          { name: "Bob", tags: ["manager", "analyst"] },
        ],
      },
    },
    prose,
  )
  assert(html.includes("Alice: developer, designer"))
  assert(html.includes("Bob: manager, analyst"))
})

test("handles loop accessing external data variables", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each items as item}
- {prefix}{item}{suffix}
{/each}
`
  const html = template(
    {
      data: {
        items: ["A", "B", "C"],
        prefix: ">>",
        suffix: "<<",
      },
    },
    prose,
  )
  // HTML entities are encoded
  assert(html.includes("&gt;&gt;A&lt;&lt;"))
  assert(html.includes("&gt;&gt;B&lt;&lt;"))
  assert(html.includes("&gt;&gt;C&lt;&lt;"))
})

test("handles multiple separate loops", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Fruits

{#each fruits}
- {item}
{/each}

# Vegetables

{#each vegetables}
- {item}
{/each}
`
  const html = template(
    {
      data: {
        fruits: ["Apple", "Banana"],
        vegetables: ["Carrot", "Broccoli"],
      },
    },
    prose,
  )
  assert(html.includes("<h1>Fruits</h1>"))
  assert(html.includes("Apple"))
  assert(html.includes("Banana"))
  assert(html.includes("<h1>Vegetables</h1>"))
  assert(html.includes("Carrot"))
  assert(html.includes("Broccoli"))
})

// Negation tests
test("handles negation with ! operator", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if !hidden}
This content is visible
{/if}
`
  const html = template({ data: { hidden: false } }, prose)
  assert(html.includes("This content is visible"))
})

test("handles negation with ! operator (false case)", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if !visible}
This should not appear
{/if}
`
  const html = template({ data: { visible: true } }, prose)
  assert(!html.includes("This should not appear"))
})

test("handles negation with nested property", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if !user.verified}
**Please verify your email**
{/if}
`
  const html = template({ data: { user: { verified: false } } }, prose)
  assert(html.includes("<strong>Please verify your email</strong>"))
})

test("handles negation with comparison", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if !count > 0}
Your cart is empty
{/if}
`
  const html = template({ data: { count: 0 } }, prose)
  assert(html.includes("Your cart is empty"))
})

test("handles negation with else block", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if !premium}
## Free Plan

Limited features
{#else}
## Premium Plan

All features unlocked
{/if}
`
  const html1 = template({ data: { premium: false } }, prose)
  assert(html1.includes("<h2>Free Plan</h2>"))
  assert(html1.includes("Limited features"))

  const html2 = template({ data: { premium: true } }, prose)
  assert(html2.includes("<h2>Premium Plan</h2>"))
  assert(html2.includes("All features unlocked"))
})

// Elseif tests
test("handles simple {#elseif} block", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if score >= 90}
Grade: **A**
{#elseif score >= 80}
Grade: **B**
{#elseif score >= 70}
Grade: **C**
{#else}
Grade: **F**
{/if}
`
  const html = template({ data: { score: 85 } }, prose)
  assert(html.includes("Grade: <strong>B</strong>"))
  assert(!html.includes("Grade: <strong>A</strong>"))
  assert(!html.includes("Grade: <strong>C</strong>"))
})

test("handles {#elseif} with multiple conditions", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if role == 'admin'}
# Admin Dashboard

Welcome, administrator!
{#elseif role == 'moderator'}
# Moderator Panel

Welcome, moderator!
{#elseif role == 'user'}
# User Profile

Welcome, user!
{#else}
# Guest Access

Please log in.
{/if}
`
  const html = template({ data: { role: "moderator" } }, prose)
  assert(html.includes("<h1>Moderator Panel</h1>"))
  assert(html.includes("Welcome, moderator!"))
  assert(!html.includes("Admin"))
  assert(!html.includes("User Profile"))
})

test("handles {#elseif} without final {#else}", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if temperature > 30}
Hot weather
{#elseif temperature > 20}
Warm weather
{#elseif temperature > 10}
Cool weather
{/if}

Stay hydrated!
`
  const html1 = template({ data: { temperature: 25 } }, prose)
  assert(html1.includes("Warm weather"))
  assert(!html1.includes("Hot weather"))

  const html2 = template({ data: { temperature: 5 } }, prose)
  assert(!html2.includes("Hot weather"))
  assert(!html2.includes("Warm"))
  assert(!html2.includes("Cool"))
  assert(html2.includes("Stay hydrated!"))
})

test("handles {#elseif} with string comparisons", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if status == 'published'}
**Status:** Published
{#elseif status == 'draft'}
**Status:** Draft
{#elseif status == 'archived'}
**Status:** Archived
{#else}
**Status:** Unknown
{/if}
`
  const html = template({ data: { status: "draft" } }, prose)
  assert(html.includes("<strong>Status:</strong> Draft"))
})

test("handles {#elseif} with negation", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if active}
Account is active
{#elseif !suspended}
Account is inactive
{#else}
Account is suspended
{/if}
`
  const html = template({ data: { active: false, suspended: false } }, prose)
  assert(html.includes("Account is inactive"))
})

test("handles {#elseif} with nested conditionals", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if level > 10}
Expert level
{#elseif level > 5}
Intermediate level

{#if hasBonus}
*Bonus unlocked!*
{/if}
{#else}
Beginner level
{/if}
`
  const html = template({ data: { level: 7, hasBonus: true } }, prose)
  assert(html.includes("Intermediate level"))
  assert(html.includes("<em>Bonus unlocked!</em>"))
})

test("handles {#elseif} with array length checks", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#if items.length > 10}
You have many items
{#elseif items.length > 0}
You have some items
{#else}
Your cart is empty
{/if}
`
  const html = template({ data: { items: [1, 2, 3] } }, prose)
  assert(html.includes("You have some items"))
  assert(!html.includes("many items"))
  assert(!html.includes("cart is empty"))
})

test("handles {#elseif} in blog post scenario", async () => {
  const { template } = await compile(__dirname)
  const prose = `
# Blog Post

{#if publishedAt}
*Published on {publishedAt}*
{#elseif scheduledAt}
*Scheduled for {scheduledAt}*
{#else}
*Draft - not published*
{/if}

## Content

This is the blog post content.
`
  const html = template({ data: { scheduledAt: "2026-07-10" } }, prose)
  assert(html.includes("<em>Scheduled for 2026-07-10</em>"))
  assert(!html.includes("Published on"))
  assert(!html.includes("Draft"))
})

test("handles multiple {#elseif} chains in same content", async () => {
  const { template } = await compile(__dirname)
  const prose = `
## Weather

{#if temp > 30}
Hot
{#elseif temp > 20}
Warm
{#else}
Cool
{/if}

## Wind

{#if wind > 20}
Windy
{#elseif wind > 10}
Breezy
{#else}
Calm
{/if}
`
  const html = template({ data: { temp: 25, wind: 15 } }, prose)
  assert(html.includes("Warm"))
  assert(html.includes("Breezy"))
})

test("handles {#elseif} with custom components", async () => {
  const { template } = await compile(__dirname)
  const { Div } = require("../..")
  const Alert = (props, children) => {
    const type = (props && props.type) || "info"
    return Div({ class: `alert alert-${type}` }, children)
  }

  const prose = `
{#if severity == 'error'}
<Alert type="danger">Critical error occurred!</Alert>
{#elseif severity == 'warning'}
<Alert type="warning">Warning message</Alert>
{#else}
<Alert type="info">Information message</Alert>
{/if}
`
  const html = template(
    { data: { severity: "warning" }, components: { Alert } },
    prose,
  )
  assert(html.includes("alert-warning"))
  assert(html.includes("Warning message"))
})

test("handles {#elseif} with loops", async () => {
  const { template } = await compile(__dirname)
  const prose = `
{#each users as user}
**{user.name}**

{#if user.role == 'admin'}
- Administrator
{#elseif user.role == 'moderator'}
- Moderator
{#else}
- Regular user
{/if}

---
{/each}
`
  const html = template(
    {
      data: {
        users: [
          { name: "Alice", role: "admin" },
          { name: "Bob", role: "moderator" },
          { name: "Charlie", role: "user" },
        ],
      },
    },
    prose,
  )
  assert(html.includes("<strong>Alice</strong>"))
  assert(html.includes("Administrator"))
  assert(html.includes("<strong>Bob</strong>"))
  assert(html.includes("Moderator"))
  assert(html.includes("<strong>Charlie</strong>"))
  assert(html.includes("Regular user"))
})
