# Instrukcje warunkowe

Do kontrolowania renderowania elementów służą tagi `if` `elseif` `else`.
 
```html
<if foo>
  {foo}
</if>
```

```html
<if not foo>
  {foo}
</if>
```

```html
<if foo and bar>
  {foo}
</if>
```

```html
<if foo.length>
  {foo}
</if>
```

```html
<if isValid()>
  {foo}
</if>
```

W niektórych przypadkach będziesz potrzebował bardziej złożonych testów dla twoich warunków.
W tym celu pure-engine wykorzystuje akcje.

Akcje są zbiorem zdefiniowanych atrybutów, które połączone razem tworzą funkcję testową.
Składnia akcji jest zbliżona do języka naturalnego.

```html
<if foo is even>
  <p>{foo} is even</p>
</if>
```

```html
<if foo is greater than bar>
  <p>{foo}</p>
</if>
<else>
  {bar}
</else>
```

```html
<if foo does not start with bar>
  {foo}  
</if>
```

```html
<if date1 is later than date2>
  foo  
</if>
```

Zachęcamy do odwiedzenia pliku `action.js`, gdzie znajdziesz pełną listę zdefiniowanych akcji.