import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('style[scoped]: first tag', async assert => {
  const template = await compile('<style scoped>.foo{color:red}</style><a class="foo">bar</a>')
  assert.deepEqual(template({}, escape), '<style>.scope-122304991.foo{color:red}</style><a class="scope-122304991 foo">bar</a>')
})

test('style[scoped]: last tag', async assert => {
  const template = await compile('<a class="foo">bar</a><style scoped>.foo{color:red}</style>')
  assert.deepEqual(template({}, escape), '<a class="scope-122304991 foo">bar</a><style>.scope-122304991.foo{color:red}</style>')
})

test('style[scoped]: multiple classes', async assert => {
  const template = await compile(`
    <a class="foo bar">baz</a>
    <style scoped>.foo.bar{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-41409600 foo bar">baz</a><style>.scope-41409600.foo.bar{color:red}</style>')
})

test('style[scoped]: pseudo classes', async assert => {
  const template = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo:hover{color:red}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-861004675 foo">baz</a><style>.scope-861004675.foo:hover{color:red}</style>')
})

test('stype[scoped]: pseudo elements', async assert => {
  const template = await compile(`
    <a class="foo">baz</a>
    <style scoped>.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-1577098216 foo">baz</a><style>.scope-1577098216.foo::after{content:"⤴"}</style>')
})

test('style[scoped]: type selectors', async assert => {
  const template = await compile(`
    <a class="foo">baz</a>
    <style scoped>a.foo::after{content:"⤴"}</style>
  `)
  assert.deepEqual(template({}, escape), '<a class="scope-504633481 foo">baz</a><style>a.scope-504633481.foo::after{content:"⤴"}</style>')
})
