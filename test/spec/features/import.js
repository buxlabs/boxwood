import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'

test('import', async assert => {
  let template, exception

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`,
    { paths: [ path.join(__dirname, '../../fixtures/import') ]
    })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header></sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><div>foo</div></aside>bar</body></html>')

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header><header>foo</header></sidebar>baz</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><div>foo</div><div>foo</div></aside>baz</body></html>')

  template = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import button from='./button.html'/><layout><sidebar><button>foo</button></sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><button class="btn btn-primary">foo</button></aside>bar</body></html>')

  template = await compile(`<import button from="./button.html"/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  template = await compile(`<import button from="./button.html"/><button>foo</button><button>bar</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button><button class="btn btn-primary">bar</button>')

  template = await compile(`<import button from='./button.html'/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  template = await compile(`<import button from='./button.html'/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  template = await compile(`<require button from="./button.html"/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  template = await compile(`<import header from="./header.html"/><header><slot title>foo</slot><slot subtitle>bar</slot></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1>foo</h1><h2>bar</h2></header>')

  template = await compile(`<import header from="./header.html"/><header><slot title>foo</slot></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1>foo</h1><h2></h2></header>')

  template = await compile(`<import header from="./header.html"/><header></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1></h1><h2></h2></header>')

  template = await compile(`<import header from="./header.html"/><header></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/yields') ]
  })
  assert.deepEqual(template({}), '<header><h1></h1><h2></h2></header>')

  template = await compile(`<import select from="./select.html"/><select></select>`, {
    paths: [ path.join(__dirname, '../../fixtures/select') ]
  })
  assert.deepEqual(template({}), '<select class="form-control" name="type"><option value="offer" selected>offer</option><option value="search">search</option></select>')

  template = await compile(`<import layout from='./layout.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><main>bar</main><div>baz</div>')

  template = await compile(`<import layout from='./layout-with-render.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  template = await compile(`<import layout from='./layout-with-require.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><main>bar</main><div>baz</div>')

  template = await compile(`<import layout from='./layout-with-partial-attribute.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  template = await compile(`<import layout from='./layout-with-partial.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  template = await compile(`<partial from="./terms.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  template = await compile(`<partial from="./footer.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  template = await compile(`<partial from="./header.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<partial from="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<partial from="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<render partial="./terms.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  template = await compile(`<render partial="./footer.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  template = await compile(`<render partial="./header.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<render partial="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<render partial="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, html => html), '<div>foo</div>')

  template = await compile(`<head partial="./head.html"></head>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<head><meta charset="utf-8"></head>')

  template = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<span class="glyphicon glyphicon-bar"></span>')

  template = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon><icon foo="baz"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<span class="glyphicon glyphicon-bar"></span><span class="glyphicon glyphicon-baz"></span>')

  template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<input type="checkbox">')

  template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<input type="checkbox">')

  template = await compile(`<import metadata from="./meta.html"><content for title>foo</content><metadata></metadata>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<title>foo</title>')

  template = await compile(`<import layout from="./default.html"/><layout></layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, html => html), '<div class="foo">foo</div><div class="bar">bar</div><div class="header">header</div><div class="baz">baz</div><div class="qux">qux</div><div class="footer">footer</div>')

  template = await compile(`<import hero from="./hero.html"><hero header="foo" description="bar" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, html => html), '<h1>foo</h1><p>bar</p>')

  template = await compile(`
    <script i18n>
    export default {
      header: ['foo', 'bar'],
      description: ['baz', 'qux']
    }
    </script>
    <import hero from="./hero.html">
    <hero header="{'header' | translate}" description="{'description' | translate}" />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, html => html), '<h1>foo</h1><p>baz</p>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<h1>bar</h1><p>qux</p>')

  template = await compile(
    `<import section from="./section.html">
     <section background="black" size="big" border="rounded"></section>
     <section class="  "></section>
  `, { paths: [ path.join(__dirname, '../../fixtures/import') ]}
  )
  assert.deepEqual(template({}, html => html), `<section class="black big rounded"></section><section class="  "></section>`)

  template = await compile(`
    <import layout from="./blank1.html">
    <layout foo="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ]})

  assert.deepEqual(template({}, html => html), `<div class="foo"></div>`)

  template = await compile(`
    <import layout from="./blank2.html">
    <layout class="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ]})

  assert.deepEqual(template({}, html => html), `<div class="foo"></div>`)

  template = await compile(`
    <import layout from="./layouts/blank3.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  assert.deepEqual(template({}, html => html), `foo<footer>bar</footer>`)

  template = await compile(`
    <import button from="./components/button1.html">
    <import button2 from="./components/button2.html">
    <button>baz</button>
    <button2>qux</button2>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  assert.deepEqual(template({}, html => html), `<button class="foo">baz</button><button class="bar">qux</button>`)

  template = await compile(`
    <import button from="./components/button1.html">
    <import button3 from="./components/button3.html">
    <button>baz</button>
    <button3>quux</button3>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  assert.deepEqual(template({}, html => html), `<button class="foo">baz</button><div class="button"><button class="qux">quux</button></div>`)

  template = await compile(`
    <import list from="./components/list.html">
    <list><li>foo</li></list>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  // TODO can we remove the unnecessary whitespace?
  assert.deepEqual(template({}, html => html), `<ul class="unstyled   list"><li>foo</li></ul>`)

  // template = await compile(`
  //   <import section from="./components/section.html">
  //   <section />
  // `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  // assert.deepEqual(template({}, html => html), `<ul class="unstyled   list"><li>foo</li></ul>`)

  template = await compile(`
    <import layout from="./layouts/landscape.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  assert.deepEqual(template({}, html => html), `<body><div class="container"><div>foo</div><main>foo</main><footer>bar</footer></div></body>`)

  try {
    template = await compile(`
      <import link from='./components/link.html'>
      <link href="#" color="blue" decoration="underlined">foo</link>
    `, { paths: [ path.join(__dirname, '../../fixtures') ]})
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Forbidden component name: link\. Reason: this tag is self closing\./)

  try {
    template = await compile(`<partial from='./partial.html'/><partial>`, {})
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Compiler option is undefined: paths\./)

  try {
    template = await compile(`<partial from='./partial.html'/><partial>`, { paths: [] })
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Asset not found: \.\/partial\.html/)

  try {
    template = await compile(`<div partial='./partial.html'/><div>`, {})
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Compiler option is undefined: paths\./)

  try {
    template = await compile(`<div partial='./partial.html'/><div>`, { paths: [] })
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Asset not found: \.\/partial\.html/)

  try {
    template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {})
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Compiler option is undefined: paths\./)

  try {
    template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, { paths: [] })
  } catch (error) {
    exception = error
  }
  assert.regex(exception.message, /Asset not found: \.\/checkbox\.html/)
})
