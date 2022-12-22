const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#components/accordion: it returns a component with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  const html = template({ title: 'foo' }, 'bar')
  assert.truthy(html.includes('<h3 class="__accordion__14p2m">foo</h3>'))
  assert.truthy(
    html.includes('<div class="__content__14p2m __hidden__14p2m">bar</div>')
  )
})
