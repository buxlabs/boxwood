# Markdown Component

The `Markdown` component provides pure markdown rendering without any templating features. It's a simple, focused component for rendering static markdown content.

## Features

- Headings (`#`, `##`, etc.)
- Paragraphs
- Lists (ordered and unordered)
- Links and images
- Code blocks with syntax highlighting support
- Bold and italic text
- Inline code
- Blockquotes
- Horizontal rules

## Usage

```javascript
const { Markdown } = require("boxwood/ui")

Markdown(`
# Hello World

This is **bold** and this is *italic*.

- First item
- Second item
- Third item

[Link text](https://example.com)

\`\`\`javascript
console.log('Hello')
\`\`\`
`)
```

## When to Use

Use `Markdown` when you need:

- Simple, static markdown rendering
- No variables or templating
- Fast, predictable output
- Standard markdown behavior

For dynamic content with variables and custom components, use the `Prose` component instead.
