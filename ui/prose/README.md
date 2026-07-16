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
- **Fallbacks**: `{nickname ?? name ?? "Guest"}` with JS nullish semantics
- **Method calls**: `{images.slice(0, 2)}`, `{tags.join(', ')}`, `{name.toUpperCase()}`
- **Array literals**: `<Gallery images="{[images[0], images[2]]}" />`
- **Conditionals**: `{#if}...{#elseif}...{#else}...{/if}` blocks
- **Loops**: `{#each items}...{#else}...{/each}` with an empty state
- **Custom components**: `<Alert type="warning">...</Alert>`
- **Builtin HTML tags**: `<article>`, `<section>`, `<div>`, etc.
- **Author comments**: `{!-- never rendered --}`
- **Literal code**: templating never runs inside code blocks or inline code
- **Validation**: `Prose.validate(text, { data, components })` reports problems

The language is closed by design - see
[What is deliberately missing](#what-is-deliberately-missing).

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

## Method Calls

Variable paths can include calls to safe, non-mutating methods. This is especially useful for passing a part of an array to a component:

```javascript
Prose(
  {
    data: { images: ["a.jpg", "b.jpg", "c.jpg", "d.jpg"] },
    components: { Gallery },
  },
  `
<Gallery images="{images.slice(0, 2)}" />

<Gallery images="{images.slice(2)}" />
`,
)
```

Method calls also work in text content:

```markdown
**Tags:** {tags.join(', ')}

# {title.toUpperCase()}
```

Rules:

- Only whitelisted, non-mutating methods are allowed: `slice`, `at`, `concat`, `includes`, `indexOf`, `lastIndexOf`, `join`, `toUpperCase`, `toLowerCase`, `trim`, `charAt`, `substring`, `split`, `padStart`, `padEnd`, `repeat`, `replace`, `replaceAll`, `startsWith`, `endsWith`, `toFixed`, `toString`
- Arguments must be literals: numbers, quoted strings, `true`, `false` or `null` (variables are not supported as arguments)
- Mutating methods like `push`, `pop` or `splice` are rejected and the placeholder is kept as-is
- Method calls can be chained with property access: `{gallery.images.slice(1)[0]}`

## Fallbacks with ??

Provide a fallback for missing values with the `??` operator:

```markdown
Hello {nickname ?? name ?? "Guest"}

Price: {price ?? "TBD"}
```

The semantics match JavaScript: the fallback applies only when the value is
`null` or `undefined`. Zero, empty strings and `false` are real values and do
not trigger the fallback:

```markdown
Count: {count ?? "none"}
```

With `count: 0` this renders `Count: 0`, not `Count: none`.

Operands can be paths, literals (`"text"`, `0`, `true`, `null`), method calls
or array literals, and `??` works in text, in loops and in component
attributes:

```markdown
<Gallery images="{gallery ?? ['placeholder.jpg']}" />
```

## Array Literals

Component attributes accept array literals whose elements are paths or
literals:

```markdown
<Gallery images="{[images[0], images[2]]}" />
<Hero sources="{[cover ?? 'default.jpg', banner]}" />
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

### Negation

You can negate conditions using the `!` operator:

```markdown
{#if !hidden}
This content is visible
{/if}

{#if !user.verified}
Please verify your email
{/if}

{#if !premium}
Upgrade to access premium features
{/if}
```

The `!` operator inverts the condition, making it true when the value is falsy.

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
- Negation: `{#if !hidden}...{#else}...{/if}`
- Nested conditions: `{#if outer}{#if inner}...{#else}...{/if}{#else}...{/if}`
- Inside loops: Conditionally render content for each item

### Else-If Chains

Use `{#elseif}` to test multiple conditions in sequence:

```markdown
{#if score >= 90}
Grade: A - Excellent!
{#elseif score >= 80}
Grade: B - Good job!
{#elseif score >= 70}
Grade: C - Passing
{#elseif score >= 60}
Grade: D - Needs improvement
{#else}
Grade: F - Failed
{/if}
```

```markdown
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
```

Else-if features:

- **Multiple branches**: Chain as many `{#elseif}` blocks as needed
- **Short-circuit evaluation**: First matching condition wins, remaining branches are skipped
- **Optional else**: The final `{#else}` block is optional
- **All comparison operators**: Use `==`, `!=`, `>`, `<`, `>=`, `<=` in elseif conditions
- **Negation support**: Use `!` to negate elseif conditions
- **Nested conditionals**: Place if/else blocks inside elseif branches

Example with real-world blog scenario:

```javascript
Prose(
  {
    data: {
      status: "draft",
      publishedAt: null,
      scheduledAt: "2026-07-10",
    },
  },
  `
# My Blog Post

{#if publishedAt}
*Published on {publishedAt}*
{#elseif scheduledAt}
*Scheduled for {scheduledAt}*
{#else}
*Draft - not yet published*
{/if}

## Content

...
`,
)
```

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

### Empty State with {#else}

When the array is empty or missing, the `{#else}` branch renders instead:

```markdown
{#each products as product}
- {product.title}
{#else}
No products yet.
{/each}
```

Without an `{#else}` branch, an empty array renders nothing. An `{#else}`
that belongs to an `{#if}` inside the loop is not confused with the loop's
own `{#else}`.

### Expansion Limit

Loop expansion is capped at 1,000,000 characters. Nested loops over large
arrays multiply quickly - exceeding the cap throws a clear error instead of
freezing the page.

## Author Comments

Notes for editors that never render:

```markdown
{!-- TODO: replace the photo after the shoot --}

# The Article
```

Comments can span multiple lines. Templating inside a comment is never
executed.

## Code Is Literal

Templating never runs inside fenced code blocks or inline code - braces,
loops and conditionals stay exactly as written:

````markdown
Inline `{name}` stays literal, and so does everything inside fences:

```js
const x = {count}
{#if debug}console.log(x){/if}
```
````

## Escaping

Use `\{` to render a literal brace in regular text: `\{name}` renders as
`{name}`.

## Validation

`Prose.validate` reports the problems the renderer tolerates silently -
ideal for a CMS preview:

```javascript
const { Prose } = require("boxwood/ui")

const issues = Prose.validate(text, { data, components })
// [
//   { line: 3, type: "unknown-component", message: "Unknown component: <Galery>" },
//   { line: 3, type: "unknown-variable", message: "Unknown variable: imges" },
//   { line: 4, type: "unclosed-block", message: "Unclosed {#each} opened on line 4" },
// ]
```

Both options are optional: without `data` the unknown-variable check is
skipped, without `components` the unknown-component check only knows the
builtin components. Issue types: `unknown-variable`, `unknown-component`,
`unsafe-method`, `malformed-expression`, `malformed-block`,
`unmatched-block`, `unclosed-block`, `unclosed-comment`,
`unclosed-code-block`.

## What Is Deliberately Missing

The language is closed by design. When content needs something more, prepare
it in the data instead of extending the syntax:

- **Filters/formatters** (`{price | currency}`) - format in JS and pass
  `priceFormatted` in `data`
- **Arithmetic** (`{price * 1.23}`) - compute in JS, pass the result
- **Variable definitions** (`{#set ...}`) - shape the data before rendering
- **Ternaries** (`{a ? b : c}`) - use `{#if}` blocks or `??`
- **Logical operators in conditions** (`a && b`) - nest `{#if}` blocks

If a template needs one of these, that is a signal the data is missing a
field, not that the language is missing a feature.

## Difference from Markdown Component

- **Markdown**: Pure markdown rendering, no variables or custom components
- **Prose**: Markdown + templating (variables, custom components, conditionals, loops)

Use `Markdown` for simple, static content. Use `Prose` for dynamic content in blogs, CMS, or documentation systems.
