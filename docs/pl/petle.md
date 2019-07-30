# Pętle

## for, each, foreach

Do iterowania po tablicach oraz obiektach służą tagi: `for`, `each`, `foreach`

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

Istnieje możliwość przekazania do pętli wyrażenia zamiast zmiennej.

```html
<ul>
  <for todo in="{['foo', 'bar', 'baz']}">
    <li>{todo}</li>
  </for>
</ul>
```

## range

W celu iterowania po indeksach zamiast wartościach należy skorzystać z tagu `range`.

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

## Iterowanie po obiektach

Pure-engine wspiera iterowanie po kluczach oraz wartościach obiektu. Do tego celu służy tag `for`. 
Na chwilę obecną nie mam możliwości iterowania tylko po kluczach lub wartościach. Należy podać obydwa atrybuty.

```html
<for key and value in foo>
  {foo[key] === value}
</for>
```