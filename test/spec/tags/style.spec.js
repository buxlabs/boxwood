const test = require('ava')
const compile = require('../../helpers/compile')
const { join } = require('path')
const escape = require('escape-html')

test('style[inline]: inline fonts', async assert => {
  var { template } = await compile(`
    <style inline>
      @font-face {
        font-family: 'Example';
        src: local('Example Regular'), local('Example-Regular'), url(./fonts/Example.ttf) format('truetype');
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:application/font-ttf;charset=utf-8;base64'))
  assert.truthy(output.includes('EABQAlACkAMQHiAeM=) format(\'truetype\')'))
})

test('style[inline]: background image', async assert => {
  var { template } = await compile(`
    <style inline>
      .foo {
        background: url("./images/placeholder.jpg");
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
})

test('style[inline]: multiple background images', async assert => {
  var { template } = await compile(`
    <style inline>
      .foo {
        background: url("./images/placeholder.jpg");
      }
    </style>
    <style inline>
      .bar {
        background: url("./images/placeholder.png");
      }
    </style>    
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.match(/<style>/g).length === 1)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
})

test('style[colors]: custom colors', async assert => {
  var { template } = await compile(`<style>.button { color: red; }</style>`, { styles: { colors: { red: '#FF6347' } } })
  assert.deepEqual(template({}, escape), '<style>.button { color: #FF6347; }</style>')
})

test('style[colors]: mixed colors', async assert => {
  var { template } = await compile(`<style>.button { color: red; } .blue.button { color: myBeautifulBlue; } .yellow.button { color: yellow }</style>`, {
    styles: {
      colors: {
        red: '#FF6347',
        myBeautifulBlue: '#6495ED'
      }
    }
  })
  assert.deepEqual(template({}, escape), `<style>.button { color: #FF6347; } .blue.button { color: #6495ED; } .yellow.button { color: yellow }</style>`)
})

test('style[inline-classes]: one class declaration', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline="classes">
      .foo {
        background: #000;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000"></div>')
})

test('style[inline-classes]: many class declaration', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline="classes">
      .foo {
        background: #000;
        color: #000;
        padding: 100px;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000;color:#000;padding:100px"></div>')
})

test('style[inline-classes]: two classes on the element', async assert => {
  var { template } = await compile(`
    <div class="foo bar"></div>
    <style inline="classes">
      .foo {
        background: #000;
      }
      .bar {
        color: #f0f;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000;color:#f0f"></div>')
})

test('style[inline-classes]: one class used on the element', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline="classes">
      .foo {
        background: #000;
      }
      .bar {
        color: #f0f;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000"></div>')
})

test('style[inline-classes]: only classes should be inlined', async assert => {
  var { template } = await compile(`
    <h1 class="foo"></h1>
    <style inline="classes">
      .foo { color: white }
      #bar { color: red }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<h1 style="color:white"></h1><style>#bar{color:red}</style>')
})

test('style[inline-classes]: rule with many ClassSelector', async assert => {
  var { template } = await compile(`
    <h1 class="foo bar baz"></h1>
    <style inline="classes">
      .foo.bar.baz {
        color: white
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<h1 style="color:white"></h1>')
})

test('style[inline-classes]: rule with font-family declaration', async assert => {
  var { template } = await compile(`
    <h1 class="foo"></h1>
    <style inline="classes">
      .foo {
        font-family: "Nunito"
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<h1 style="font-family:\'Nunito\'"></h1>')
})

test('style[inline-classes]: parent and child should be inlined', async assert => {
  var { template } = await compile(`
    <p class="m-0">
      <span class="bold">
        <i class="italic"></i>
      </span>
    </p>
    <style inline="classes">
      .m-0 {
        margin: 0;
      }
      .bold {
        font-weight: bold;
      }
      .italic {
        font-style: italic;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<p style="margin:0"><span style="font-weight:bold"><i style="font-style:italic"></i></span></p>')
})

test.skip('style[inline-classes]: nested classes', async assert => {
  var { template } = await compile(`
    <div class="foo">
      <div class="bar"></div>
    </div>
    <style inline="classes">
      .foo .bar {
        color: white;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div><div style="color:white;"></div></div>')
})

test('style[inline|scoped]: inlined styles are scoped properly', async assert => {
  const { template } = await compile(`
    <div class="logo"></div>
    <style scoped inline>
    .logo {
      background: url("./images/placeholder.jpg");
      height: 33px;
      width: 120px;
    }
    </style>
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
  assert.truthy(output.includes('<div class="scope-2021582627 logo">'))
  assert.truthy(output.includes('.scope-2021582627.logo'))
})

test('style: does not produce errors', async assert => {
  const { errors } = await compile(`<style>.foo { color: red; }</style>`)
  assert.deepEqual(errors, [])
})
