# Prose Component

The `Prose` component is an enhanced content component for blog systems, documentation, and other content-heavy use cases. It extends basic markdown with templating features.

## Features

### Markdown Support

All standard markdown features:

- Headings (`#`, `##`, etc.)
- Lists (ordered and unordered)
- Links and images
- Code blocks
- Bold, italic, and inline code
- Blockquotes
- Horizontal rules

### Templating Features

- **Variable replacement**: `{variable}`, `{user.name}`, `{images[0].src}`
- **Custom components**: `<Alert type="warning">...</Alert>`
- **Builtin HTML tags**: `<article>`, `<section>`, `<div>`, etc.

### Planned Features

- **Conditionals**: `{#if variable}...{/if}` blocks for conditional rendering
- **Loops**: `{#each items}...{/each}` for iteration

## Usage

```javascript
const { Prose } = require("boxwood/ui")

// Basic usage with variables
Prose(
  { data: { title: "Hello", author: "John" } },
  `
# {title}

Written by {author}
`,
)

// With custom components
Prose(
  {
    data: { message: "Important!" },
    components: { Alert },
  },
  `
<Alert type="warning">{message}</Alert>
`,
)
```

## Difference from Markdown Component

- **Markdown**: Pure markdown rendering, no variables or custom components
- **Prose**: Markdown + templating (variables, custom components, conditionals)

Use `Markdown` for simple, static content. Use `Prose` for dynamic content in blogs, CMS, or documentation systems.
