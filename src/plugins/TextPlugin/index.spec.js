const test = require('ava')
const TextPlugin = require('.')
const { parse, stringify, walk } = require('../../utilities/html')

test('TextPlugin: it inlines the text attribute', assert => {
  const plugin = new TextPlugin()
  const input = `
    <div text="foo"></div>
    <div text="{foo}"></div>
    <div text="{foo + 1}"></div>
  `
  const tree = parse(input)
  plugin.beforeprerun()
  walk(tree, fragment => {
    const tag = fragment.tagName
    const { attributes = [], children = [] } = fragment
    const keys = attributes.map(attribute => attribute.key)
    plugin.prerun({ tag, keys, children, attrs: attributes || [], fragment })
  })
  const output = stringify(tree, input)
  assert.deepEqual(output, `
    <div>foo</div>
    <div>{foo}</div>
    <div>{foo + 1}</div>
  `)
})
