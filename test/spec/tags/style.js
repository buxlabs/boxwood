import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('style[scoped]: first tag', async assert => {
  const template = await compile('<style scoped>.foo{color:red}</style><div class="foo">bar</div>')
  assert.deepEqual(template({}, escape), '<style>.foo.scope-122304991{color:red}</style><div class="foo scope-122304991">bar</div>')
})

test('style[scoped]: last tag', async assert => {
  const template = await compile('<div class="foo">bar</div><style scoped>.foo{color:red}</style>')
  assert.deepEqual(template({}, escape), '<div class="foo scope-122304991">bar</div><style>.foo.scope-122304991{color:red}</style>')
})
