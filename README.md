# boxwood

[![npm](https://img.shields.io/npm/v/boxwood.svg)](https://www.npmjs.com/package/boxwood)
[![build](https://github.com/buxlabs/boxwood/workflows/build/badge.svg)](https://github.com/buxlabs/boxwood/actions)

> It's just JavaScript™ - A template engine that gets out of your way

## Why Boxwood?

Unlike traditional template engines, Boxwood templates are **just JavaScript functions**. No new syntax to learn, no parsing overhead, and full access to the JavaScript ecosystem.

```javascript
// This is your template - just a function that returns HTML nodes
const HomePage = ({ posts }) => {
  return Div([
    H1("Blog"),
    posts.map((post) => Article([H2(post.title), P(post.summary)])),
  ])
}
```

## Key Advantages

### Zero Learning Curve

If you know JavaScript, you already know Boxwood. Use `map`, `filter`, `if/else`, and all standard JS features naturally.

### IDE Support

Get autocomplete, refactoring, and go-to-definition out of the box. Your templates are just code, so your editor understands them.

### True Composition

Components are functions. Compose them like functions. No slots, no special APIs - just parameters and return values.

### Performance

No template parsing at runtime. Templates are already JavaScript functions, eliminating parsing overhead.

### Security Helpers

- Automatic HTML escaping by default
- Basic sanitization for loaded SVG/HTML files
- Path traversal protection for file operations
- Remember: security is ultimately your responsibility

### Integrated CSS Management

- Automatic CSS scoping with hash-based class names
- CSS-in-JS with zero runtime
- Critical CSS inlining
- Automatic minification

### Built-in i18n Support

First-class internationalization support with a simple, component-friendly API for multi-language applications.

### Asset Handling

- Inline images as base64
- SVG loading with automatic sanitization
- JSON data loading
- Raw HTML imports with XSS protection

### SEO Friendly

- Pure server-side rendering - search engines see fully rendered HTML
- Lightning fast pages with inlined critical CSS
- Minimal payload size improves Core Web Vitals scores
- No client-side hydration delays

### Minimal Footprint

Short implementation. No complex build process or heavy dependencies.

### Testable by Design

Templates are pure functions - easy to unit test with any testing framework.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Syntax](#syntax)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

`npm install boxwood`

## Usage

Create a template file:

```js
// templates/greeting.js
const { Div, H1, P } = require("boxwood")

module.exports = ({ name, message }) => {
  return Div([H1(`Hello, ${name}!`), P(message)])
}
```

Compile and render it:

```js
// app.js
const { compile } = require("boxwood")

const { template } = compile("./templates/greeting.js")
const html = template({
  name: "World",
  message: "Welcome to Boxwood",
})

console.log(html)
// <div><h1>Hello, World!</h1><p>Welcome to Boxwood</p></div>
```

### Express Integration

Boxwood includes built-in Express support:

```js
import express from "express"
import engine from "boxwood/adapters/express"
import crypto from "crypto"

const app = express()

// Register Boxwood as template engine
app.engine("js", engine())
app.set("views", "./views")
app.set("view engine", "js")

// CSP (Content Security Policy) nonce for inline scripts
// A nonce is a unique random value generated for each request that allows
// specific inline scripts to execute while blocking potential XSS attacks
app.use((req, res, next) => {
  // Generate a cryptographically secure random nonce
  res.locals.nonce = crypto.randomBytes(16).toString("base64")

  // Set CSP header - only scripts with this exact nonce can execute
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'nonce-${res.locals.nonce}' 'strict-dynamic';`
  )
  next()
})

// Render templates - nonce is automatically injected into all inline scripts
app.get("/", (req, res) => {
  res.render("home", { title: "Welcome" })
  // Boxwood automatically adds nonce="${res.locals.nonce}" to script tags
})
```

The Express adapter automatically:

- Handles template caching in production
- Hot reloads templates in development
- Injects CSP nonces from `res.locals.nonce` into all inline scripts and styles

#### Understanding CSP Nonces

A Content Security Policy (CSP) nonce is a security feature that helps prevent Cross-Site Scripting (XSS) attacks:

1. **Without CSP**: Any injected `<script>` tag can execute, making XSS attacks possible
2. **With CSP nonce**: Only scripts with the correct nonce attribute can run
3. **How it works**:
   - Server generates a unique random nonce for each request
   - Server adds this nonce to the CSP header: `script-src 'nonce-abc123'`
   - Server adds the same nonce to legitimate scripts: `<script nonce="abc123">`
   - Browser only executes scripts that have the matching nonce
   - Attackers can't guess the nonce, so injected scripts are blocked

Example output:

```html
<!-- HTTP Header -->
Content-Security-Policy: script-src 'nonce-rAnd0m123' 'strict-dynamic';

<!-- Generated HTML -->
<script nonce="rAnd0m123">
  console.log("This legitimate script will execute")
</script>

<script>
  console.log("This injected script will be blocked!")
</script>
```

## Features

### Components with CSS

```js
// button.js
const { component, css, Button: ButtonTag } = require("boxwood")

const styles = css`
  .button {
    padding: 8px 16px;
    background: blue;
    color: white;
  }
  .secondary {
    background: gray;
  }
`

const Button = ({ variant, children }) => {
  return ButtonTag(
    {
      // className accepts arrays - falsy values are automatically filtered
      className: [styles.button, variant === "secondary" && styles.secondary],
    },
    children
  )
}

module.exports = component(Button, { styles })
```

### Internationalization

```js
// welcome.js
const { component, i18n, H1, P } = require("boxwood")

const Welcome = ({ translate, username }) => {
  return [
    H1(translate("greeting").replace("{name}", username)),
    P(translate("intro")),
  ]
}

module.exports = component(Welcome, {
  i18n: i18n.load(__dirname),
})
```

### Asset Loading

```js
const { Img, Svg } = require("boxwood")

// Load and inline images
const Logo = Img.load("./assets/logo.png")

// Load and sanitize SVGs
const Icon = Svg.load("./assets/icon.svg")

module.exports = () => {
  return [Logo(), Icon]
}
```

Additional examples are available in the `test` directory.

## Security

Boxwood implements multiple layers of security to protect against common web vulnerabilities:

### Built-in Protections

- **HTML Escaping**: All dynamic content is escaped by default, preventing XSS attacks
- **File Sanitization**: Loaded SVG and HTML files are automatically sanitized to remove:
  - Script tags and inline event handlers
  - Dangerous URL protocols (javascript:, vbscript:, data:text/html)
  - Case-insensitive attack variants
- **Path Traversal Protection**: File access is restricted to the project directory
- **Symlink Blocking**: Prevents directory traversal via symbolic links
- **Attribute Validation**: Prevents prototype pollution and attribute injection

### Content Security Policy (CSP)

The Express adapter includes built-in CSP nonce support:

```javascript
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64")
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'nonce-${res.locals.nonce}' 'strict-dynamic';`
  )
  next()
})
```

Nonces are automatically injected into all inline scripts and styles.

### Best Practices

⚠️ **Important Security Guidelines:**

- **Only load files from trusted sources** - sanitization is a defense-in-depth measure, not a complete solution
- **Never use `sanitize: false`** with user-generated or untrusted content
- **Always use CSP headers** in production environments
- **Review all files** before deploying to production
- **Validate user input** on the server side

### Security Review

A comprehensive security review has been completed. See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for:
- Identified and fixed vulnerabilities
- Security test coverage
- Known limitations
- Recommendations for secure usage

**Security remains the developer's responsibility.** Use appropriate security measures for your specific use case.

## Contributing

Issues and pull requests are welcome. The codebase is intentionally small and focused.

## License

MIT
