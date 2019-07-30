# Wyrażenia

Do wykonania kodu JavaScript w kodzie HTML służą nawiasy klamrowe `{}`.
Nawiasy klamrowe mogą obsłużyć większość prawidłowych wyrażeń języka JavaScript.

```html
<div>{'Hello ' + 'World!'}</div>
```

Nawiasy klamrowe służą również do wstrzykiwania zawartości zmiennych do kodu HTML.

```html
<div>Hello {name}!</div>
```

W wyrażeniach można wykorzystać wbudowane filtry. Filtry są odpowiedzialne za transformacje wartości z jednej postaci na inną.

```html
<div>{hello | uppercase}</div>
```

```html
<div>{hello | lowercase | }</div>
```

Pełną listę filtrów wraz z dokumentacją i przykładami możesz znaleźć (tutaj)[https://buxlabs.pl/narz%C4%99dzia/js/pure-utilities]