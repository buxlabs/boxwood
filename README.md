# html-engine

> Compile HTML templates into JS

[![Codeship Status for buxlabs/html-engine](https://img.shields.io/codeship/0f4ad4f0-3059-0136-f8b6-0ef1398f25bc/master.svg)](https://app.codeship.com/projects/288586)
![npm (scoped)](https://img.shields.io/npm/v/@buxlabs/html-engine.svg)

[REPL](https://buxlabs.pl/en/tools/js/html-engine)

## Description

HTML Engine is a library designed to compile HTML templates into JS. It analyses the template and generates an optimal rendering function that can be used on the client and the server. The compilation process should ideally happen in a build step (for the client) or the output could be memoized after first usage (for the server).

The syntax of the template should be easy to read and write. There are two types of tags: curly and html tags.

**{name}** is a curly tag.

**\<if>** is an html tag

Curly tags can contain expressions, e.g. **{1 + 2}** is a valid tag.
They can also contain additional modifiers, e.g. **{name | capitalize}**

HTML tags can contain additional attributes, e.g. **\<if limit is a number>** is a valid tag.

The attribute syntax follows the natural language principles. There are special attributes available too, e.g. **\<img src='./cat.png' inline>** will inline the image with base64.


## Usage

`npm install @buxlabs/html-engine`

```js
const { compile } = require('@buxlabs/html-engine')
const template = compile('<div>{foo}</div>')
assert(template({ foo: 'bar' }) === '<div>bar</div>')
```

## Features

* conditional statements: if, else, elseif, unless, elseunless
* loops: for, each, foreach
* import and require statements
* modifiers for strings, numbers, arrays, objects and more
* special attributes, e.g. inline for asset inline, width="auto" for auto sizing and more
* built-in i18n support

## License

MIT
