# Expressions

To evaluate JavaScript code inside the HTML use curly brackets `{}`.
Curly brackets can handle most of any valid JavaScript expressions.

```html
<div>{'Hello ' + 'World!'}</div>
```

Curly brackets allow to pass variables to the template.

```html
<div>Hello {name}!</div>
```

Inside the expression you can use built-in filters. Filters are responsible for easy mapping value to another form.

```html
<div>{hello | uppercase}</div>
```

```html
<div>{hello | lowercase | }</div>
```

The expression can be passed into a filter. Filters are responsible for transforming the value. They're simply a predefined functions that you can use. For more information, visit [pure-utilities](https://github.com/buxlabs/pure-utilities).

