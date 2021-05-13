const test = require('ava')
const InlinePlugin = require('.')
const { parse, stringify, walk } = require('../../utilities/html')

function transform (input) {
  const plugin = new InlinePlugin()
  const tree = parse(input)
  plugin.beforeprerun()
  const assets = []
  const options = {}
  walk(tree, fragment => {
    if (fragment.type === 'element') {
      const tag = fragment.tagName
      const { attributes = [], children = [] } = fragment
      const keys = attributes.map(attribute => attribute.key)
      plugin.prerun({ tag, keys, children, attributes, fragment, assets, options })
    }
  })

  walk(tree, fragment => {
    if (fragment.type === 'element') {
      const tag = fragment.tagName
      const { attributes = [], children = [] } = fragment
      const keys = attributes.map(attribute => attribute.key)
      plugin.run({ tag, keys, children, attributes, fragment, assets, options })
    }
  })
  return stringify(tree, input).trim()
}

test('InlinePlugin: it inlines styles based on classes', assert => {
  assert.deepEqual(transform(`
    <div class="foo"></div>
    <style inline>.foo { color: red }</style>
  `), `<div style='color:red'></div>`)
})

test.skip('InlinePlugin: it inlines styles based on tags', assert => {
  assert.deepEqual(transform(`
    <h1></h1>
    <style inline>h1 { margin: 0 }</style>
  `), `<h1 style='margin: 0'></h1>`)
})
