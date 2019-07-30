# Components

Components are standalone `.html` files which can be imported in other files.
Every component can contain own styles and scripts. Component can receive attributes and have default values for them.

## Usage

The simplest component contains standard html tags.

```html
<!-- hello-world.html -->
<h1>Hello World!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello/>
```

## Passing attributes

You can make the component dynamic by passing values as attributes.

```html
<!-- hello-world.html -->
<h1>Hello {name}!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello name="World"/>
<hello name="{name}"/>
<hello {name}/>
```

```html
<!-- button.html -->
<button class="{color} button" type="{type || 'submit'}">{color} button</button>

<!-- index.html -->
<import button from="./button.html">
<button color="blue" text="button"/>
```
