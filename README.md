# pure-engine

[![npm](https://img.shields.io/npm/v/pure-engine.svg)](https://www.npmjs.com/package/pure-engine)
[![build](https://github.com/buxlabs/pure-engine/workflows/build/badge.svg)](https://github.com/buxlabs/pure-engine/actions)

> Compile HTML templates into JS

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Benchmarks](#benchmarks)
- [REPL](https://buxlabs.pl/en/tools/js/pure-engine)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

The library is a compiler designed to generate an optimal rendering function. The function should get cached and reused to provide a much better performance than other templating languages.

It can also be used in variety of contexts, for rendering html pages, email templates, pdf templates. It's capable of importing components and partials, inlining images and styles, which can be useful in those scenarios. The syntax should be easy to read and write.

Not everything is ready yet, but long-term, the library should be able to generate a template that includes minified html with critical css/js that's required to run the page. Scoped css/js should let you build big, dynamic apps.

Server-side rendering works out of the box, and some day we'd like to include an optional runtime with a minimal footprint, which allows you to seamlessly switch to a single-page-app mode, without page reloads.

Even further in the future, the compiler is going to be split into a front-end compiler and a back-end compiler, that will use an intermediate representation to represent the app. This way it'll allow the app to be written in a different way, while preserving the performance, which will get better over time, as the compiler matures.

If this sounds great, jump on board and try it out. Every little bit helps.

### Status

Beta / Used in production / Needs security assessment

### Syntax

#### Curly Tags

`{name}` is a curly tag

Curly tags can contain expressions, e.g. `{1 + 2}` is a valid tag.
They can also contain additional filters like `{name | capitalize}`.

```html
<div>{name}</div>
```

#### Square Tags

`[color]` is a square tag

Square tags are array expressions and can be used as values of html attributes.

```html
<button class="[color, size, shape]"><slot/></button>
```

#### HTML Tags

`<if>` is an html tag

HTML tags can contain additional attributes, e.g. `<if limit is a number>` is a valid tag. The attribute syntax follows the natural language principles.

```html
<if name is present>
  Hello, {name}!
<else>
  Welcome!
<end>
```

## Install

`npm install pure-engine escape-html`

## Usage

```js
const { compile } = require('pure-engine')
const escape = require('escape-html')

async function example () {
  const { template } = await compile('<div>{foo}</div>')
  console.log(template({ foo: 'bar' }, escape))
}

example()
```

If you're using webpack you should use [pure-engine-loader](https://github.com/buxlabs/pure-engine-loader).

## API

### Tags

#### import/require

You can import components and use them.

```html
<import layout from="./layouts/default.html">
<import { form, input, button } from="./components">

<layout>
  <h1>Hello, world!</h1>
  <form>
    <input name="foo" />
    <button>Submit</button>
  </form>
</layout>
```

It's possible to import multiple components from a given directory. Curly brackets within the import tag are optional.

You can use the special `<slot/>` tag if you want to render children nodes.

#### render/partial/include

You can also render html partials inline. It can be useful for fragments or pages like header, footer etc.

```html
<partial from="./foo.html" />
<include partial="./foo.html" />
<render partial="./foo.html" />
```

#### if/else/elseif/unless/elseunless

There are two syntaxes you can use - short and long. The short one allows you to specify the starting tags only, for example:

```html
<if foo>bar<end>
```

```html
<if foo>
  bar
<elseif baz>
  qux
<else>
  quux
<end>
```

```html
<unless foo>bar<end>
```

The long syntax requires to specify closing tags explicitly.

```html
<if foo>
  bar
</if>
<else>
  baz
</else>
```

#### for/each/foreach

The only difference between those methods is what is being used under the hood, `<for>` uses a standard for tag, `<each>` and `<foreach>` call `.each(` and `.forEach(` method of given object.

```html
<for car of cars>
  {car.brand}
</for>

<for car and index of cars>
  #{index + 1} {car.brand}
</for>

<for key and value in object>
  {key}: {value}
</for>
```

#### spacing

Custom spacing can be tough. You can use a spacing tag, which can be used to define it per app basis.

```html
<spacing medium/>
```

You need to specify the heights as a part of the compiler's options.

```js
const { template } = await compile(`<spacing medium>`, {
  styles: {
    spacing: {
      small: '25px',
      medium: '50px',
      big: '100px'
    }
  }
})
```

#### space

The engine removes unnecessary whitespaces to reduce the size of the template. You can add a space explicitly though.

```html
<space/>
<space repeat="{5}"/>
```

#### entity

Always forgetting how to write html entities? Maybe this helps:

```html
<entity lt>
<entity gt>
<entity amp>
```

```html
<entity less than>
<entity greater than>
<entity ampersand>
```

#### template

You can define local components as well. It can be useful for tiny bits of html. Don't forget to specify the name of the component.

```html
<template foo>{bar}</template>
<foo {bar}/>
```

### Filters

There are many filters available out of the box.

```html
{title | capitalize}
{title | uppercase}
```

Filters can be chained too.

```html
{title | trim | classify}
```

Params can be passed as well.

```html
{title | slugify('_')}
```

Full list of filters is available [here](https://buxlabs.pl/en/tools/js/pure-utilities/repl).

### Attributes

#### element[padding|margin|border]

Custom spacing is often a problem, so you can add paddings, margins and borders using a shorter syntax.

```html
<div padding-bottom="1rem"></div>
```

#### element[css|style]

You can define styles as objects too.

```html
<div css="{{ padding: { bottom: '1rem', top: '2rem' } }}"></div>
```
#### element[partial]

Partial attribute will load the html file and include as the children of given node. The tag will be preserved.

```html
<head partial="./head.html"></head>
```

#### img[inline]

It's possible to inline images as base64 strings.

```html
<img src="images/foo.png" inline>
```

#### svg[from]

You can inline svgs too.

```html
<svg from="images/foo.svg"/>
```

### Styles

#### scoped

Scoped styles are adding special `scope-${number}` classes to both html and css to ensure they're unique.

```html
<div class="foo">bar</div>
<style scoped>
.foo {
  color: red;
}
</style>
```

### Scripts

#### compiler

You can hook up any compiler, which will transform and inline the source code.

```html
<div id="app"></div>
<script compiler="preact">
import { render } from "preact"
const Foo = ({ bar }) => {
  return (<span>{bar}</span>)
}
render(
  <Foo bar="baz" />,
  document.getElementById("app")
)
</script>
```

#### polyfills

Polyfills can be injected.

```html
<script polyfills="['promise.js']">
new Promise(resolve => resolve())
</script>
```

### Internationalization

#### i18n tag

You can keep translations in every file. They're scoped so you can use same names in multiple files.

```html
<h1><translate hello/></h1>
<i18n yaml>
hello:
- 'Hej!'
- 'Hello!'
</i18n>
```

The compiler needs to know the `languages`. The template needs to get the `language` to know which text to render.

Translations can also use filters:

```html
<translate title|capitalize/>
```

## Examples

The engine transforms html templates to a single rendering function. The compiler inlines variables, uses only the paths it needs and does other optimizations to create a fast template. There's still a big space for improvements, but the benchmarks look promising.

Let's have a look at some examples.

In this one, we'd like to render `{bar}`. The function has two parameters - __o (options) and __e (escape), which are referenced and used below.

```
<if foo.length equals 0>{bar}</if>
```

```js
function render(__o, __e) {
  var __t = "";
  if (__o.foo.length === 0) {
    __t += __e(__o.bar);
  }
  return __t;
}
```

Let's have a look at a simple loop now.

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

Using `<foreach` results with a slighty different code.

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

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
