# express-boxwood

> boxwood in express.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

The library makes it easier to use [boxwood](https://github.com/buxlabs/boxwood) as a view engine in [express](https://github.com/expressjs/express). It handles file loading, caching and purging the cache in the development environment.

## Install

```bash
npm install boxwood express-boxwood
```

## Usage

```js
const path = require("path")
const express = require("express")
const { compile } = require("boxwood")
const engine = require("express-boxwood")

const app = express()

app.engine("js", engine({ compile }))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "js")

app.use('/', (request, response) => response.render('index'))

app.listen(3000)
```

## API

#### compile

You need to explicitly pass the compile method.

#### env = process.env.NODE_ENV || 'development'

You can explicitly set the env in which `express-boxwood` is running. It defaults to the development mode, which does not cache the compiled template. Please ensure your `NODE_ENV` is set for your production environment to enable caching.

## Maintainers

[@emilos](https://github.com/emilos).

## Contributing

All contributions are highly appreciated! [Open an issue](https://github.com/buxlabs/boxwood/issues/new) or a submit PR.

## License

MIT © buxlabs
