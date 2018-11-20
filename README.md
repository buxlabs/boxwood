# pure-engine

> Compile HTML templates into JS

![npm (scoped)](https://img.shields.io/npm/v/pure-engine.svg)
[![Codeship Status for buxlabs/pure-engine](https://img.shields.io/codeship/0f4ad4f0-3059-0136-f8b6-0ef1398f25bc/master.svg)](https://app.codeship.com/projects/288586)

[REPL](https://buxlabs.pl/en/tools/js/pure-engine)

## Description

Pure Engine is a library designed to compile HTML templates into JS. It analyses the template and generates an optimal rendering function that can be used on the client and the server. The compilation process should ideally happen in a build step (for the client) or the output could be memoized after first usage (for the server).

The syntax of the template should be easy to read and write. There are two types of tags: curly and html tags.

Status: Alpha / Proof of concept

### Curly Tags

`{name}` is a curly tag

Curly tags can contain expressions, e.g. `{1 + 2}` is a valid tag.
They can also contain additional modifiers like `{name | capitalize}`

### HTML Tags

`<if>` is an html tag

HTML tags can contain additional attributes, e.g. `<if limit is a number>` is a valid tag. The attribute syntax follows the natural language principles.

## Usage

`npm install pure-engine escape-html`

```js
const { compile } = import 'pure-engine'
const escape = import 'escape-html'
// ... later, inside of an async function
const template = await compile('<div>{foo}</div>')
expect(template({ foo: 'bar' })).to.equal('<div>bar</div>')
```

## Features

* conditional tags: if, else, elseif, unless, elseunless
* loops: for, each, foreach
* import and require tags
* modifiers for strings, numbers, arrays, objects and more
* special attributes, e.g. inline for asset inline, width="auto" for auto sizing and more
* built-in i18n support (translate tag and modifier)
* compiler tag for scripts (allows custom compilers)
* error handling: rescue tag

## Input / Output Examples

```
<if foo is present>{bar}</if>
```

```js
function render(__o, __e) {
  var __t = "";
  if (__o.foo !== void 0) {
    __t += __e(__o.bar);
  }
  return __t;
}
```

```
<for month in months>{month}</for>
```

```js
function render(__o, __e) {
  var __t = "";
  for (var a = 0, b = __o.months.length; a < b; a += 1) {
    var month = __o.months[a];
    __t += __e(month);
  }
  return __t;
}
```

```
<foreach month in months>{month}</foreach>
```

```js
function render(__o, __e) {
  var __t = "";
  __o.months.forEach(function (month) {
    __t += __e(month);
  });
  return __t;
}
```

## Benchmarks

`npm run benchmark`

```
pure-engine x 3,504,768 ops/sec ±1.80% (85 runs sampled)
underscore x 210,428 ops/sec ±1.60% (90 runs sampled)
lodash x 249,232 ops/sec ±1.10% (91 runs sampled)
handlebars x 1,883,683 ops/sec ±1.70% (84 runs sampled)
mustache x 450,925 ops/sec ±2.56% (87 runs sampled)
Fastest is pure-engine
```

## License

MIT
