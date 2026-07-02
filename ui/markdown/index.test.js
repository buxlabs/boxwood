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
  const markdown = `
- First item
- Second item
- Third item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders unordered list with em dash", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
— First item
— Second item
— Third item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders mixed content with lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
# Shopping List

Here are the items:

- Apples
- Bananas
- Oranges

That's all!
  `
  const html = template(markdown)
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
  const markdown = `
- Item one
- Item two

## Next Section
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item one</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<h2>Next Section</h2>"))
})

test("handles both dash types in same list", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Regular dash
— Em dash
– En dash
• Bullet
- Regular again
  `
  const html = template(markdown)
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
  const markdown = `
1. First item
2. Second item
3. Third item
  `
  const html = template(markdown)
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ol>"))
})

test("renders mixed unordered and ordered lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
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
  const html = template(markdown)
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
  const markdown = `
1. First ordered
2. Second ordered
- First unordered
- Second unordered
  `
  const html = template(markdown)
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
  const markdown = `
- Item with content
- 
• 
- Another item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item with content</li>"))
  assert(html.includes("<li>Another item</li>"))
  assert(!html.includes("<li></li>"))
})

test("handles array of markdown strings", async () => {
  const { template } = await compile(__dirname)
  const markdown = ["# First", "# Second"]
  const html = template(markdown)
  assert(html.includes("<h1>First</h1>"))
  assert(html.includes("<h1>Second</h1>"))
})

test("groups consecutive blockquotes", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
> First line
> Second line
> Third line

Regular paragraph
  `
  const html = template(markdown)
  assert(html.includes("<blockquote>"))
  assert(html.includes("<p>First line\nSecond line\nThird line</p>"))
  assert(html.includes("</blockquote>"))
  assert(html.includes("Regular paragraph"))
  const blockquoteCount = (html.match(/<blockquote>/g) || []).length
  assert.strictEqual(blockquoteCount, 1)
})

test("renders bold text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is **bold** text"
  const html = template(markdown)
  assert(html.includes("<p>This is <strong>bold</strong> text</p>"))
})

test("renders italic text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is *italic* text"
  const html = template(markdown)
  assert(html.includes("<p>This is <em>italic</em> text</p>"))
})

test("renders bold and italic together", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**bold** and *italic* text"
  const html = template(markdown)
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders inline markdown in headings", async () => {
  const { template } = await compile(__dirname)
  const markdown = "# Heading with **bold**"
  const html = template(markdown)
  assert(html.includes("<h1>Heading with <strong>bold</strong></h1>"))
})

test("renders inline markdown in lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with **bold**
- Item with *italic*
  `
  const html = template(markdown)
  assert(html.includes("<li>Item with <strong>bold</strong></li>"))
  assert(html.includes("<li>Item with <em>italic</em></li>"))
})

test("renders inline code with backticks", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is `inline code` in a sentence."
  const html = template(markdown)
  assert(html.includes("<code>inline code</code>"))
  assert(html.includes("This is "))
  assert(html.includes(" in a sentence."))
})

test("renders inline code mixed with bold and italic", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Mix `code` and **bold** and *italic* together."
  const html = template(markdown)
  assert(html.includes("<code>code</code>"))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders nested ordered list with unordered list", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
1. hello
  - world
2. what happened
  `
  const html = template(markdown)

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
  const markdown = `
- First item
  1. Nested one
  2. Nested two
- Second item
  `
  const html = template(markdown)

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
  const markdown = `
1. First
  - Nested A
  - Nested B
2. Second
  - Nested C
  `
  const html = template(markdown)

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
  const markdown = `
1. Level 1
  - Level 2
    1. Level 3
  `
  const html = template(markdown)

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
  const markdown = `
# Title

Some text

1. First item
  - Nested bullet
  - Another bullet
2. Second item

More text
  `
  const html = template(markdown)

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

test("renders markdown links", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[some test](/some-link)"
  const html = template(markdown)
  assert(html.includes('<a href="/some-link">some test</a>'))
})

