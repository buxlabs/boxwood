# Conditions

To control the flow of rendering use `if` `elseif` `else` tags.
 
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

Sometimes you will need more complex test for your conditions.
For this purposes pure-engine brings actions.
Actions are sets of predefined attributes which put together created a test function.

The syntax of actions is close as possible to natural language.

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

We encourage to visit `action.js` file where you can find a full list of predefined action.