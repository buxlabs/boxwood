# Components

Components are standalone `.html` files which can be imported and usage in another files.
Each component can contain own styles and scripts. Component can take some attributes and can have default values.

## Basic component

The simplest component can be composed without any extra functionality like slots, attributes or custom styles.

```html
<!-- hello-world.html -->
<h1>Hello World!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello/>
```

## Passing attributes

Rather than static component you will probably want to make components more dynamic and reusable. 
We can pass to the component values through attributes.

### Passing literals
```html
<!-- hello-world.html -->
<h1>Hello {name}!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello name="World"/>
```

### Passing variables
```html
<!-- hello-world.html -->
<h1>Hello {name}!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello name="{name}"/>
<!-- Or with shorthand syntax -->
<hello {name} />
```

### Setting values of component attributes
```html
<!-- button.html -->
<button class="{color} button" type="{type || 'submit'}">{color} button</button>

<!-- index.html -->
<import button from="./button.html">
<button color="blue" text="button"/>
```