test("renders multiple links in same paragraph", async () => {
  const { template } = await compile(__dirname)
  const markdown =
    "Check out [Google](https://google.com) and [GitHub](https://github.com)"
  const html = template(markdown)
  assert(html.includes('<a href="https://google.com">Google</a>'))
  assert(html.includes('<a href="https://github.com">GitHub</a>'))
})

test("renders links in headings", async () => {
  const { template } = await compile(__dirname)
  const markdown = "# Heading with [link](/url)"
  const html = template(markdown)
  assert(html.includes('<h1>Heading with <a href="/url">link</a></h1>'))
})

test("renders links in list items", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with [link](/url)
- Another [item](/path) here
  `
  const html = template(markdown)
  assert(html.includes('<li>Item with <a href="/url">link</a></li>'))
  assert(html.includes('<li>Another <a href="/path">item</a> here</li>'))
})

test("renders links mixed with bold and italic", async () => {
  const { template } = await compile(__dirname)
  const markdown =
    "Visit **bold [link](https://example.com)** or *italic [link](/path)*"
  const html = template(markdown)
  assert(html.includes('<a href="https://example.com">link</a>'))
  assert(html.includes('<a href="/path">link</a>'))
  assert(html.includes("<strong>"))
  assert(html.includes("<em>"))
})

test("handles invalid link syntax", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[text without closing paren](/url or [incomplete"
  const html = template(markdown)
  // Should render as plain text when link syntax is invalid
  assert(html.includes("[text without closing paren](/url"))
  assert(html.includes("[incomplete"))
})

test("renders links with bold and italic inside link text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[**bold** and *italic*](/url)"
  const html = template(markdown)
  assert(html.includes('<a href="/url">'))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
  assert(html.includes("</a>"))
})

test("renders horizontal rule with dashes", async () => {
  const { template } = await compile(__dirname)
  const markdown = "---"
  const html = template(markdown)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with asterisks", async () => {
  const { template } = await compile(__dirname)
  const markdown = "***"
  const html = template(markdown)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with underscores", async () => {
  const { template } = await compile(__dirname)
  const markdown = "___"
  const html = template(markdown)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with spaces", async () => {
  const { template } = await compile(__dirname)
  const markdown = "* * *"
  const html = template(markdown)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule with many characters", async () => {
  const { template } = await compile(__dirname)
  const markdown = "-------"
  const html = template(markdown)
  assert(html.includes("<hr>"))
})

test("renders horizontal rule between paragraphs", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
First paragraph

---

Second paragraph
  `
  const html = template(markdown)
  assert(html.includes("<p>First paragraph</p>"))
  assert(html.includes("<hr>"))
  assert(html.includes("<p>Second paragraph</p>"))
})

test("renders multiple horizontal rules", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
Section 1

---

Section 2

***

Section 3
  `
  const html = template(markdown)
  const hrCount = (html.match(/<hr>/g) || []).length
  assert.strictEqual(hrCount, 2, "Should have exactly two <hr> tags")
  assert(html.includes("<p>Section 1</p>"))
  assert(html.includes("<p>Section 2</p>"))
  assert(html.includes("<p>Section 3</p>"))
})

test("renders basic image", async () => {
  const { template } = await compile(__dirname)
  const markdown = "![alt text](/image.png)"
  const html = template(markdown)
  assert(html.includes('<img src="/image.png" alt="alt text">'))
})

test("renders image without alt text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "![](/image.jpg)"
  const html = template(markdown)
  assert(html.includes('<img src="/image.jpg" alt="">'))
})

test("renders multiple images in paragraph", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Look at ![first](/1.png) and ![second](/2.png)"
  const html = template(markdown)
  assert(html.includes('<img src="/1.png" alt="first">'))
  assert(html.includes('<img src="/2.png" alt="second">'))
})

test("renders images in headings", async () => {
  const { template } = await compile(__dirname)
  const markdown = "# Heading with ![icon](/icon.svg)"
  const html = template(markdown)
  assert(html.includes("<h1>"))
  assert(html.includes('<img src="/icon.svg" alt="icon">'))
  assert(html.includes("</h1>"))
})

test("renders images in list items", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with ![image](/img.png)
- Another ![pic](/pic.jpg) here
  `
  const html = template(markdown)
  assert(html.includes('<li>Item with <img src="/img.png" alt="image"></li>'))
  assert(html.includes('<li>Another <img src="/pic.jpg" alt="pic"> here</li>'))
})

