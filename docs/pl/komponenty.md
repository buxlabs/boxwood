# Komponenty

Komponenty są samodzielnymi plikami `.html`, które mogą być importowane i używane w innych plikach.
Każdy komponent może zawierać własne style oraz skrypty JavaScript. Komponenty mogą przyjmować atrybuty i posiadać wartości domyślne.

## Podstawowy komponent

Najprostszy komponent może zostać stworzony bez dodatkowych funkcjonalności takich jak: sloty, atrybuty czy lokalne style.

```html
<!-- hello-world.html -->
<h1>Hello World!</h1>

<!-- index.html -->
<import hello from="./hello-world.html">
<hello/>
```

## Przekazywanie atrybutów

Zamiast używać statycznych komponentów, najczęściej będziesz chciał, aby były one bardziej dynamiczne i reużywalne.
W tym celu możesz przekazać do komponentu wartości.

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