# Conditions

To control the rendering flow use `if` `elseif` `else` `unless` `elseunless` tags.
 
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
<unless foo>
  bar
</unless>
```

```html
<unless foo>
  bar
</unless>
<elseunless bar>
  baz
</elseunless>
```

```html
<if foo.length>
  {foo}
</if>
```

```html
<if foo()>
  foo
</if>
```

Sometimes you'll need a more complex condition.
To make conditions easier to read the engine brings actions.
Actions can be seen as a predefined conditions which follow the natural language principles.

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
You can also check the pure-conditions [repository](https://github.com/buxlabs/pure-conditions) which contains all of the methods that are available by the engine.