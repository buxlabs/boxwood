const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#components/arrow: it returns a component with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(template({ direction: 'top' }), '<span class="__arrow__rqb1c __top__rqb1c"></span>')
  assert.deepEqual(template({ direction: 'right' }), '<span class="__arrow__rqb1c __right__rqb1c"></span>')
  assert.deepEqual(template({ direction: 'bottom' }), '<span class="__arrow__rqb1c __bottom__rqb1c"></span>')
  assert.deepEqual(template({ direction: 'left' }), '<span class="__arrow__rqb1c __left__rqb1c"></span>')
})
