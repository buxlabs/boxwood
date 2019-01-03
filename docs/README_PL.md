# pure-engine

> Kompiluj szablony HTML do JS

![npm (scoped)](https://img.shields.io/npm/v/pure-engine.svg)
[![Codeship Status for buxlabs/pure-engine](https://img.shields.io/codeship/0f4ad4f0-3059-0136-f8b6-0ef1398f25bc/master.svg)](https://app.codeship.com/projects/288586)

[REPL](https://buxlabs.pl/en/tools/js/pure-engine)

## Opis

Pure Engine jest silnikiem przeznaczonym do kompilacji szablonów HTML na funkcje w JS. Analizuje szablon i generuje optymalną funkcję renderującą, która może być używana zarówno po stronie klienta, jak i serwera. Proces kompilacji powinien w idealnym przypadku nastąpić w procesie budowania (dla klienta) lub jego rezultat powinien zostać zachowany w celu ponownego wykorzystania (na serwerze).

Składnia szablonów powinna być łatwa w czytaniu i pisaniu. Istnieją dwa typy tagów: klamrowe i HTML.

Status: Alfa / Dowód koncepcji

### Tagi klamrowe

`{name}` jest tagiem klamrowym

Tagi klamrowe mogą posiadać wyrażenia, np. `{1 + 2}` jest poprawnym tagiem.
Mogą również posiadać dodatkowe filtry, takie jak `{name | capitalize}`

### Tagi HTML

`<if>` jest tagiem HTML

Tagi HTML mogą posiadać dodatkowe atrybuty, np.: `<if limit is a number>` jest poprawnym tagiem. Składnia atrybutów naśladuje język naturalny.

## Użycie

`npm install pure-engine escape-html`

```js
const { compile } = import 'pure-engine'
const escape = import 'escape-html'
// ... dalej, wewnątrz async function
const template = await compile('<div>{foo}</div>')
expect(template({ foo: 'bar' })).to.equal('<div>bar</div>')
```

## Funkcjonalności

* tagi import i require

```html
<import layout from="./layouts/default.html">
<import form from="./components/form.html">
<import input from="./components/input.html">
<import button from="./components/button.html">

<layout>
  <h1>Hello, world!</h1>
  <form>
    <input name="foo" />
    <button>Submit</button>
  </form>
</layout>
```

* tagi warunkowe: if, else, elseif, unless, elseunless

```html
<if foo>bar</if>
```

* loops: for, each, foreach

```html
<for car in cars>
  {car.brand}
</for>
```

* filtry

```html
{title | capitalize}
```

* specjalne atrybuty

```html
<img src="./foo.png" inline>
```

* wbudowanie wsparcie i18n (tag translate i filtr)

```html
<i18n yaml>
hello:
- 'Hej!'
- 'Hello!'
</i18n>
<h1><translate hello></h1>
```

* tag compiler dla skryptów

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

* error handling: rescue tag

```html
<h1>{person.title}</h1>
<rescue>:(</rescue>
```


## Wejście / Wyjście

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

## Benchmarki

`npm run benchmark`

```
pure-engine x 4,053,839 ops/sec ±0.91% (87 runs sampled)
underscore x 161,728 ops/sec ±0.88% (91 runs sampled)
lodash x 204,561 ops/sec ±0.73% (90 runs sampled)
handlebars x 1,699,469 ops/sec ±1.12% (85 runs sampled)
mustache x 447,168 ops/sec ±1.09% (82 runs sampled)
Fastest is pure-engine
```

## Licencja

MIT
