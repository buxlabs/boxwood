const { equal, deepStrictEqual, throws } = require('assert')
const { compile } = require('../..')
const path = require('path')
const { readFileSync } = require('fs')

console.time('import')

equal(compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<html><body><aside>foo</aside>bar</body></html>')

equal(compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><layout><sidebar>foo</sidebar>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<html><body><aside>foo</aside>bar</body></html>')

equal(compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header></sidebar>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<html><body><aside><div>foo</div></aside>bar</body></html>')

equal(compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import header from='./header.html'/><layout><sidebar><header>foo</header><header>foo</header></sidebar>baz</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<html><body><aside><div>foo</div><div>foo</div></aside>baz</body></html>')

equal(compile(`<import layout from='./blank.html'/><import sidebar from='./sidebar.html'/><import button from='./button.html'/><layout><sidebar><button>foo</button></sidebar>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<html><body><aside><button class="btn btn-primary">foo</button></aside>bar</body></html>')

equal(compile(`<import button from="./button.html"/><button>foo</button>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<button class="btn btn-primary">foo</button>')

equal(compile(`<import button from="./button.html"/><button>foo</button><button>bar</button>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<button class="btn btn-primary">foo</button><button class="btn btn-primary">bar</button>')

equal(compile(`<import button from='./button.html'/><button>foo</button>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<button class="btn btn-primary">foo</button>')

equal(compile(`<import button from='./button.html'/><button>foo</button>`, {
  paths: [ path.join(__dirname, '../fixtures/import'), path.join(__dirname, '../fixtures/partial') ]
})({}, html => html), '<button class="btn btn-primary">foo</button>')

equal(compile(`<require button from="./button.html"/><button>foo</button>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<button class="btn btn-primary">foo</button>')

equal(compile(`<import header from="./header.html"/><header><slot title>foo</slot><slot subtitle>bar</slot></header>`, {
  paths: [ path.join(__dirname, '../fixtures/slots') ]
})({}, html => html), '<header><h1>foo</h1><h2>bar</h2></header>')
equal(compile(`<import header from="./header.html"/><header><slot title>foo</slot></header>`, {
  paths: [ path.join(__dirname, '../fixtures/slots') ]
})({}, html => html), '<header><h1>foo</h1><h2></h2></header>')
equal(compile(`<import header from="./header.html"/><header></header>`, {
  paths: [ path.join(__dirname, '../fixtures/slots') ]
})({}, html => html), '<header><h1></h1><h2></h2></header>')

equal(compile(`<import header from="./header.html"/><header></header>`, {
  paths: [ path.join(__dirname, '../fixtures/yields') ]
})({}, html => html), '<header><h1></h1><h2></h2></header>')

equal(compile(`<import select from="./select.html"/><select></select>`, {
  paths: [ path.join(__dirname, '../fixtures/select') ]
})({}, html => html), `<select class="form-control" name="type"><option value="offer" selected>offer</option><option value="search">search</option></select>`)

deepStrictEqual(compile(`<import button from="./button.html"/><button></button>`, {
  paths: [ path.join(__dirname, '../fixtures/partial') ],
  statistics: true
}).statistics, {
  components: [
    {
      name: 'button',
      content: '<button class="btn primary"><slot></slot></button>\n',
      path: path.join(__dirname, '../fixtures/partial/button.html')
    }
  ],
  partials: [],
  svgs: [],
  images: [],
  scripts: [],
  stylesheets: [],
  assets: [
    path.join(__dirname, '../fixtures/partial/button.html')
  ]
})

deepStrictEqual(compile(`<partial from="./terms.html"></partial>`, {
  paths: [ path.join(__dirname, '../fixtures/partial') ],
  statistics: true
}).statistics, {
  components: [],
  partials: [{ path: path.join(__dirname, '../fixtures/partial/terms.html') }],
  svgs: [],
  images: [],
  scripts: [],
  stylesheets: [],
  assets: [
    path.join(__dirname, '../fixtures/partial/terms.html')
  ]
})

deepStrictEqual(compile(`<import layout from='./layout.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ],
  statistics: true
}).statistics, {
  components: [
    {
      name: 'layout',
      content: readFileSync(path.join(__dirname, '../fixtures/import/layout.html'), 'utf8'),
      path: path.join(__dirname, '../fixtures/import/layout.html')
    },
    {
      name: 'header',
      content: readFileSync(path.join(__dirname, '../fixtures/import/header.html'), 'utf8'),
      path: path.join(__dirname, '../fixtures/import/header.html')
    },
    {
      name: 'footer',
      content: readFileSync(path.join(__dirname, '../fixtures/import/footer.html'), 'utf8'),
      path: path.join(__dirname, '../fixtures/import/footer.html')
    }
  ],
  partials: [],
  svgs: [],
  images: [],
  scripts: [],
  stylesheets: [],
  assets: [
    path.join(__dirname, '../fixtures/import/layout.html'),
    path.join(__dirname, '../fixtures/import/header.html'),
    path.join(__dirname, '../fixtures/import/footer.html')
  ]
})

equal(compile(`<import layout from='./layout.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<div>foo</div><main>bar</main><div>baz</div>')

equal(compile(`<import layout from='./layout-with-render.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

equal(compile(`<import layout from='./layout-with-require.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<div>foo</div><main>bar</main><div>baz</div>')


equal(compile(`<import layout from='./layout-with-partial-attribute.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

equal(compile(`<import layout from='./layout-with-partial.html'/><layout>bar</layout>`, {
  paths: [ path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<header><div>foo</div></header><main>bar</main><footer><div>baz</div></footer>')

equal(compile(`<partial from="./terms.html"></partial>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({}, html => html), '<div>foo bar baz</div>')
equal(compile(`<partial from="./footer.html"></partial>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({}, html => html), '<div>foo</div><footer>bar</footer>')
equal(compile(`<partial from="./header.html"></partial>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<partial from="./header.html">`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<partial from="./header.html" />`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')

equal(compile(`<render partial="./terms.html"></render>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({}, html => html), '<div>foo bar baz</div>')
equal(compile(`<render partial="./footer.html"></render>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({}, html => html), '<div>foo</div><footer>bar</footer>')
equal(compile(`<render partial="./header.html"></render>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<render partial="./header.html">`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<render partial="./header.html" />`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({ title: 'foo' }, html => html), '<div>foo</div>')

equal(compile(`<head partial="./head.html"></head>`, { paths: [ path.join(__dirname, '../fixtures/partial') ] })({}, html => html), '<head><meta charset="utf-8"></head>')

equal(compile(`<import icon from="./icon.html" /><icon foo="bar"></icon>`, {
  paths: [ path.join(__dirname, '../fixtures/partial') ]
})({}, html => html), '<span class="glyphicon glyphicon-bar"></span>')

equal(compile(`<import icon from="./icon.html" /><icon foo="bar"></icon><icon foo="baz"></icon>`, {
  paths: [ path.join(__dirname, '../fixtures/partial') ]
})({}, html => html), '<span class="glyphicon glyphicon-bar"></span><span class="glyphicon glyphicon-baz"></span>')

equal(compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
  paths: [ path.join(__dirname, '../fixtures/import'), path.join(__dirname, '../fixtures/partial') ]
})({}, html => html), '<input type="checkbox">')

equal(compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {
  paths: [ path.join(__dirname, '../fixtures/partial'), path.join(__dirname, '../fixtures/import') ]
})({}, html => html), '<input type="checkbox">')

equal(compile('<import meta from="./meta.html"><content for title>foo</content><meta></meta>', {
  paths: [ path.join(__dirname, '../fixtures/partial') ]
})({}, html => html), '<title>foo</title>')

throws(function () {
  compile(`<partial from='./partial.html'/><partial>`, {})
}, /Compiler option is undefined: paths\./)

throws(function () {
  compile(`<partial from='./partial.html'/><partial>`, { paths: [] })
}, /Asset not found: \.\/partial\.html/)

throws(function () {
  compile(`<div partial='./partial.html'/><div>`, {})
}, /Compiler option is undefined: paths\./)

throws(function () {
  compile(`<div partial='./partial.html'/><div>`, { paths: [] })
}, /Asset not found: \.\/partial\.html/)

throws(function () {
  compile(`<import checkbox from='./checkbox.html'/><checkbox>`, {})
}, /Compiler option is undefined: paths\./)

throws(function () {
  compile(`<import checkbox from='./checkbox.html'/><checkbox>`, { paths: [] })
}, /Asset not found: \.\/checkbox\.html/)

console.timeEnd('import')
