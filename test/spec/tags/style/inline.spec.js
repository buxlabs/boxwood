const test = require('ava')
const { join } = require('path')
const compile = require('../../../helpers/deprecated-compile')
const { escape } = require('../../../..')

test('style[inline]: for jpg', async assert => {
  const { template, warnings, errors } = await compile(`
    <div class="foo"></div>
    <style inline>
      .foo { background: url('./placeholder.jpg') }
    </style>
  `, { paths: [join(__dirname, '../../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<div style="background:url(data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgA+gD6AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJ722tmCyyhWPbrU9VIrZYXuZp9h8xidx7L2BzQBOZoxAZt48sDduHPFV01Wyd1RZssxwBtPX8qohtuiXRGREZGEef7pI/+vVqG9tTIkZhePdwjPHgN9KALc9zDbKGmkCA9PenQzRzxiSJwynuKpogm1iZnG7yUVVB7Z5ogUQavNGgwskYkwOmc4oAv0VWvjOlsZLdsOh3EYzuHcVBFePeXUYt2xCq7pTgHk9FoA0Krf2haCbyvPXfnGPf61NKrNE6ocMVIB9DWfcQQWujmKQJu2YGB1f2/GgC/NNHbxGSVtqDqcZqGLUrSeVY45dzt0G0j+lVr1/L0618/OS8e/wBfU/yqa3vLeWcR+S8Uh5USJtJ+lAE1xeW9qQJpQpPQdT+lSo6yIHRgynoRVGzRZru7ncBmEhjGewFLYKIrm7t14RHDKPTIzQBfooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJmmhuryRLmdUgibaIycbz3JrWqFrS2ZizW8RJOSSg5oAhmuoUszJEiTRIQCF6Af/Wqvf3MF1AkEDiSWR12he3PX2rRSKOJSscaop5IUYFIkEUbFo4kQnqVUCgCk0q2eqyNKdsc6DDHpkdqW1cXOozXKcxKgjVvXnJq88aSLtkRWX0YZFKqqihVUKo6ADAoAgvbgWtq0mMt0UepNUdPV7C5+yy4/fKHU/wC13FajxpIVLorFTkZGcGho0cqXRWKnKkjOD7UAEjiONnbooJNZVtLbSuLq7uI2lPKoW4j/AA9a1mUMpVgCCMEHvUP2O1/59of+/YoAZdXUcKQysgeJmHz/AN30NV7ieK6u7SOBg7rJvYrzhR15rQ2Js2bV2Yxtxxikjhjiz5caJnrtUCgChDPHZ3lzFOwQO/mIx6HPWpNOJlkubrBCyuNue4HGatyRRygCSNXA6bhmngAAADAFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q==)"></div>`)
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])
})

test('style[inline]: for svg', async assert => {
  const { template, warnings, errors } = await compile(`
    <div class="foo"></div>
    <style inline>
      .foo { background: url('./placeholder.svg') }
    </style>
  `, { paths: [join(__dirname, '../../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<div style="background:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==)"></div>`)
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])
})

test.skip('style[inline]: styles on tags', async assert => {
  const { template } = await compile(`
    <h1>foo</h1>
    <style inline>
      h1 {
        color: red;
      }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<h1 style="color:red;">foo</h1>')
})

test('style[inline]: inline fonts', async assert => {
  var { template } = await compile(`
    <style inline>
      @font-face {
        font-family: 'Example';
        src: local('Example Regular'), local('Example-Regular'), url(./fonts/Example.ttf) format('truetype');
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:application/font-ttf;charset=utf-8;base64'))
  assert.truthy(output.includes('EABQAlACkAMQHiAeM=) format(\'truetype\')'))
})

test('style[inline]: background image', async assert => {
  var { template, warnings, errors } = await compile(`
    <div class="foo"></div>
    <style inline>
      .foo {
        background: url("./images/placeholder.jpg");
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../../fixtures') ]
  })
  const output = template({}, escape)
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
})

test('style[inline]: multiple background images', async assert => {
  var { template, warnings, errors } = await compile(`
    <div class="foo"></div>
    <div class="bar"></div>
    <style inline>
      .foo {
        background: url("./images/placeholder.jpg");
      }
      .bar {
        background: url("./images/placeholder.png");
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
})


test('style[inline]: one class declaration', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline>
      .foo {
        background: #000;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000"></div>')
})

test('style[inline]: many class declaration', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline>
      .foo {
        background: #000;
        color: #000;
        padding: 100px;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div style="background:#000;color:#000;padding:100px"></div>')
})

test('style[inline]: two classes on the element', async assert => {
  var { template } = await compile(`
    <div class="foo bar"></div>
    <style inline>
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

test('style[inline]: one class used on the element', async assert => {
  var { template } = await compile(`
    <div class="foo"></div>
    <style inline>
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

test('style[inline]: only classes should be inlined', async assert => {
  var { template } = await compile(`
    <h1 class="foo"></h1>
    <style inline>
      .foo { color: white }
      #bar { color: red }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<h1 style="color:white"></h1><style>#bar{color:red}</style>')
})

test('style[inline]: rule with many ClassSelector', async assert => {
  var { template } = await compile(`
    <h1 class="foo bar baz"></h1>
    <style inline>
      .foo.bar.baz {
        color: white
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<h1 style="color:white"></h1>')
})

test('style[inline]: rule with font-family declaration', async assert => {
  var { template, warnings, errors } = await compile(`
    <h1 class="foo"></h1>
    <style inline>
      .foo {
        font-family: "Nunito"
      }
    </style>
  `, {})
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
  assert.deepEqual(template({}, escape), '<h1 style="font-family:\'Nunito\'"></h1>')
})

test('style[inline]: parent and child should be inlined', async assert => {
  var { template } = await compile(`
    <p class="m-0">
      <span class="bold">
        <i class="italic"></i>
      </span>
    </p>
    <style inline>
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

test.skip('style[inline]: nested classes', async assert => {
  var { template } = await compile(`
    <div class="foo">
      <div class="bar"></div>
    </div>
    <style inline>
      .foo .bar {
        color: white;
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div><div style="color:white;"></div></div>')
})

test('style[inline]: inlining few styles', async assert => {
  const { template } = await compile(`
    <div class="logo"></div>
    <style inline>
    .logo {
      background: url("./images/placeholder.jpg");
      height: 33px;
      width: 120px;
    }
    </style>
  `, {
    paths: [ join(__dirname, '../../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:image/jpg;base64'))
  assert.truthy(output.includes('FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q=='))
})