test("renders image with URL containing special characters", async () => {
  const { template } = await compile(__dirname)
  const markdown = "![logo](https://example.com/images/logo.png)"
  const html = template(markdown)
  assert(
    html.includes('<img src="https://example.com/images/logo.png" alt="logo">'),
  )
})

test("handles invalid image syntax", async () => {
  const { template } = await compile(__dirname)
  const markdown = "![alt text without closing paren(/url or ![incomplete"
  const html = template(markdown)
  // Should render as plain text when image syntax is invalid
  assert(html.includes("![alt text without closing paren(/url"))
  assert(html.includes("![incomplete"))
})

test("distinguishes between images and links", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is a [link](/url) and this is an ![image](/img.png)"
  const html = template(markdown)
  assert(html.includes('<a href="/url">link</a>'))
  assert(html.includes('<img src="/img.png" alt="image">'))
})

test("renders image inside link", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[![alt text](/image.png)](/link)"
  const html = template(markdown)
  assert(html.includes('<a href="/link">'))
  assert(html.includes('<img src="/image.png" alt="alt text">'))
  assert(html.includes("</a>"))
})

test("renders image inside link with surrounding text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Click [![icon](/icon.png)](/home) to go home"
  const html = template(markdown)
  assert(html.includes('<a href="/home">'))
  assert(html.includes('<img src="/icon.png" alt="icon">'))
  assert(html.includes("</a>"))
})

test("renders multiple images inside links", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[![first](/1.png)](/url1) and [![second](/2.png)](/url2)"
  const html = template(markdown)
  assert(html.includes('<a href="/url1"><img src="/1.png" alt="first"></a>'))
  assert(html.includes('<a href="/url2"><img src="/2.png" alt="second"></a>'))
})

test("renders link with image and text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[Click ![icon](/icon.png) here](/url)"
  const html = template(markdown)
  assert(html.includes('<a href="/url">'))
  assert(html.includes("Click "))
  assert(html.includes('<img src="/icon.png" alt="icon">'))
  assert(html.includes(" here"))
  assert(html.includes("</a>"))
})

test("renders basic code block", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
\`\`\`
const x = 1
console.log(x)
\`\`\`
  `
  const html = template(markdown)
  assert(html.includes("<pre>"))
  assert(html.includes("<code>"))
  assert(html.includes("const x = 1"))
  assert(html.includes("console.log(x)"))
  assert(html.includes("</code>"))
  assert(html.includes("</pre>"))
})

test("renders code block with language", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
\`\`\`javascript
function hello() {
  return "world"
}
\`\`\`
  `
  const html = template(markdown)
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
  const markdown = `
\`\`\`
line 1

line 3
\`\`\`
  `
  const html = template(markdown)
  assert(html.includes("line 1"))
  assert(html.includes("line 3"))
  // Empty line should be preserved
  assert(html.includes("line 1\n\nline 3"))
})

test("renders multiple code blocks", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
\`\`\`javascript
const x = 1
\`\`\`

Some text

\`\`\`python
y = 2
\`\`\`
  `
  const html = template(markdown)
  const preCount = (html.match(/<pre>/g) || []).length
  assert.strictEqual(preCount, 2)
  assert(html.includes('class="language-javascript"'))
  assert(html.includes('class="language-python"'))
})

