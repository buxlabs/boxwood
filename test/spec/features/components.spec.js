const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const { escape } = require('../../..')

test('components: tag', async assert => {
  const { template } = await compile(`
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
  const { template } = await compile(`
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

test('components: text', async assert => {
  const { template } = await compile(`
    import { text } from 'boxwood'

    export default function () {
      return text("foo")
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), 'foo')
})

test('components: tag and text', async assert => {
  const { template } = await compile(`
    import { tag, text } from 'boxwood'

    export default function () {
      return tag("a") + text("foo")
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a></a>foo')
})

test('components: tag with a child', async assert => {
  const { template } = await compile(`
    import { tag } from 'boxwood'

    export default function () {
      return tag("a", "foo")
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a>foo</a>')
})

test('components: tag with children', async assert => {
  const { template } = await compile(`
    import { tag } from 'boxwood'

    export default function () {
      return tag("a", [
        tag("strong", "foo"),
        "bar"
      ])
    }
  `, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ],
    path: 'app.js'
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<a><strong>foo</strong>bar</a>')
})

