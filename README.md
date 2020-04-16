# boxwood

[![npm](https://img.shields.io/npm/v/boxwood.svg)](https://www.npmjs.com/package/boxwood)
[![build](https://github.com/buxlabs/boxwood/workflows/build/badge.svg)](https://github.com/buxlabs/boxwood/actions)

> Progressively enhanced HTML templating engine written in JavaScript

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Benchmarks](#benchmarks)
- [REPL](https://buxlabs.pl/en/tools/js/boxwood)
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

`npm install boxwood`

## Usage

```js
const { compile, escape } = require('boxwood')

async function example () {
  const { template } = await compile('<div>{foo}</div>', { cache: false })
  console.log(template({ foo: 'bar' }, escape))
}

example()
```

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

#### data

```html
<data yaml>
title: Hello, world!
subtitle: Hey!
</data>
<layout {title}>
  {subtitle}
</layout>
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

You can add a space explicitly if needed.

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

### Variables

#### globals

You can reference the parameters that were passed to the template via the `globals` object too. It might be useful is some scenarios but sending params explicitly is usually better.

```html
<!-- layouts/partials/head.html - layouts/default.html - pages/about/index.html  -->
<!-- you could send stylesheets explicitly, but it could -->
<!-- get annoying if the layout is used in many places -->

<head>
  <for stylesheet in globals.stylesheets>
    <link rel="stylesheet" type="text/css" href="{stylesheet}">
  </for>
</head>
```

### Internationalization

#### data tag

You can keep translations in every file. They're scoped so you can use same names in multiple files.

```html
<h1><translate hello/></h1>
<data yaml>
i18n:
  hello:
    pl: Hej
    en: Hello
</data>
```

You also need to pass `languages` to the compiler. The template needs to get the `language` to know which text to render.

```js
// ...
const { template } = await compile(source, { languages: ['pl', 'en'])
const html = template({ language: 'en' }, escape)
// ...
```

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

```
todos: boxwood x 6,272,859 ops/sec ±0.36% (88 runs sampled)
todos: underscore x 284,402 ops/sec ±0.53% (91 runs sampled)
todos: lodash x 351,229 ops/sec ±0.51% (89 runs sampled)
todos: handlebars x 244,253 ops/sec ±0.62% (87 runs sampled)
todos: mustache x 535,452 ops/sec ±0.38% (92 runs sampled)
Fastest is boxwood
  ✔ benchmark: todos (30.9s)
friends: boxwood x 1,736,236 ops/sec ±0.33% (88 runs sampled)
friends: underscore x 100,276 ops/sec ±0.18% (89 runs sampled)
friends: lodash x 131,153 ops/sec ±0.39% (92 runs sampled)
friends: handlebars x 295,538 ops/sec ±0.15% (95 runs sampled)
friends: mustache x 164,524 ops/sec ±0.47% (92 runs sampled)
Fastest is boxwood
  ✔ benchmark: friends (31s)
if: boxwood x 62,801,617 ops/sec ±0.15% (87 runs sampled)
if: underscore x 530,691 ops/sec ±0.20% (90 runs sampled)
if: lodash x 549,457 ops/sec ±0.93% (86 runs sampled)
if: handlebars x 285,902 ops/sec ±0.54% (91 runs sampled)
if: mustache x 742,208 ops/sec ±0.41% (88 runs sampled)
Fastest is boxwood
  ✔ benchmark: if (30.8s)
projects: boxwood x 1,955,177 ops/sec ±0.27% (92 runs sampled)
projects: underscore x 117,698 ops/sec ±0.14% (90 runs sampled)
projects: lodash x 148,609 ops/sec ±0.46% (91 runs sampled)
projects: handlebars x 217,347 ops/sec ±0.25% (90 runs sampled)
projects: mustache x 228,487 ops/sec ±0.60% (88 runs sampled)
Fastest is boxwood
  ✔ benchmark: projects (31.1s)
search: boxwood x 648,366 ops/sec ±0.74% (91 runs sampled)
search: underscore x 22,410 ops/sec ±0.60% (90 runs sampled)
search: lodash x 26,543 ops/sec ±0.60% (90 runs sampled)
search: handlebars x 263,402 ops/sec ±0.45% (92 runs sampled)
search: mustache x 101,305 ops/sec ±0.25% (93 runs sampled)
Fastest is boxwood
  ✔ benchmark: search (31s)
```

## Maintainers

[@emilos](https://github.com/emilos)

## Contributing

All contributions are highly appreciated. Please feel free to open new issues and send PRs.

## License

MIT
