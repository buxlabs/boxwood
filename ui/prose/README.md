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
- **Conditionals**: `{#if variable}...{/if}` blocks for conditional rendering
- **Custom components**: `<Alert type="warning">...</Alert>`
- **Builtin HTML tags**: `<article>`, `<section>`, `<div>`, etc.

### Planned Features

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

// With conditionals
Prose(
  { data: { image: "hero.jpg", showAuthor: true, author: "Jane" } },
  `
{#if image}
![Featured Image]({image})
{/if}

# My Blog Post

{#if showAuthor}
Written by {author}
{/if}
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

// Blog post example
Prose(
  {
    data: {
      title: "Getting Started",
      author: "Alice",
      bio: "Software Engineer",
      image: "cover.jpg",
      tags: ["tutorial", "beginner"],
    },
  },
  `
# {title}

{#if image}
![Cover]({image})
{/if}

{#if bio}
**About the author:** {bio}
{/if}

{#if tags.length > 0}
**Tags:** {tags[0]}, {tags[1]}
{/if}
`,
)
```

## Conditional Rendering

Use `{#if}` blocks to conditionally render content based on data:

```markdown
{#if premium}
Access premium content here
{/if}

{#if items[0]}
First item: {items[0].name}
{/if}
```

### Comparison Operators

You can use comparison operators in conditions:

```markdown
{#if tags.length > 0}
**Tags:** {tags[0]}, {tags[1]}
{/if}

{#if age >= 18}
You can vote
{/if}

{#if count < 10}
Limited quantity remaining
{/if}

{#if status == 'published'}
This post is live
{/if}

{#if temperature != 0}
Temperature: {temperature}°C
{/if}
```

Supported operators:

- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `==` - Equals
- `!=` - Not equals

You can compare with:

- **Numbers**: `{#if count > 5}`
- **Strings**: `{#if status == 'active'}` or `{#if status == "active"}`
- **Booleans**: `{#if verified == true}`
- **Variables**: `{#if current > previous}`

### Simple Conditions

Conditions support:

- Simple variables: `{#if show}`
- Nested properties: `{#if user.verified}`
- Array indexing: `{#if images[0]}`

Falsy values (removes content):

- `null`, `undefined`
- `false`
- `0`
- `""` (empty string)
- `[]` (empty array)

## Difference from Markdown Component

- **Markdown**: Pure markdown rendering, no variables or custom components
- **Prose**: Markdown + templating (variables, custom components, conditionals)

Use `Markdown` for simple, static content. Use `Prose` for dynamic content in blogs, CMS, or documentation systems.
