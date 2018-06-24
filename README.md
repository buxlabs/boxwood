# html-engine

[ ![Codeship Status for buxlabs/html-engine](https://app.codeship.com/projects/0f4ad4f0-3059-0136-f8b6-0ef1398f25bc/status?branch=master)](https://app.codeship.com/projects/288586)

## Installation

`npm install @buxlabs/html-engine`

## Usage

```js
const { compile } = require('@buxlabs/html-engine')
const template = compile('<div>{foo}</div>')
assert(template({ foo: 'bar' }) === '<div>bar</div>')
```

## Features

```html
<if foo>
  Hello, world!
</if>
```

```html
<if foo>
  Hello, world!
</if>
<else>
  42
</else>
```

```html
<if foo>
  Hello, world!
</if>
<elseif bar>
  42
</elseif>
```

```html
<if foo and bar>
  Hello, world!
</if>
```

```html
<if foo or bar>
  Hello, world!
</if>
```

```html
<each photo in photos>
  <img src='{photo.src}'>
</each>
```

```html
<ul>
<for month in months>
  <li>{month}</li>
</for>
</ul>
```

```html
<unless foo>
  Hello, world!
</unless>
```

```html
<unless foo>
  Hello, world!
</unless>
<else>
  42
</else>
```

```html
<unless foo>
  Hello, world!
</unless>
<elseunless bar>
  42
</elseunless>
```

```html
<if foo is present>
  Hello, world!
</if>
```

```html
<if foo is positive>
  Hello, world!
</if>
```

```html
<if foo is negative>
  Hello, world!
</if>
```

```html
<if foo is finite>
  Hello, world!
</if>
```

```html
<if foo is infinite>
  Hello, world!
</if>
```

```html
<if foo is empty>
  Hello, world!
</if>
```

```html
<if foo is an array>
  Hello, world!
</if>
```

```html
<if foo is a string>
  Hello, world!
</if>
```

```html
<if foo is a number>
  Hello, world!
</if>
```

```html
<if foo is a symbol>
  Hello, world!
</if>
```

```html
<if foo is a map>
  Hello, world!
</if>
```

```html
<if foo is a set>
  Hello, world!
</if>
```

```html
<if foo is a boolean>
  Hello, world!
</if>
```

```html
<if foo is undefined>
  Hello, world!
</if>
```

```html
<if foo is void>
  Hello, world!
</if>
```

```html
<if foo is null>
  Hello, world!
</if>
```

```html
<if foo is an object>
  Hello, world!
</if>
```

```html
<if foo is not present>
  Hello, world!
</if>
```

```html
<if foo is not empty>
  Hello, world!
</if>
```

## License

MIT
