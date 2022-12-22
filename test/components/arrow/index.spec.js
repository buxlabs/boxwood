const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#components/arrow: it returns a component with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(template({ direction: 'top' }), '<span class="__arrow__1echc __top__1echc"></span>')
  assert.deepEqual(template({ direction: 'right' }), '<span class="__arrow__1echc __right__1echc"></span>')
  assert.deepEqual(template({ direction: 'bottom' }), '<span class="__arrow__1echc __bottom__1echc"></span>')
  assert.deepEqual(template({ direction: 'left' }), '<span class="__arrow__1echc __left__1echc"></span>')
})
