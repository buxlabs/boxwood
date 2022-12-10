const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#pages/landing: it returns a page with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(
    template(
      {
        className: 'foo',
        href: '/bar',
        target: '_blank',
      },
      'foo'
    ),
    '<a class="__link__ybr2b foo" href="/bar" target="_blank">foo</a>'
  )
})
