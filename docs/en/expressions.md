# Expressions

To evaluate JavaScript code inside the HTML use curly brackets `{}`.
Curly brackets can handle most of any valid JavaScript expression.

```html
<div>{'Hello ' + 'World!'}</div>
```

With curly brackets you can also inject variables into the template.

```html
<div>Hello {name}!</div>
```

Inside the expression you can use built-in filters. Filters are responsible for easy mapping value to another form.
More information about filters you can find here [here]()

```html
<div>{hello | uppercase}</div>
```

```html
<div>{hello | lowercase | }</div>
```

The full list of filters with description and examples you can find (here)[https://buxlabs.pl/en/tools/js/pure-utilities]

