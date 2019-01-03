import test from '../helpers/test'
import compile from '../helpers/compile'
import { normalize } from '../helpers/string'
import path from 'path'

test('output: empty string', async assert => {
  const template = await compile('')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return ""; }'))
})

test('output: string', async assert => {
  const template = await compile('foo')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "foo"; }'))
})

test('output: html tag and string', async assert => {
  const template = await compile('<div>foo</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "<div>foo</div>"; }'))
})

test('output: html tag and a curly tag', async assert => {
  const template = await compile('<div>{foo}</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div>"; return __t; }'))
})

test('output: html tags and a curly tag', async assert => {
  const template = await compile('<div>{foo}</div><div>bar</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div><div>bar</div>"; return __t; }'))
})

test('output: truthy condition with strict inequality operator', async assert => {
  const template = await compile('<if foo is present>{foo}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo !== void 0) {
        __t += __e(__o.foo);
      }
      return __t;
    }`
  ))
})

test('output: falsy condition with strict equality operator', async assert => {
  const template = await compile('<if foo is not present>{foo}</if>')
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "";
      if (__o.foo === void 0) {
        __t += __e(__o.foo);
      }
      return __t;
    }
  `))
})

test('output: truthy condition with greater than operator (is positive)', async assert => {
  const template = await compile('<if number is positive>{number}</if>')
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
  const template = await compile('<if number is not positive>{number}</if>')
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
  const template = await compile('<if number is negative>{number}</if>')
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
  const template = await compile('<if number is not negative>{number}</if>')
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
  const template = await compile('<if number is greater than five>{number}</if>')
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
  const template = await compile('<if number is not greater than five>{number}</if>')
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
  const template = await compile('<if number is greater than or equals five>{number}</if>')
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
  const template = await compile('<if number is not at most five>{number}</if>')
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
  const template = await compile('<if number is not at least five>{number}</if>')
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

test('output: useless branches are removed', async assert => {
  let template
  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "baz"; }`))

  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar={true} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "baz"; }`))

  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar={false} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "qux"; }`))

  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar={null} />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`function render() { return "qux"; }`))
})

test('output: useless logical expressions are removed', async assert => {
  let template
  template = await compile(`
    <import bar from='./bar.html'>
    <bar foo="foo" />
  `, {
    paths: [ path.join(__dirname, '../fixtures/import') ]
  })
  assert.deepEqual(normalize(template.toString()), normalize(`
    function render(__o, __e) {
      var __t = "<div class=\\"";
      __t += __e("foo");
      __t += "\\">baz</div>";
      return __t;
    }
  `))
})
