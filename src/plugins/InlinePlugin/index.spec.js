const test = require('ava')
const InlinePlugin = require('.')
const { parse, stringify, walk } = require('../../utilities/html')

test('InlinePlugin: it converts html and css', assert => {
  const plugin = new InlinePlugin()
  const input = `
    <div class="foo"></div>
    <style inline>.foo { color: red }</style>
  `
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
  const output = stringify(tree, input)
  assert.deepEqual(output.trim(), `<div style='color:red'></div>`)
})
