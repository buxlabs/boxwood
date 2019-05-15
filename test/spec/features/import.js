import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'
import Server from '../../helpers/Server'
import request from "axios"
import fs from "fs"

test('import', async assert => {
  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`,
    { paths: [ path.join(__dirname, '../../fixtures/import') ]
    })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside>foo</aside>bar</body></html>')

  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header></sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><div>foo</div></aside>bar</body></html>')

  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header><header>foo</header></sidebar>baz</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><div>foo</div><div>foo</div></aside>baz</body></html>')

  var { template } = await compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import button from='./button.html'/><layout><sidebar><button>foo</button></sidebar>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<html><body><aside><button class="btn btn-primary">foo</button></aside>bar</body></html>')

  var { template } = await compile(`<import button from="./button.html"/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  var { template } = await compile(`<import button from="./button.html"/><button>foo</button><button>bar</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button><button class="btn btn-primary">bar</button>')

  var { template } = await compile(`<import button from='./button.html'/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  var { template } = await compile(`<import button from='./button.html'/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  var { template } = await compile(`<require button from="./button.html"/><button>foo</button>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<button class="btn btn-primary">foo</button>')

  var { template } = await compile(`<import header from="./header.html"/><header><slot title>foo</slot><slot subtitle>bar</slot></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1>foo</h1><h2>bar</h2></header>')

  var { template } = await compile(`<import header from="./header.html"/><header><slot title>foo</slot></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1>foo</h1><h2></h2></header>')

  var { template } = await compile(`<import header from="./header.html"/><header></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/slots') ]
  })
  assert.deepEqual(template({}), '<header><h1></h1><h2></h2></header>')

  var { template } = await compile(`<import header from="./header.html"/><header></header>`, {
    paths: [ path.join(__dirname, '../../fixtures/yields') ]
  })
  assert.deepEqual(template({}), '<header><h1></h1><h2></h2></header>')

  var { template } = await compile(`<import select from="./select.html"/><select></select>`, {
    paths: [ path.join(__dirname, '../../fixtures/select') ]
  })
  assert.deepEqual(template({}), '<select class="form-control" name="type"><option value="offer" selected>offer</option><option value="search">search</option></select>')

  var { template } = await compile(`<import layout from='./layout.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><main>bar</main><div>baz</div>')

  var { template } = await compile(`<import layout from='./layout-with-render.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  var { template } = await compile(`<import layout from='./layout-with-require.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><main>bar</main><div>baz</div>')

  var { template } = await compile(`<import layout from='./layout-with-partial-attribute.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  var { template } = await compile(`<import layout from='./layout-with-partial.html'/><layout>bar</layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

  var { template } = await compile(`<render partial="./terms.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  var { template } = await compile(`<render partial="./footer.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  var { template } = await compile(`<render partial="./header.html"></render>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  var { template } = await compile(`<render partial="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  var { template } = await compile(`<render partial="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  var { template } = await compile(`<head partial="./head.html"></head>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<head><meta charset="utf-8"></head>')

  var { template } = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<span class="glyphicon glyphicon-bar"></span>')

  var { template } = await compile(`<import icon from="./icon.html" /><icon foo="bar"></icon><icon foo="baz"></icon>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<span class="glyphicon glyphicon-bar"></span><span class="glyphicon glyphicon-baz"></span>')

  var { template } = await compile(`<import checkbox from='./checkbox.html'/><checkbox/>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<input type="checkbox">')

  var { template } = await compile(`<import checkbox from='./checkbox.html'/><checkbox/>`, {
    paths: [ path.join(__dirname, '../../fixtures/import'), path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<input type="checkbox">')

  var { template } = await compile(`<import metadata from="./meta.html"><content for title>foo</content><metadata></metadata>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<title>foo</title>')

  var { template } = await compile(`<import layout from="./default.html"/><layout></layout>`, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo">foo</div><div class="bar">bar</div><div class="header">header</div><div class="baz">baz</div><div class="qux">qux</div><div class="footer">footer</div>')

  var { template } = await compile(`<import hero from="./hero.html"><hero header="foo" description="bar" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<h1>foo</h1><p>bar</p>')

  var { template } = await compile(`
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

  var { template } = await compile(
    `<import section from="./section.html">
     <section background="black" size="big" border="rounded"></section>
     <section class="  "></section>
  `, { paths: [ path.join(__dirname, '../../fixtures/import') ] }
  )
  assert.deepEqual(template({}, escape), `<section class="black big rounded"></section><section></section>`)

  var { template } = await compile(`
    <import layout from="./blank1.html">
    <layout foo="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ] })

  assert.deepEqual(template({}, escape), `<div class="foo"></div>`)

  var { template } = await compile(`
    <import layout from="./blank2.html">
    <layout class="foo"></layout>
  `, { paths: [ path.join(__dirname, '../../fixtures/layouts') ] })

  assert.deepEqual(template({}, escape), `<div class="foo"></div>`)

  var { template } = await compile(`
    <import layout from="./layouts/blank3.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `foo<footer><ul class="horizontal"><li>bar</li></ul></footer>`)

  var { template } = await compile(`
    <import button from="./components/button1.html">
    <import button2 from="./components/button2.html">
    <button>baz</button>
    <button2>qux</button2>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<button class="foo">baz</button><button class="bar">qux</button>`)

  var { template } = await compile(`
    <import button from="./components/button1.html">
    <import button3 from="./components/button3.html">
    <button>baz</button>
    <button3>quux</button3>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<button class="foo">baz</button><div class="button"><button class="qux">quux</button></div>`)

  var { template } = await compile(`
    <import layout from="./layouts/landscape.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<body><div class="container"><div>foo</div><main>foo</main><footer>bar</footer></div></body>`)
})

test('import: removes unnecessary whitespace in attribute values ', async assert => {
  var { template } = await compile(`
    <import list from="./components/list.html">
    <list><li>foo</li></list>
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<ul class="unstyled list"><li>foo</li></ul>`)
})

test('import: works with nested components', async assert => {
  var { template } = await compile(`
    <import section from="./components/section.html">
    <section />
  `, { paths: [ path.join(__dirname, '../../fixtures') ] })

  assert.deepEqual(template({}, escape), `<ul class="unstyled list"><li>foo</li></ul>`)
})

test('import: nested partial can import components', async assert => {
  var { template } = await compile(`<import page from="./page.html" /><page />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><button class="btn primary">foo</button></form>')
})

test('import: multiple levels of slots', async assert => {
  var { template } = await compile(`
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
  var { template } = await compile(`
    <import component from="./conditional-slot.html" />
    <component foo={true}>bar</component>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo">bar</div>')

  var { template } = await compile(`
    <import component from="./conditional-slot.html" />
    <component foo={false}>bar</component>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div class="bar">bar</div>')
})

test('import: import -> partial -> import', async assert => {
  var { template } = await compile(`
    <import layout from="./basic.html" />
    <layout>baz</layout>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), 'baz<footer><ul class="horizontal"><li>foo</li><li>bar</li></ul></footer>')
})

test('import: same component in different files', async assert => {
  var { template } = await compile(`
    <import layout from="./simple-landscape.html">
    <import list from="./components/list.html">
    <layout><list><li>foo</li></list></layout>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/layouts') ]
  })
  assert.deepEqual(template({}, escape), '<body><main><ul><li>foo</li></ul></main><footer><ul class="horizontal"><li>bar</li></ul></footer></body>')
})

test('import: same component in two components', async assert => {
  var { template } = await compile(`
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
  var { template } = await compile(`
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
  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'baz')

  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'qux')

  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar="baz" />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'baz')
})

test('import: empty attribute', async assert => {
  var { template } = await compile(`
    <import foo from='./foo.html'>
    <foo bar="" />
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), 'qux')
})

test('import: component with scoped styles', async assert => {
  var { template } = await compile(`
    <import button from='./button.html'>
    <button block>Send</button>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import/style') ]
  })
  assert.deepEqual(template({}, escape), '<button class="scope-2412184555 block button">Send</button><style>.scope-2412184555.button{cursor:pointer}</style>')
})

test('import: self closing component', async assert => {
  var { template } = await compile(`
    <import input from='./input.html'>
    <input type="text">
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<input type="text" maxlength="30">')

  var { template } = await compile(`
    <import input from='./input.html'>
    <div><input type="text"/></div>
    <div>foo</div>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div><input type="text" maxlength="30"></div><div>foo</div>')

  var { template } = await compile(`
    <import header from='./header2.html'>
    <import label from='./label.html'>
    <import input from='./input.html'>
    <header>
      <div>
        <label>foo</label>
        <input type="text"/>
      </div>
      <div>
        <label>bar</label>
        baz
      </div>
    </header>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<header><div><label class="ui label">foo</label><input type="text" maxlength="30"></div><div><label class="ui label">bar</label>baz</div></header>')
})

test('import: self closing component for the require tag', async assert => {
  var { template } = await compile(`
    <require input from='./input.html'>
    <input type="text">
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<input type="text" maxlength="30">')

  var { template } = await compile(`
    <require input from='./input.html'>
    <div><input type="text"/></div>
    <div>foo</div>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<div><input type="text" maxlength="30"></div><div>foo</div>')

  var { template } = await compile(`
    <require header from='./header2.html'>
    <require label from='./label.html'>
    <require input from='./input.html'>
    <header>
      <div>
        <label>foo</label>
        <input type="text"/>
      </div>
      <div>
        <label>bar</label>
        baz
      </div>
    </header>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/import') ]
  })
  assert.deepEqual(template({}, escape), '<header><div><label class="ui label">foo</label><input type="text" maxlength="30"></div><div><label class="ui label">bar</label>baz</div></header>')
})

test('import: inlined values should not propagate to imported components', async assert => {
  var { template } = await compile(`
    <import foo from='./foo.html'>
    <import bar from='./bar.html'>
    <foo foo='foo'>
      <bar>baz</bar>
    </foo>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/attributes') ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo"><div>baz</div></div>')
})

test('import: passing variables to components with different name', async assert => {
  var { template } = await compile(`<import foo from='./foo.html'><foo foo="{bar}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(template({ bar: 'baz' }, escape), '<div class="baz"></div>')
})

test('import: passing variables to components with same name', async assert => {
  var { template } = await compile(`<import foo from='./foo.html'><foo foo="{foo}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(template({ foo: 'foo' }, escape), '<div class="foo"></div>')
})

test('import: passing objects', async assert => {
  var { template } = await compile(`<import bar from='./bar.html'><bar bar="{baz}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(template({ baz: { qux: 'quux' } }, escape), '<div class="quux"></div>')
})

test('import: passing objects with same name', async assert => {
  var { template } = await compile(`<import bar from='./bar.html'><bar bar="{bar}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(template({ bar: { qux: 'quux' } }, escape), '<div class="quux"></div>')
})

test('import: importing multiple components within one import tag', async assert => {
  var { template } = await compile(`<import {foo} from="."><foo />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo')

  var { template } = await compile(`<import {foo-bar} from="."><foo-bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo-bar')

  var { template } = await compile(`<import { foo } from="."><foo />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo')

  var { template } = await compile(`<import { foo-bar } from="."><foo-bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo-bar')

  var { template } = await compile(`<import {    foo    } from="."><foo />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo')

  var { template } = await compile(`<import {    foo-bar   } from="."><foo-bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foo-bar')

  var { template } = await compile(`<import { foo, bar } from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import {foo, bar} from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import {foo,bar} from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import foo,bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import foo, bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import foo ,bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import foo , bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<import { baz, qux } from="./components"><baz /><qux />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'bazqux')

  var { template } = await compile(`<require { foo, bar } from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require {foo, bar} from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require {foo,bar} from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require foo,bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require foo, bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require foo ,bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require foo , bar from="."><foo /><bar />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'foobar')

  var { template } = await compile(`<require { baz, qux } from="./components"><baz /><qux />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/multiple') ]
  })
  assert.deepEqual(template({}, escape), 'bazqux')
})

test('import: should add the component path to the statistics', async assert => {
  var { statistics } = await compile(`<import bar from='./bar.html'><bar bar="{bar}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/import/variables/bar.html')])
})

test('import: should add the partial path to the statistics', async assert => {
  var { statistics } = await compile(`<partial from='./bar.html'/>`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/import/variables/bar.html')])
})

test('import: should add the partial attribute path to the statistics', async assert => {
  var { statistics } = await compile(`<div partial='./bar.html'></div>`, {
    paths: [ path.join(__dirname, '../../fixtures/import/variables') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/import/variables/bar.html')])
})

test('import: should add the inline script path to the statistics', async assert => {
  var { statistics } = await compile(`<script src='./foo.js' inline></script>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.js')])
})

test('import: if compiler inline options includes scripts', async assert => {
  var { statistics } = await compile(`<script src='./foo.js'></script>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ],
    inline: ['scripts']
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.js')])
})

test('import: should add the inline link path to the statistics', async assert => {
  var { statistics } = await compile(`<link href='./foo.css' inline>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.css')])
})

test('import: if compiler inline options includes stylesheets', async assert => {
  var { statistics } = await compile(`<link href='./foo.css'>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ],
    inline: ['stylesheets']
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.css')])
})

test('import: should add the inline svg path to the statistics', async assert => {
  var { statistics } = await compile(`<svg from='./foo.svg'>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.svg')])
})

test('import: should add the inline image path to the statistics', async assert => {
  var { statistics } = await compile(`<img src='./foo.jpg' inline>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.jpg')])
})

test('import: if compiler inline options includes images', async assert => {
  var { statistics } = await compile(`<img src='./foo.jpg'>`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ],
    inline: ['images']
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.jpg')])
})

test('import: should add the auto width image path to the statistics', async assert => {
  var { statistics } = await compile(`<img src='./foo.jpg' width="auto">`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.jpg')])
})

test('import: should add the auto height image path to the statistics', async assert => {
  var { statistics } = await compile(`<img src='./foo.jpg' height="auto">`, {
    paths: [ path.join(__dirname, '../../fixtures/Importer') ]
  })
  assert.deepEqual(statistics.assets, [path.join(__dirname, '../../fixtures/Importer/foo.jpg')])
})

test('import: should be possible to download components via http', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/foo.html', (req, res) => {
    res.send('<div>foo</div>')
  })
  const response = await request.get(`http://localhost:${port}/foo.html`)
  assert.deepEqual(response.data, '<div>foo</div>')
  var { template } = await compile(`<import foo from="http://localhost:${port}/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '<div>foo</div>')
  await server.stop()
})

test('import: should be possible to download nested components', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.html', (req, res) => {
    res.send('<import bar from="./bar.html"><bar/>')
  })
  server.get('/baz/bar.html', (req, res) => {
    res.send('<div>bar</div>')
  })
  var { template } = await compile(`<import foo from="http://localhost:${port}/baz/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '<div>bar</div>')
  await server.stop()
})

test('import: should be possible to download deep nested components', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.html', (req, res) => {
    res.send('<import bar from="./bar.html"><bar/>')
  })
  server.get('/baz/bar.html', (req, res) => {
    res.send('<import ban from="./ban.html"><ban/>')
  })
  server.get('/baz/ban.html', (req, res) => {
    res.send('<div>ban</div>')
  })
  var { template } = await compile(`<import foo from="http://localhost:${port}/baz/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '<div>ban</div>')
  await server.stop()
})

test('import: should be possible to download components from many servers', async assert => {
  var server1 = new Server()
  var server2 = new Server()
  var { port: port1 } = await server1.start()
  var { port: port2 } = await server2.start()
  server1.get('/baz/foo.html', (req, res) => {
    res.send(`<import bar from="http://localhost:${port2}/baz/bar.html"><bar/>`)
  })
  server2.get('/baz/bar.html', (req, res) => {
    res.send('<div>bar</div>')
  })
  var { template } = await compile(`<import foo from="http://localhost:${port1}/baz/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '<div>bar</div>')
  await server1.stop()
  await server2.stop()
})

test('import: should be possible to download components from three servers', async assert => {
  var server1 = new Server()
  var server2 = new Server()
  var server3 = new Server()
  var { port: port1 } = await server1.start()
  var { port: port2 } = await server2.start()
  var { port: port3 } = await server3.start()
  server1.get('/baz/foo.html', (req, res) => {
    res.send(`<import bar from="http://localhost:${port2}/baz/bar.html"><bar/>`)
  })
  server2.get('/baz/bar.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port3}/baz/baz.html"><baz/>`)
  })
  server3.get('/baz/baz.html', (req, res) => {
    res.send(`<div>baz</div>`)
  })
  var { template } = await compile(`<import foo from="http://localhost:${port1}/baz/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '<div>baz</div>')
  await server1.stop()
  await server2.stop()
  await server3.stop()
})

test('import: should be possible to load remote svgs', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.svg', (req, res) => {
    res.sendFile(path.join(__dirname, '../../fixtures/svg/rectangle.svg'))
  })
  var { template } = await compile(`<img src="http://localhost:${port}/baz/foo.svg" inline />`, {
    paths: []
  })
  assert.truthy(template({}, escape).includes('base64'))
  assert.truthy(template({}, escape).includes('DAsMCkiIC8+PC9zdmc+Cg=='))
  await server.stop()
})

test('import: should be possible to load remote images', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../../fixtures/images/placeholder.png'))
  })
  var { template } = await compile(`<img src="http://localhost:${port}/baz/foo.png" inline />`, {
    paths: []
  })
  assert.truthy(template({}, escape).includes('base64'))
  assert.truthy(template({}, escape).includes('RU5ErkJggg=='))
  await server.stop()
})

test('import: should be possible to load remote fonts', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.ttf', (req, res) => {
    res.sendFile(path.join(__dirname, '../../fixtures/fonts/Example.ttf'))
  })
  var { template } = await compile(`
    <style inline>
      @font-face {
        font-family: 'Example';
        src: local('Example Regular'), local('Example-Regular'), url(http://localhost:${port}/baz/foo.ttf) format('truetype');
      }
    </style>
  `, {
    paths: [ path.join(__dirname, '../../fixtures') ]
  })
  const output = template({}, escape)
  assert.truthy(output.includes('url(data:application/font-ttf;charset=utf-8;base64'))
  assert.truthy(output.includes('EABQAlACkAMQHiAeM=) format(\'truetype\')'))
  await server.stop()
})

test('import: should be possible to load remote styles', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../../fixtures/stylesheets/foo.css'))
  })
  var { template } = await compile(`<link href="http://localhost:${port}/baz/foo.css" inline>`)
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
  await server.stop()
})

test.skip('import: should render nothing for 404', async assert => {
  var server = new Server()
  var { port } = await server.start()
  var { template, warnings } = await compile(`<link href="http://localhost:${port}/baz/foo.css" inline>`)
  assert.deepEqual(template({}, escape), '')
  assert.deepEqual(warnings[0].type, 'COMPONENT_NOT_FOUND')
  assert.deepEqual(warnings[0].message, `Component not found: http://localhost:${port}/baz/foo.css`)
  await server.stop()
})

test('import: should handle circular deps', async assert => {
  var server1 = new Server()
  var server2 = new Server()
  var { port: port1 } = await server1.start()
  var { port: port2 } = await server2.start()
  server1.get('/baz/foo.html', (req, res) => {
    res.send(`<import bar from="http://localhost:${port2}/baz/bar.html"><bar/>`)
  })
  server2.get('/baz/bar.html', (req, res) => {
    res.send(`<import foo from="http://localhost:${port1}/baz/foo.html"><foo/>`)
  })
  var { template, warnings } = await compile(`<import foo from="http://localhost:${port1}/baz/foo.html"><foo/>`, {
    paths: []
  })
  assert.deepEqual(template({}, escape), '')
  assert.deepEqual(warnings[0].type, 'MAXIMUM_IMPORT_DEPTH_EXCEEDED')
  await server1.stop()
  await server2.stop()
})

test('import: many components loading the same remote component', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">foo<baz/>`)
  })
  server.get('/baz/bar.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">bar<baz/>`)
  })
  server.get('/baz/baz.html', (req, res) => {
    res.send(`<div>baz</div>`)
  })
  var { template } = await compile(`
    <import foo from="http://localhost:${port}/baz/foo.html"><foo/>
    <import bar from="http://localhost:${port}/baz/bar.html"><bar/>
    `, { paths: [] }
  )
  assert.deepEqual(template({}, escape), 'foo<div>baz</div>bar<div>baz</div>')
  await server.stop()
})

test('import: should be possible to disable a cache', async assert => {
  var count = 0
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">foo<baz/>`)
  })
  server.get('/baz/bar.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">bar<baz/>`)
  })
  server.get('/baz/baz.html', (req, res) => {
    res.send(`<div>${count === 0 ? 'baz' : 'qux'}</div>`)
    count += 1
  })
  var { template } = await compile(`
    <import foo from="http://localhost:${port}/baz/foo.html"><foo/>
    <import bar from="http://localhost:${port}/baz/bar.html"><bar/>
    `, { paths: [], cache: false }
  )
  assert.deepEqual(template({}, escape), 'foo<div>qux</div>bar<div>qux</div>')
  await server.stop()
})

test('import: caches remotes components', async assert => {
  var count = 0
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">foo<baz/>`)
  })
  server.get('/baz/bar.html', (req, res) => {
    res.send(`<import baz from="http://localhost:${port}/baz/baz.html">bar<baz/>`)
  })
  server.get('/baz/baz.html', (req, res) => {
    res.send(`<div>${count === 0 ? 'baz' : 'qux'}</div>`)
    count += 1
  })
  var { template } = await compile(`
    <import foo from="http://localhost:${port}/baz/foo.html"><foo/>
    <import bar from="http://localhost:${port}/baz/bar.html"><bar/>
    `, { paths: [] }
  )
  assert.deepEqual(template({}, escape), 'foo<div>baz</div>bar<div>baz</div>')
  await server.stop()
})

test('import: it is possible to disable cache of local components', async assert => {
  var count = 0
  var location = path.join(__dirname, '../../fixtures/dynamic/baz.html')
  var { template } = await compile(`
    <import foo from="./foo.html"><foo/>
    <import bar from="./nested/bar.html"><bar/>
    `, {
      paths: [path.join(__dirname, '../../fixtures/dynamic')],
      cache: false,
      hooks: {
        onBeforeFile (filepath) {
          if (filepath === location) {
            if (count === 0) {
              fs.writeFileSync(location, 'baz')
            } else {
              fs.writeFileSync(location, 'qux')
            }
            count += 1
          }
        }
      }
    }
  )
  assert.deepEqual(template({}, escape), 'quxqux')
})

test('import: caches local components', async assert => {
  var count = 0
  var location = path.join(__dirname, '../../fixtures/dynamic/baz.html')
  var { template } = await compile(`
    <import foo from="./foo.html"><foo/>
    <import bar from="./nested/bar.html"><bar/>
    `, {
      paths: [path.join(__dirname, '../../fixtures/dynamic')],
      hooks: {
        onBeforeFile (filepath) {
          if (filepath === location) {
            if (count === 0) {
              fs.writeFileSync(location, 'baz')
            } else {
              fs.writeFileSync(location, 'qux')
            }
            count += 1
          }
        }
      }
    }
  )
  assert.deepEqual(template({}, escape), 'bazbaz')
})

test('import: should be possible to load remote styles with aliases', async assert => {
  var server = new Server()
  var { port } = await server.start()
  server.get('/baz/foo.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../../fixtures/stylesheets/foo.css'))
  })
  var { template } = await compile(`<link href="example/baz/foo.css" inline>`, {
    aliases: 
    [
      {
        from: /^example\//,
        to: `http://localhost:${port}/`
      }
    ]
  })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
  await server.stop()
})
