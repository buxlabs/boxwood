const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const { escape } = require('../../..')

test('components: tag', async assert => {
  var { template } = await compile(`
    import { tag } from 'boxwood'

    export default function () {
      return tag("a")
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a></a>')
})

test('components: tag with an attribute', async assert => {
  var { template } = await compile(`
    import { tag } from 'boxwood'

    export default function () {
      return tag("a", { href: "#foo" })
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a href="#foo"></a>')
})

test.skip('components: passing attributes', async assert => {
  var { template } = await compile(`
    import { tag, slot } from 'boxwood'

    export default function (options) {
      return tag("a", { href }, slot)
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a href="#foo">bar</a>')
})