test("renders code block between other content", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
# Title

Some paragraph text

\`\`\`
code here
\`\`\`

More text
  `
  const html = template(markdown)
  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes("<p>Some paragraph text</p>"))
  assert(html.includes("<pre>"))
  assert(html.includes("code here"))
  assert(html.includes("<p>More text</p>"))
})

test("handles code block with special markdown characters", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
\`\`\`
**not bold**
*not italic*
[not a link](url)
\`\`\`
  `
  const html = template(markdown)
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
  const markdown = `
\`\`\`
code without closing
more code
  `
  const html = template(markdown)
  // Should still create a code block with all remaining content
  assert(html.includes("<pre>"))
  assert(html.includes("code without closing"))
  assert(html.includes("more code"))
})

test("handles code block with indentation preserved", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
\`\`\`
function test() {
  if (true) {
    return 1
  }
}
\`\`\`
  `
  const html = template(markdown)
  assert(html.includes("function test()"))
  assert(html.includes("  if (true)"))
  assert(html.includes("    return 1"))
})

test("renders autolink with angle brackets (URL)", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Visit <https://example.com> for more"
  const html = template(markdown)
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
})

test("renders autolink with angle brackets (email)", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Contact <user@example.com> for help"
  const html = template(markdown)
  assert(
    html.includes('<a href="mailto:user@example.com">user@example.com</a>'),
  )
})

test("renders multiple autolinks", async () => {
  const { template } = await compile(__dirname)
  const markdown = "See <https://a.com> and <https://b.com>"
  const html = template(markdown)
  assert(html.includes('<a href="https://a.com">https://a.com</a>'))
  assert(html.includes('<a href="https://b.com">https://b.com</a>'))
})

test("renders autolinks in lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Check <https://example.com>
- Email <admin@example.com>
  `
  const html = template(markdown)
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
  assert(
    html.includes('<a href="mailto:admin@example.com">admin@example.com</a>'),
  )
})

test("renders autolinks with http protocol", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Visit <http://example.com>"
  const html = template(markdown)
  assert(html.includes('<a href="http://example.com">http://example.com</a>'))
})

test("handles invalid autolink syntax", async () => {
  const { template } = await compile(__dirname)
  const markdown = "<not a url or email>"
  const html = template(markdown)
  // Should be treated as plain text and HTML-escaped
  assert(html.includes("&lt;not a url or email&gt;"))
})

test("renders autolinks mixed with other formatting", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**Important**: visit <https://example.com> for **details**"
  const html = template(markdown)
  assert(html.includes("<strong>Important</strong>"))
  assert(html.includes('<a href="https://example.com">https://example.com</a>'))
  assert(html.includes("<strong>details</strong>"))
})

test("escapes asterisks with backslash", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is \\*not bold\\*"
  const html = template(markdown)
  assert(html.includes("<p>This is *not bold*</p>"))
  assert(!html.includes("<strong>"))
})

test("escapes brackets with backslash", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is \\[not a link\\](url)"
  const html = template(markdown)
  assert(html.includes("[not a link](url)"))
  assert(!html.includes("<a "))
})

test("escapes backticks with backslash", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is \\`not code\\`"
  const html = template(markdown)
  assert(html.includes("`not code`"))
  assert(!html.includes("<code>"))
})

test("escapes backslash itself", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is a backslash: \\\\"
  const html = template(markdown)
  assert(html.includes("backslash: \\"))
})

test("escapes exclamation mark for images", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is \\!\\[not an image\\](url)"
  const html = template(markdown)
  assert(html.includes("![not an image](url)"))
  assert(!html.includes("<img"))
  assert(!html.includes("<a "))
})

test("escapes angle brackets for autolinks", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is \\<not an autolink\\>"
  const html = template(markdown)
  // Angle brackets are HTML-escaped in output
  assert(
    html.includes("&lt;not an autolink&gt;") ||
      html.includes("<not an autolink>"),
  )
  assert(!html.includes("<a href"))
})

test("handles mixed escaped and unescaped formatting", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**bold** and \\*not bold\\* and **more bold**"
  const html = template(markdown)
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("*not bold*"))
  assert(html.includes("<strong>more bold</strong>"))
})

test("escapes only special markdown characters", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Normal backslash\\n should stay"
  const html = template(markdown)
  // \n is not a special markdown char, so backslash should remain
  assert(html.includes("backslash\\n"))
})

test("handles escape at end of string", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Text ends with \\"
  const html = template(markdown)
  assert(html.includes("ends with \\"))
})

test("escapes parentheses", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[link]\\(not url\\)"
  const html = template(markdown)
  assert(html.includes("[link](not url)"))
  assert(!html.includes("<a "))
})

test("escapes in lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with \\*escaped asterisks\\*
- Item with \\[escaped brackets\\]
  `
  const html = template(markdown)
  assert(html.includes("<li>Item with *escaped asterisks*</li>"))
  assert(html.includes("<li>Item with [escaped brackets]</li>"))
})

