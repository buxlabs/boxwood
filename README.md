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

## Table of Contents

- [Install](#install)
- [Usage](#usage)
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

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
