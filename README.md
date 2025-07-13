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
    posts.map(post => Article([
      H2(post.title),
      P(post.summary)
    ]))
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
Single file implementation (~950 lines). No complex build process or heavy dependencies.

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
  return Div([
    H1(`Hello, ${name}!`),
    P(message)
  ])
}
```

Compile and render it:

```js
// app.js
const { compile } = require("boxwood")

const { template } = compile("./templates/greeting.js")
const html = template({ 
  name: "World",
  message: "Welcome to Boxwood"
})

console.log(html)
// <div><h1>Hello, World!</h1><p>Welcome to Boxwood</p></div>
```

For Express apps, use [express-boxwood](https://www.npmjs.com/package/express-boxwood).

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
  return ButtonTag({ 
    // className accepts arrays - falsy values are automatically filtered
    className: [styles.button, variant === 'secondary' && styles.secondary]
  }, children)
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
    P(translate("intro"))
  ]
}

module.exports = component(Welcome, { 
  i18n: i18n.load(__dirname) 
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

Boxwood provides basic security features:

- HTML content is escaped by default
- Loaded SVG and HTML files are sanitized
- File access is restricted to the project directory
- Symlinks are blocked to prevent directory traversal

The `sanitize: false` option should only be used with trusted content. Security remains the developer's responsibility.

## Contributing

Issues and pull requests are welcome. The codebase is intentionally small and focused.

## License

MIT