test("escapes in headings", async () => {
  const { template } = await compile(__dirname)
  const markdown = "# Heading with \\*escaped\\* text"
  const html = template(markdown)
  assert(html.includes("<h1>Heading with *escaped* text</h1>"))
  assert(!html.includes("<strong>"))
})

// Regression tests - escapes work correctly with all markdown features

test("bold with escaped asterisk inside still renders bold", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**bold \\* text**"
  const html = template(markdown)
  assert(html.includes("<strong>"))
  assert(html.includes("*"))
  assert(!html.includes("\\"))
})

test("link with escaped bracket in text still renders link", async () => {
  const { template } = await compile(__dirname)
  const markdown = "[link \\[ text](https://example.com)"
  const html = template(markdown)
  assert(html.includes('<a href="https://example.com">'))
  assert(html.includes("["))
  assert(!html.includes("\\"))
})

test("escaped opening bracket prevents link formation", async () => {
  const { template } = await compile(__dirname)
  const markdown = "\\[not a link](url)"
  const html = template(markdown)
  assert(html.includes("[not a link](url)"))
  assert(!html.includes("<a"))
})

test("escaped exclamation with following link creates link not image", async () => {
  const { template } = await compile(__dirname)
  const markdown = "\\![text](url)"
  const html = template(markdown)
  assert(html.includes("!"))
  assert(html.includes('<a href="url">'))
  assert(!html.includes("<img"))
})

test("escapes work in lists without breaking list rendering", async () => {
  const { template } = await compile(__dirname)
  const markdown = "- Item \\*one\\*\n- Item **two**"
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item *one*</li>"))
  assert(html.includes("<strong>two</strong>"))
})

test("escapes work in blockquotes without breaking blockquote", async () => {
  const { template } = await compile(__dirname)
  const markdown = "> Quote \\*with\\* asterisks"
  const html = template(markdown)
  assert(html.includes("<blockquote>"))
  assert(html.includes("*with*"))
  assert(!html.includes("<em>"))
})

test("multiple escapes across paragraphs don't interfere", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Para \\*one\\*\n\nPara **two**"
  const html = template(markdown)
  assert(html.includes("*one*"))
  assert(html.includes("<strong>two</strong>"))
})

test("escaped backslash before markdown character", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Text \\\\*italic*"
  const html = template(markdown)
  assert(html.includes("\\"))
  assert(html.includes("<em>italic</em>"))
})

test("code blocks preserve backslashes", async () => {
  const { template } = await compile(__dirname)
  const markdown = "```\ncode \\* with \\[ escapes\n```"
  const html = template(markdown)
  assert(html.includes("<pre>"))
  assert(html.includes("\\*"))
  assert(html.includes("\\["))
})

test("nested markdown with escapes - bold link with escaped bracket", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**[link \\] text](url)**"
  const html = template(markdown)
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

test("renders custom component with markdown in children", async () => {
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

test("renders custom component with nested markdown", async () => {
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
  const html = template({}, "# Title\n\nRegular markdown content")
  
  assert(html.includes("<h1>Title</h1>"))
  assert(html.includes("Regular markdown content"))
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
