# Expressions

To evaluate JavaScript code inside the HTML use curly brackets `{}`.
Curly brackets can handle any valid JavaScript expression.

```html
<div>{'Hello ' + 'World!'}</div>
```

With curly brackets you can also inject variables into template.

```html
<div>Hello {name}!</div>
```

Inside the expression you can use built-in filters. Filters are responsible for easy mapping value to another form.
More information about filters you can find here [here]()

```html
<div>{hello | uppercase}</div>
```

