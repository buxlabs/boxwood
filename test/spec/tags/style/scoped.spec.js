const test = require('ava')
const compile = require('../../../helpers/compile')
const escape = require('escape-html')

test('style[scoped]: first tag', async assert => {
  var { template } = await compile('<style scoped>.foo{color:red}</style><a class="foo">bar</a>')
  assert.deepEqual(template({}, escape), '<a class="scope-122304991 foo">bar</a><style>.scope-122304991.foo{color:red}</style>')
})

test('style[scoped]: last tag', async assert => {
  var { template } = await compile('<a class="foo">bar</a><style scoped>.foo{color:red}</style>')
  assert.deepEqual(template({}, escape), '<a class="scope-122304991 foo">bar</a><style>.scope-122304991.foo{color:red}</style>')
})

test('style[scoped]: handles tags', async assert => {
  const { template } = await compile('<h1>foo</h1><style scoped>h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<h1 class="scope-1911416206">foo</h1><style>h1.scope-1911416206{color:red}</style>')
})

test('style[scoped]: handles nested tags', async assert => {
  const { template } = await compile('<main><h1>foo</h1></main><style scoped>main h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="scope-686692165"><h1>foo</h1></main><style>main.scope-686692165 h1{color:red}</style>')
})

test('style[scoped]: handles classes', async assert => {
  const { template } = await compile('<h1 class="foo">foo</h1><style scoped>.foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<h1 class="scope-2771010719 foo">foo</h1><style>.scope-2771010719.foo{color:red}</style>')
})

test('style[scoped]: handles nested classes', async assert => {
  const { template } = await compile('<main class="bar"><h1 class="foo">foo</h1></main><style scoped>.bar .foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="scope-2128350464 bar"><h1 class="foo">foo</h1></main><style>.scope-2128350464.bar .foo{color:red}</style>')
})

test('style[scoped]: handles tag with nested class', async assert => {
  const { template } = await compile('<main><h1 class="foo">foo</h1></main><style scoped>main .foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="scope-2128503028"><h1 class="foo">foo</h1></main><style>main.scope-2128503028 .foo{color:red}</style>')
})

test('style[scoped]: handles class with nested tag', async assert => {
  const { template } = await compile('<main class="foo"><h1>foo</h1></main><style scoped>.foo h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="scope-686662534 foo"><h1>foo</h1></main><style>.scope-686662534.foo h1{color:red}</style>')
})

