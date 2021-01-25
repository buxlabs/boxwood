const test = require('ava')
const ScopesStylesPlugin = require('.')
const { parse, stringify, walk } = require('../../utilities/html')

test('ScopesStylesPlugin: it converts html and css', assert => {
  const plugin = new ScopesStylesPlugin()
  const input = `
    <div class="foo"></div>
    <style scoped>.foo { color: red }</style>
  `
  const tree = parse(input)
  plugin.beforeprerun()
  walk(tree, node => {
    if (node.type === 'element') {
      const tag = node.tagName
      const { attributes = [], children = [] } = node
      const keys = attributes.map(attribute => attribute.key)
      plugin.prerun({ tag, keys, children, attributes })
    }
  })

  walk(tree, node => {
    if (node.type === 'element') {
      const tag = node.tagName
      const { attributes = [], children = [] } = node
      const keys = attributes.map(attribute => attribute.key)
      plugin.run({ tag, keys, children, attributes })
    }
  })
  const output = stringify(tree, input)
  assert.deepEqual(output, `
    <div class='scope-2771010719 foo'></div>
    <style scoped>.scope-2771010719.foo{color:red}</style>
  `)
})
