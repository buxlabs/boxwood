const test = require('ava')
const compile = require('../../../helpers/deprecated-compile')
const { escape } = require('../../../..')

test('style[scoped]: first tag', async assert => {
  var { template } = await compile('<style scoped>.foo{color:red}</style><a class="foo">bar</a>')
  assert.deepEqual(template({}, escape), '<a class="s74a39df foo">bar</a><style>.s74a39df.foo{color:red}</style>')
})

test('style[scoped]: last tag', async assert => {
  var { template } = await compile('<a class="foo">bar</a><style scoped>.foo{color:red}</style>')
  assert.deepEqual(template({}, escape), '<a class="s74a39df foo">bar</a><style>.s74a39df.foo{color:red}</style>')
})

test('style[scoped]: handles tags', async assert => {
  const { template } = await compile('<h1>foo</h1><style scoped>h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<h1 class="s71ede58e">foo</h1><style>h1.s71ede58e{color:red}</style>')
})

test('style[scoped]: handles nested tags', async assert => {
  const { template } = await compile('<main><h1>foo</h1></main><style scoped>main h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="s28ee1745"><h1>foo</h1></main><style>main.s28ee1745 h1{color:red}</style>')
})

test('style[scoped]: handles classes', async assert => {
  const { template } = await compile('<h1 class="foo">foo</h1><style scoped>.foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<h1 class="sa52a449f foo">foo</h1><style>.sa52a449f.foo{color:red}</style>')
})

test('style[scoped]: handles nested classes', async assert => {
  const { template } = await compile('<main class="bar"><h1 class="foo">foo</h1></main><style scoped>.bar .foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="s7edc0d00 bar"><h1 class="foo">foo</h1></main><style>.s7edc0d00.bar .foo{color:red}</style>')
})

test('style[scoped]: handles tag with nested class', async assert => {
  const { template } = await compile('<main><h1 class="foo">foo</h1></main><style scoped>main .foo { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="s7ede60f4"><h1 class="foo">foo</h1></main><style>main.s7ede60f4 .foo{color:red}</style>')
})

test('style[scoped]: handles class with nested tag', async assert => {
  const { template } = await compile('<main class="foo"><h1>foo</h1></main><style scoped>.foo h1 { color: red }</style>')
  assert.deepEqual(template({}, escape), '<main class="s28eda386 foo"><h1>foo</h1></main><style>.s28eda386.foo h1{color:red}</style>')
})

test('style[scoped]: multiple classes', async assert => {
  var { template } = await compile(`
    <a class="foo bar">baz</a>
    <style scoped>.foo.bar{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="s277dc40 foo bar">baz</a><style>.s277dc40.foo.bar{color:red}</style>')
})

test('style[scoped]: pseudo classes', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo:hover{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="s3351e383 foo">baz</a><style>.s3351e383.foo:hover{color:red}</style>')
})

test('stype[scoped]: pseudo elements', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="s5e009be8 foo">baz</a><style>.s5e009be8.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: type selectors', async assert => {
  var { template } = await compile(`
    <a class="foo">baz</a>
    <style scoped>a.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="s1e141889 foo">baz</a><style>a.s1e141889.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: attribute selector', async assert => {
  var { template } = await compile(`
    <input type="checkbox">
    <style scoped>
      input[type="checkbox"] { display: none; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" class="sdd8ecd34"><style>input.sdd8ecd34[type="checkbox"]{display:none}</style>')

  var { template } = await compile(`
    <input type="checkbox" checked>
    <style scoped>
      input[type="checkbox"]:checked { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="s9538736a"><style>input.s9538736a[type="checkbox"]:checked{display:block}</style>')

  var { template } = await compile(`
    <input type="checkbox" checked>
    <label></label>
    <style scoped>
      input[type="checkbox"]:checked + label { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="s374fda87"><label></label><style>input.s374fda87[type="checkbox"]:checked+label{display:block}</style>')

  var { template } = await compile(`
    <input type="checkbox" checked>
    <label></label>
    <p></p>
    <style scoped>
      input[type="checkbox"]:checked + label ~ p { display: block; }
    </style>
  `)
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked class="s557ab449"><label></label><p></p><style>input.s557ab449[type="checkbox"]:checked+label~p{display:block}</style>')
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
  assert.deepEqual(template({}, escape), '<div class="s7148fe2e fadein"></div><style>.s7148fe2e.fadein{animation:fadein-s7148fe2e 1s forwards}@keyframes fadein-s7148fe2e{0%{opacity:0}100%{opacity:1}}</style>')

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
  assert.deepEqual(template({}, escape), '<div class="sdd1c0d45 fadein"></div><style>.sdd1c0d45.fadein{animation-name:fadein-sdd1c0d45;animation-duration:1s;animation-timing-function:forwards}@keyframes fadein-sdd1c0d45{0%{opacity:0}100%{opacity:1}}</style>')
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
  assert.deepEqual(template({ bar: 'baz' }, escape), '<div class="s8e529084 foo baz"></div><style>.s8e529084.foo{color:red}</style>')
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
  assert.deepEqual(template({ bar: 'baz' }, escape), '<div class="s8e529084 baz foo"></div><style>.s8e529084.foo{color:red}</style>')
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
  assert.deepEqual(template({ baz: 'baz' }, escape), '<div class="s8e529084 foo bar baz"></div><style>.s8e529084.foo{color:red}</style>')
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
  assert.deepEqual(template({ baz: 'baz' }, escape), '<div class="s8e529084 foo baz bar"></div><style>.s8e529084.foo{color:red}</style>')
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
  assert.deepEqual(template({ foo: true }, escape), '<div class="s8e529084 foo"></div><style>.s8e529084.foo{color:red}</style>')
})

test('style[scoped]: square tags', async assert => {
  const { template } = await compile(`
    <div class="['foo', baz]"></div>
    <style scoped>
    .foo { color: red }
    </style>
  `)
  assert.deepEqual(template({ baz: 'qux' }, escape), '<div class="sa52a449f foo qux"></div><style>.sa52a449f.foo{color:red}</style>')
})

test('style[scoped]: square tags with multiple matching strings', async assert => {
  const { template } = await compile(`
    <div class="['foo', 'bar', baz]"></div>
    <style scoped>
    .foo { color: red }
    .bar { height: 100px }
    </style>
  `)
  assert.deepEqual(template({ baz: 'qux' }, escape), '<div class="sb71a9370 foo bar qux"></div><style>.sb71a9370.foo{color:red}.sb71a9370.bar{height:100px}</style>')
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
  assert.deepEqual(template({ rounded: true }, escape), '<img class="sd396f242 rounded"><style>.sd396f242.rounded{border-radius:100%}</style>')
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
  assert.deepEqual(template({ floated: "right" }, escape), '<img class="s4c018f4f floated right"><style>.s4c018f4f.floated.right{float:right}.s4c018f4f.floated.left{float:left}</style>')
})
