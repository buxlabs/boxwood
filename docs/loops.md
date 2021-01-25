# Loops

## for, each, foreach

To iterate over arrays or objects use following tags: `for`, `each`, `foreach`

```html
<for car in cars>
  {car.brand}
</for>
```

```html
<foreach car in cars>
  {car.brand}
</for>
```

It is possible to pass an expression instead of variable.

```html
<ul>
  <for todo in="{['foo', 'bar', 'baz']}">
    <li>{todo}</li>
  </for>
</ul>
```

## range

If you want iterate over indexes rather than values, you can use `range` attribute.

```html
<for number in range="0...10">
  {number}
</for>
<!-- 0123456789 -->
```

```html
<for number in range="0..10">
  {number}
<!-- 012345678910 -->
</for>
```

```html
<for number in range="10">
  {number}
<!-- 012345678910 -->
</for>
```

```html
<for number in range="[0, 3]">
  {number}
<!-- 012 -->
</for>
```

```html
<for number in range="[start, end]">
  {number}
</for>
```

## Iterating over objects

Boxwood support also iterating over objects. For this purpose use `for` tag.
At the moment it is impossible to iterate only for keys or values. You must provide both attributes.

```html
<for key and value in foo>
  {foo[key] === value}
</for>
```
