const test = require('ava')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const path = require('path')

test('output: empty string', async assert => {
  var { template } = await compile('')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return ""; }'))
})

test('output: string', async assert => {
  var { template } = await compile('foo')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "foo"; }'))
})

test('output: html tag and string', async assert => {
  var { template } = await compile('<div>foo</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "<div>foo</div>"; }'))
})

test('output: html tag and a curly tag', async assert => {
  var { template } = await compile('<div>{foo}</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div>"; return __t; }'))
})

test('output: html tags and a curly tag', async assert => {
  var { template } = await compile('<div>{foo}</div><div>bar</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div><div>bar</div>"; return __t; }'))
})

test('output: truthy condition with strict inequality operator', async assert => {
  var { template } = await compile('<if foo is present>{foo}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo !== undefined) {
        __t += __e(__o.foo);
      }
      return __t;
    }`
  ))
})

test('output: falsy condition with strict equality operator', async assert => {
  var { template } = await compile('<if foo is not present>{foo}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo === undefined) {
        __t += __e(__o.foo);
      }
      return __t;
    }
  `))
})

test('output: truthy condition with greater than operator (is positive)', async assert => {
  var { template } = await compile('<if number is positive>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number > 0) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: falsy condition with the less than or equal operator (is positive)', async assert => {
  var { template } = await compile('<if number is not positive>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number <= 0) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: truthy condition with less than operator (is negative)', async assert => {
  var { template } = await compile('<if number is negative>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number < 0) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: falsy condition with greater than or equal operator (is negative)', async assert => {
  var { template } = await compile('<if number is not negative>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number >= 0) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: truthy condition with greater than operator', async assert => {
  var { template } = await compile('<if number is greater than five>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number > 5) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: falsy condition with less than or equal operator', async assert => {
  var { template } = await compile('<if number is not greater than five>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number <= 5) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: truthy condition with greater than or equal operator (is greater than or equals)', async assert => {
  var { template } = await compile('<if number is greater than or equals five>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number >= 5) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: falsy condition with greater than operator (is at most)', async assert => {
  var { template } = await compile('<if number is not at most five>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number > 5) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test('output: falsy condition with greater than operator (is at least)', async assert => {
  var { template } = await compile('<if number is not at least five>{number}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.number < 5) {
        __t += __e(__o.number);
      }
      return __t;
    }
  `))
})

test(`output: variables inside conditions shouldn't be escaped`, async assert => {
  var { template } = await compile('<if foo>{foo}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo) {
        __t += __e(__o.foo);
      }
      return __t;
    }
  `))

  var { template } = await compile('<if foo>{foo}</if><elseif bar>{bar}</elseif><else>{baz}</else>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo) {
        __t += __e(__o.foo);
      } else if (__o.bar) {
        __t += __e(__o.bar);
      } else {
        __t += __e(__o.baz);
      }
      return __t;
    }
  `))  
})

test('output: for loop', async assert => {
  var { template } = await compile('<for foo in bar>{foo}</for>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      for (var a = 0, b = __o.bar.length; a < b; a++) {
        var foo = __o.bar[a];
        __t += __e(foo);
      }
      return __t;
    }
  `))
})

test('output: useless branches are removed', async assert => {
  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "baz"; }`))

  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar={true} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "baz"; }`))

  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar={false} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "qux"; }`))

  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar={null} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "qux"; }`))
})

test('output: useless logical expressions are removed', async assert => {
  var { template } = await compile(`
    <import bar from='./bar.html'>
    <bar foo="foo" />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render() { return "<div class=\\"foo\\">baz</div>"; }
  `))
})

test('output: useless ternary operators are removed', async assert => {
  var { template } = await compile(`
    <import baz from='./baz.html'>
    <baz foo="foo" />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })

  assert.deepEqual(normalize(template.toString()), normalize(`
    function render () { return "foo"; }
  `))
})

test('output: binary expressions with literals are precalculated', async assert => {
  var { template } = await compile('<if 0 equals 0>foo</if>')

  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "foo"; }`))
})

test('output: object inlining', async assert => {
  var { template } = await compile(`
    <template foo>{bar.baz}</template>
    <foo bar="{ { baz: 'qux' } }" />
  `)

  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "qux"; }'))
})

test('output: square syntax for one identifier', async assert => {
  var { template } = await compile(`<div id="[id]"></div>`)
  assert.deepEqual(normalize(template.toString()), normalize(`function render(__o) {
    var __t = "<div id=\\"";
    __t += __o.id || "";;
    __t+= "\\"></div>";
    return __t;
  }`))
})

test('output: undefined options', async assert => {
  const { template } = await compile(`
    <template foo>
      { bar.baz }
    </template>
    <foo/>
    { bar.baz }
  `)
  assert.deepEqual(normalize(template.toString()), normalize(`function render(__o, __e) {
    var __t = "";
    __t += __e(__o.bar.baz);
    return __t;
  }`))
})

test.skip('output: assigning variables', async assert => {
  const { template } = await compile(`
    <template foo>
      <for car in cars>{car}</for>
    </template>
    <foo cars="{['BMW', 'Hyundai']}" />
  `)
  assert.deepEqual(normalize(template.toString()), normalize(`function render(__o, __e) {
    var __t = "";
    var c = ["BMW", "Hyundai"];
    for (var a = 0, b = c.length; a < b; a++) {
      var car = c[a];
      __t += __e(car);
    }
    return __t;
  }`))
})
