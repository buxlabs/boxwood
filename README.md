# boxwood

[![npm](https://img.shields.io/npm/v/boxwood.svg)](https://www.npmjs.com/package/boxwood)
[![build](https://github.com/buxlabs/boxwood/workflows/build/badge.svg)](https://github.com/buxlabs/boxwood/actions)

> Server side templating engine written in JavaScript

[boxwood](https://github.com/buxlabs/boxwood) was created to achieve the following design goals:

1. templates can be split into components
2. css is hashed per component
3. css is automatically minified
4. critical css is inlined
5. templates can import other dependencies
6. inline images or svgs
7. i18n support
8. server side
9. good for seo
10. small (1 file, 890 LOC~)
11. easy to start, familiar syntax
12. easy to test

The template starts with a standard js file, which builds a tree of nodes, that get rendered to html.

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

```js
const { compile } = require("boxwood")
const { join } = require("path")
// ...
const path = join(__dirname, "index.js")
const { template } = compile(path)
// ...
const html = template({ foo: "bar" })
console.log(html)
```

You can use [express-boxwood](https://www.npmjs.com/package/express-boxwood) for [express](https://www.npmjs.com/package/express).

## Syntax

```js
// example/index.js
const Layout = require("./layout")
const Banner = require("./banner")

const App = () => {
  return Layout({ language: "en" }, [
    Banner({
      title: "Hello, world!",
      description: "Lorem ipsum dolor sit amet",
    }),
  ])
}

module.exports = App
```

```js
// example/layout/index.js
const { component, css, Doctype, Html, Body } = require("boxwood")
const Head = require("./head")

const styles = css.load(__dirname)

const Layout = ({ language }, children) => {
  return [
    Doctype(),
    Html({ lang: language }, [
      Head(),
      Body({ className: styles.layout }, children),
    ]),
  ]
}

module.exports = component(Layout, { styles })
```

```js
// example/layout/head/index.js
const { Head: HeadTag, Title } = require("boxwood")

const Head = () => {
  return HeadTag([Title("example")])
}

module.exports = Head
```

```js
// example/banner/index.js
const { component, css, H1, P, Section } = require("boxwood")

const styles = css.load(__dirname)

const Banner = ({ title, description }) => {
  return Section({ className: styles.banner }, [
    H1(title),
    description && P(description),
  ])
}

module.exports = component(Banner, { styles })
```

```js
// example/banner/index.test.js
const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("banner renders a title", async () => {
  const { template } = compile(__dirname)
  const html = template({ title: "foo" })
  assert(html.includes("<h1>foo</h1>"))
})

test("banner renders an optional description", async () => {
  const { template } = compile(__dirname)
  const html = template({ title: "foo", description: "bar" })
  assert(html.includes("<h1>foo</h1>"))
  assert(html.includes("<p>bar</p>"))
})
```

You can check the `test` dir for more examples.

## Security

By default, boxwood sanitizes all HTML, SVG and i18n content loaded via its API to protect against basic XSS attacks.

Disabling sanitization ({ sanitize: false }) is only safe for trusted, developer-controlled files. Never use it with user-generated or untrusted content.

All file access is restricted to the project directory and symlinks are not allowed by default to prevent path traversal attacks.

That said, the library is pretty small so please review it and suggest improvements if you have any.

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