test('style[scoped]: multiple classes', async assert => {
  var { template } = await compile(`
    <a class="foo bar">baz</a>
    <style scoped>.foo.bar{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-41409600 foo bar">baz</a><style>.scope-41409600.foo.bar{color:red}</style>')
})

test('style[scoped]: pseudo classes', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo:hover{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-861004675 foo">baz</a><style>.scope-861004675.foo:hover{color:red}</style>')
})

test('stype[scoped]: pseudo elements', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-1577098216 foo">baz</a><style>.scope-1577098216.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: type selectors', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>a.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-504633481 foo">baz</a><style>a.scope-504633481.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: passing additional class to the scoped attribute', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped="bar">a.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-504633481 foo">baz</a><style>.bar a.scope-504633481.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: attribute selector', async assert => {
  var { template } = await compile(`
    <input type="checkbox">
    <style scoped>
      input[type="checkbox"] { display: none; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" class="scope-3717123380"><style>input.scope-3717123380[type="checkbox"]{display:none}</style>')

  var { template } = await compile(`
    <input type="checkbox" checked>
    <style scoped>
      input[type="checkbox"]:checked { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="scope-2503504746"><style>input.scope-2503504746[type="checkbox"]:checked{display:block}</style>')  

  var { template } = await compile(`
    <input type="checkbox" checked>
    <label></label>
    <style scoped>
      input[type="checkbox"]:checked + label { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="scope-927980167"><label></label><style>input.scope-927980167[type="checkbox"]:checked+label{display:block}</style>')  

  var { template } = await compile(`
    <input type="checkbox" checked>
    <label></label>
    <p></p>
    <style scoped>
      input[type="checkbox"]:checked + label ~ p { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="scope-1434104905"><label></label><p></p><style>input.scope-1434104905[type="checkbox"]:checked+label~p{display:block}</style>')  
})

test('style[scoped]: keyframes', async assert => {
  var { template } = await compile(`
    <div class="fadein"></div>
    <style scoped>
      .fadein {
        animation: fadein 1s forwards;
      }
      @keyframes fadein {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div class="scope-1900609070 fadein"></div><style>.scope-1900609070.fadein{animation:fadein-scope-1900609070 1s forwards}@keyframes fadein-scope-1900609070{0%{opacity:0}100%{opacity:1}}</style>')

  var { template } = await compile(`
    <div class="fadein"></div>
    <style scoped>
      .fadein {
        animation-name: fadein;
        animation-duration: 1s;
        animation-timing-function: forwards;
      }
      @keyframes fadein {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    </style>
  `, {})
  assert.deepEqual(template({}, escape), '<div class="scope-3709603141 fadein"></div><style>.scope-3709603141.fadein{animation-name:fadein-scope-3709603141;animation-duration:1s;animation-timing-function:forwards}@keyframes fadein-scope-3709603141{0%{opacity:0}100%{opacity:1}}</style>')
})

test('style[scoped]: class in an expression (start)', async assert => {
  const { template } = await compile(`
    <div class="{'foo ' + bar}"></div>
    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `, {})
  assert.deepEqual(template({ bar: 'baz' }, escape), '<div class="scope-2387775620 foo baz"></div><style>.scope-2387775620.foo{color:red}</style>')
})

test('style[scoped]: class in an expression (end)', async assert => {
  const { template } = await compile(`
    <div class="{bar + ' foo'}"></div>
    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `, {})
  assert.deepEqual(template({ bar: 'baz' }, escape), '<div class="scope-2387775620 baz foo"></div><style>.scope-2387775620.foo{color:red}</style>')
})

test('style[scoped]: classes in an expression (start)', async assert => {
  const { template } = await compile(`
    <div class="{'foo bar ' + baz}"></div>
    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `, {})
  assert.deepEqual(template({ baz: 'baz' }, escape), '<div class="scope-2387775620 foo bar baz"></div><style>.scope-2387775620.foo{color:red}</style>')
})

test('style[scoped]: classes in an expression (start and end)', async assert => {
  const { template } = await compile(`
    <div class="{'foo ' + baz + ' bar'}"></div>
    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `, {})
  assert.deepEqual(template({ baz: 'baz' }, escape), '<div class="scope-2387775620 foo baz bar"></div><style>.scope-2387775620.foo{color:red}</style>')
})

test('style[scoped]: condition in a template', async assert => {
  const { template } = await compile(`
    <if foo>
      <div class="foo"></div>
    </if>
    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `, {})
  assert.deepEqual(template({ foo: true }, escape), '<div class="scope-2387775620 foo"></div><style>.scope-2387775620.foo{color:red}</style>')
})

test('style[scoped]: square tags', async assert => {
  const { template } = await compile(`
    <div class="['foo', baz]"></div>
    <style scoped>
    .foo { color: red }
    </style>
  `)
  assert.deepEqual(template({ baz: 'qux' }, escape), '<div class="scope-2771010719 foo qux"></div><style>.scope-2771010719.foo{color:red}</style>')
})

test('style[scoped]: square tags with multiple matching strings', async assert => {
  const { template } = await compile(`
    <div class="['foo', 'bar', baz]"></div>
    <style scoped>
    .foo { color: red }
    .bar { height: 100px }
    </style>
  `)
  assert.deepEqual(template({ baz: 'qux' }, escape), '<div class="scope-3071972208 foo bar qux"></div><style>.scope-3071972208.foo{color:red}.scope-3071972208.bar{height:100px}</style>')
})

test('style[scoped]: shorthand syntax and scoped styles', async assert => {
  const { template } = await compile(`
    <img class="[rounded && 'rounded']">
    <style scoped>
      .rounded {
        border-radius: 100%;
      }
    </style>
  `)
  assert.deepEqual(template({ rounded: true }, escape), '<img class="scope-3549884994 rounded"><style>.scope-3549884994.rounded{border-radius:100%}</style>')
})

test('style[scoped]: shorthand syntax with an expression and scoped styles', async assert => {
  const { template } = await compile(`
    <img class="[floated && \`floated \${floated}\`]">
    <style scoped>
      .floated.right {
        float: right;
      }
      .floated.left {
        float: left;
      }
    </style>
  `)
  assert.deepEqual(template({ floated: "right" }, escape), '<img class="scope-1275170639 floated right"><style>.scope-1275170639.floated.right{float:right}.scope-1275170639.floated.left{float:left}</style>')
})
