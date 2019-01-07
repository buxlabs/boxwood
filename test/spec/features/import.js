import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('import', async assert => {
  let template

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
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<render partial="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<render partial="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<head partial="./head.html"></head>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<head><meta charset="utf-8"></head>')

  template = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<span class="glyphicon glyphicon-bar"></span>')

  template = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon><icon foo="baz"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<span class="glyphicon glyphicon-bar"></span><span class="glyphicon glyphicon-baz"></span>')

  template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<input type="checkbox">')

  template = await compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<input type="checkbox">')

  template = await compile(`<import metadata from="./meta.html"><content for title>foo</content><metadata></metadata>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<title>foo</title>')

  template = await compile(`<import layout from="./default.html"/><layout></layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo">foo</div><div class="bar">bar</div><div class="header">header</div><div class="baz">baz</div><div class="qux">qux</div><div class="footer">footer</div>')

  template = await compile(`<import hero from="./hero.html"><hero header="foo" description="bar" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<h1>foo</h1><p>bar</p>')

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
  assert.deepEqual(template({ language: 'pl' }, escape), '<h1>foo</h1><p>baz</p>')
  assert.deepEqual(template({ language: 'en' }, escape), '<h1>bar</h1><p>qux</p>')

  template = await compile(
    `<import section from="./section.html">
     <section background="black" size="big" border="rounded"></section>
     <section class="  "></section>
  `, { paths: [ path.join(__dirname, '../../fixtures/import') ] }
  )
  assert.deepEqual(template({}, escape), `<section class="black big rounded"></section><section class="  "></section>`)

  template = await compile(`
    <import layout from="./blank1.html">
    <layout foo="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ] })

  assert.deepEqual(template({}, escape), `<div class="foo"></div>`)

  template = await compile(`
    <import layout from="./blank2.html">
    <layout class="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ] })

  assert.deepEqual(template({}, escape), `<div class="foo"></div>`)

  template = await compile(`
    <import layout from="./layouts/blank3.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `foo<footer>bar</footer>`)

  template = await compile(`
    <import button from="./components/button1.html">
    <import button2 from="./components/button2.html">
    <button>baz</button>
    <button2>qux</button2>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<button class="foo">baz</button><button class="bar">qux</button>`)

  template = await compile(`
    <import button from="./components/button1.html">
    <import button3 from="./components/button3.html">
    <button>baz</button>
    <button3>quux</button3>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<button class="foo">baz</button><div class="button"><button class="qux">quux</button></div>`)

  template = await compile(`
    <import layout from="./layouts/landscape.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<body><div class="container"><div>foo</div><main>foo</main><footer>bar</footer></div></body>`)

  await assert.throwsAsync(
    compile(`<div partial='./partial.html'/><div>`, {}),
    /Compiler option is undefined: paths\./
  )

  await assert.throwsAsync(
    compile(`<div partial='./partial.html'/><div>`, { paths: [] }),
    /Asset not found: \.\/partial\.html/
  )

  await assert.throwsAsync(
    compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {}),
    /Compiler option is undefined: paths\./
  )

  await assert.throwsAsync(
    compile(`<import checkbox from='./checkbox.html'/><checkbox>`, { paths: [] }),
    /Asset not found: \.\/checkbox\.html/
  )
})

test('import: removes unnecessary whitespace in attribute values ', async assert => {
  const template = await compile(`
    <import list from="./components/list.html">
    <list><li>foo</li></list>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<ul class="unstyled list"><li>foo</li></ul>`)
})

test('import: works with nested components', async assert => {
  const template = await compile(`
    <import section from="./components/section.html">
    <section />
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<ul class="unstyled list"><li>foo</li></ul>`)
})

test('import: nested partial can import components', async assert => {
  const template = await compile(`<import page from="./page.html" /><page />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><button class="btn primary">foo</button></form>')
})

test('import: multiple levels of slots', async assert => {
  const template = await compile(`
    <import form from="./form.html" />
    <import form-group from="./form-group.html" />
    <import label from="./label.html" />
    <import field from="./field.html" />
    <import button from="./button.html" />

    <form>
      <form-group>
        <label>
          <field name="foo" type="text" />
        </label>
        <button>bar</button>
      </form-group>
    </form>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><div class="ui form-group"><label class="ui label"><input type="text" name="foo"></label><button class="btn btn-primary">bar</button></div></form>')
})

test('import: conditional slot', async assert => {
  let template

  template = await compile(`
    <import component from="./conditional-slot.html" />
    <component foo={true}>bar</component>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo">bar</div>')

  template = await compile(`
    <import component from="./conditional-slot.html" />
    <component foo={false}>bar</component>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div class="bar">bar</div>')
})

test('import: import -> partial -> import', async assert => {
  const template = await compile(`
    <import layout from="./basic.html" />
    <layout>baz</layout>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), 'baz<footer><ul class="horizontal"><li>foo</li><li>bar</li></ul></footer>')
})

test('import: same component in different files', async assert => {
  const template = await compile(`
    <import layout from="./simple-landscape.html">
    <import list from="./components/list.html">
    <layout><list><li>foo</li></list></layout>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), '<body><main><ul class=""><li>foo</li></ul></main><footer><ul class="horizontal"><li>bar</li></ul></footer></body>')
})

test('import: same component in two components', async assert => {
  const template = await compile(`
    <import header from='./header.html' />
    <import footer from='./footer.html' />
    <header>foo</header>
    <footer>bar</footer>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import/similar') ]
  })
  assert.deepEqual(template({}, escape), '<div class="segment">foo</div><div class="segment">bar</div>')
})

test('import: same component everywhere', async assert => {
  const template = await compile(`
    <import header from='./header.html'>
    <import footer from='./footer.html'>
    <import segment from='./segment.html'>
    <header>foo</header>
    <footer>bar</footer>
    <segment>baz</segment>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import/similar') ]
  })
  assert.deepEqual(template({}, escape), '<div class="segment">foo</div><div class="segment">bar</div><div class="segment">baz</div>')
})

test('import: boolean attributes', async assert => {
  let template
  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'baz')

  template = await compile(`
    <import foo from='./foo.html'>
    <foo />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'qux')

  template = await compile(`
    <import foo from='./foo.html'>
    <foo bar="baz" />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'baz')
})

test('import: empty attribute', async assert => {
  const template = await compile(`
    <import foo from='./foo.html'>
    <foo bar="" />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'qux')
})

test('import: component with scoped styles', async assert => {
  const template = await compile(`
    <import button from='./button.html'>
    <button block>Send</button>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import/style') ]
  })
  assert.deepEqual(template({}, escape), '<button class="scope-3638639787   block button">Send</button><style>.scope-3638639787.button{cursor:pointer}</style>')
})
