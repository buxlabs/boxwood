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
- **Loops**: `{#each items}...{/each}` for iteration over arrays
- **Custom components**: `<Alert type="warning">...</Alert>`
- **Builtin HTML tags**: `<article>`, `<section>`, `<div>`, etc.

### Planned Features

None at the moment - all core features are implemented!

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

### Else Blocks

Use `{#else}` to provide alternative content when a condition is false:

```markdown
{#if isPremium}
**Premium Content**

Access exclusive features
{#else}
**Standard Content**

Upgrade for more features
{/if}
```

```markdown
{#if age >= 18}
You can vote
{#else}
You cannot vote yet
{/if}
```

```markdown
{#if items.length > 0}
You have {items.length} items
{#else}
Your cart is empty
{/if}
```

Else blocks work with all conditional features:

- Simple conditions: `{#if show}...{#else}...{/if}`
- Comparison operators: `{#if count > 5}...{#else}...{/if}`
- Nested conditions: `{#if outer}{#if inner}...{#else}...{/if}{#else}...{/if}`
- Inside loops: Conditionally render content for each item

## Loops

Use `{#each}` blocks to iterate over arrays and render content for each item:

### Basic Loop Syntax

```markdown
{#each items}

- {item}
  {/each}
```

By default, the current item is available as `{item}`. For arrays of primitives (strings, numbers, etc.), this is the value itself.

### Custom Variable Names

You can specify a custom variable name for better clarity:

```markdown
{#each users as user}

- {user.name} ({user.email})
  {/each}
```

### Loop with Index

Access the current index by providing a second variable name:

```markdown
{#each items as item, i}
{i}. {item}
{/each}
```

The index is zero-based (starts at 0).

### Nested Properties

Loop items can be objects with nested properties:

```markdown
{#each products as product}
**{product.name}**

Price: ${product.price}
{/each}
```

### Accessing External Variables

Variables from outside the loop are still accessible:

```markdown
{#each items as item}

- {prefix}{item}{suffix}
  {/each}
```

### Nested Loops

Loops can be nested to create complex structures:

```markdown
{#each categories as category}

## {category.name}

{#each category.items as item}

- {item}
  {/each}
  {/each}
```

### Combining Loops with Conditionals

You can use conditionals inside loops to filter or conditionally render content:

```markdown
{#each users as user}
**{user.name}**

{#if user.verified}
✓ Verified user
{/if}

{#if user.role == 'admin'}
👑 Administrator
{/if}
{/each}
```

### Loop Examples

**Simple list:**

```javascript
Prose(
  { data: { fruits: ["Apple", "Banana", "Cherry"] } },
  `
{#each fruits as fruit}
- {fruit}
{/each}
`,
)
```

**User cards with conditionals:**

```javascript
Prose(
  {
    data: {
      users: [
        { name: "Alice", verified: true, role: "admin" },
        { name: "Bob", verified: false, role: "user" },
        { name: "Charlie", verified: true, role: "user" },
      ],
    },
  },
  `
{#each users as user}
### {user.name}

{#if user.verified}
✓ Verified
{/if}

{#if user.role == 'admin'}
**Role:** Administrator
{/if}

---

{/each}
`,
)
```

**Numbered list with index:**

```javascript
Prose(
  { data: { steps: ["Create account", "Verify email", "Complete profile"] } },
  `
{#each steps as step, i}
**Step {i + 1}:** {step}
{/each}
`,
)
```

Note: Since template literals evaluate expressions like `{i + 1}`, you may need to use alternative approaches if you want to perform calculations. In this case, pre-process your data.

**Empty arrays:**

When an array is empty, the loop content is not rendered:

```javascript
Prose(
  { data: { items: [] } },
  `
{#each items as item}
- {item}
{/each}
`,
)
// Renders nothing
```

## Difference from Markdown Component

- **Markdown**: Pure markdown rendering, no variables or custom components
- **Prose**: Markdown + templating (variables, custom components, conditionals, loops)

Use `Markdown` for simple, static content. Use `Prose` for dynamic content in blogs, CMS, or documentation systems.
