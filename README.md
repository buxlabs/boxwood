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
10. small (1 file, 700 LOC~)
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
const { template } = await compile(path)
// ...
const html = template({ foo: "bar" })
console.log(html)
```

## Syntax

```js
// example/index.js
const layout = require("./layout")
const banner = require("./banner")

module.exports = () => {
  return layout([
    banner({
      title: "Hello, world!",
      description: "Lorem ipsum dolor sit amet",
    }),
  ])
}
```

```js
// example/layout/index.js

const { component, css, html, head, body } = require("boxwood")
const head = require("./head")

const styles = css.load(__dirname)

module.exports = component(
  (children) => {
    return html([head(), body({ className: styles.layout }, children)])
  },
  { styles }
)
```

```js
// example/head/index.js
const { head, title } = require("boxwood")

module.exports = () => {
  return head([title("example")])
}
```

```js
// example/banner/index.js
const { component, css, h1, p, section } = require("boxwood")

const styles = css.load(__dirname)

module.exports = component(
  ({ title, description }) => {
    return section({ className: styles.banner }, [
      h1(title),
      description && p(description),
    ])
  },
  { styles }
)
```

```js
// example/banner/index.test.js
const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("banner renders a title", () => {
  const { template } = await compile(__dirname)
  const html = template({ title: 'foo' })
  assert(html.includes('<h1>foo</h1>'))
})

test('banner renders an optional description', () => {
  const { template } = await compile(__dirname)
  const html = template({ title: 'foo', description: 'bar' })
  assert(html.includes('<h1>foo</h1>'))
  assert(html.includes('<p>bar</p>'))
})
```

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
