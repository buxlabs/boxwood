# boxwood

[![npm](https://img.shields.io/npm/v/boxwood.svg)](https://www.npmjs.com/package/boxwood)
[![build](https://github.com/buxlabs/boxwood/workflows/build/badge.svg)](https://github.com/buxlabs/boxwood/actions)

> Server side templating engine written in JavaScript

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [REPL](https://buxlabs.pl/en/tools/js/boxwood)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

`npm install boxwood`

## Usage

### compile

```js
const { compile, escape } = require('boxwood')

async function example () {
  const { template } = await compile('<div>{foo}</div>', { cache: false, format: 'html' })
  console.log(template({ foo: 'bar' }, escape))
}

example()

```

### createRender

```js
const { createRender } = require('boxwood')

const render = createRender({
  cacheEnabled: process.env.NODE_ENV === 'production',
  compilerOptions: {
    paths: [
      path.join(__dirname, 'views'),
      path.join(__dirname, 'public')
    ]
  }
})

// ... await render(path, options, callback?)
```

#### cacheEnabled = true

It lets you disable cache in certain conditions. You probably don't want to cache files during development.

#### compilerOptions = {}

These options are passed down to [boxwood](https://github.com/buxlabs/boxwood).

#### globals = {}

Often you have some data that can be reused in many pages. The option can be either a function that returns an object, or an object.

#### log = false

Option for displaying errors in console. By default logging is off.

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
