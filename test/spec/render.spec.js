const test = require('ava')
const path = require('path')
const { compile, createRender } = require('../..')
const fs = require('fs')
const os = require('os')

const normalize = (text) => {
  return text.replace(/s+/g, '')
}

test('it renders html', async assert => {
   const render = createRender({
     compile,
     globals: {
       foo: 'bar'
     }
  })
  const filepath = path.join(__dirname, '../fixtures/render/foo.html')
  const html = await render(filepath, { baz: 'qux' })
  assert.truthy(html.includes('<div>bar</div><div>qux</div>'))
})

test('works with globals as function', async assert => {
  const render = createRender({
    compile,
    globals(path, { baz }) {
      return { foo: `bar${baz}` }
    },
    compilerOptions: {
      paths: [__dirname]
    }
  })
  const filepath = path.join(__dirname, '../fixtures/render/foo.html')
  const html = await render(filepath, { baz: 'qux' })
  assert.truthy(html.includes('<div>barqux</div><div>qux</div>'))
})

test('returns an error when the file does not exist', async assert => {
  const render = createRender({ compile })
  const filepath = path.join(__dirname, '../fixtures/render/fail.html')
  const html = await render(filepath, { baz: 'qux' })
  assert.truthy(html.includes('ENOENT'))
})

test('it does not recompile files if cache is enabled', async assert => {
  const render = createRender({ compile })
  const filepath = path.join(os.tmpdir(), 'foo-cache-disabled-1.html')
  fs.writeFileSync(filepath, '<a>foo</a>')
  var html = await render(filepath)
  assert.truthy(html.includes('<a>foo</a>'))
  fs.writeFileSync(filepath, '<a>bar</a>')
  var html = await render(filepath)
  assert.truthy(html.includes('<a>foo</a>'))
  fs.unlinkSync(filepath)
})

test('recompiles files if cache is disabled', async assert => {
  const render = createRender({ compile, cacheEnabled: false })
  const filepath = path.join(os.tmpdir(), 'foo-cache-disabled-2.html')
  fs.writeFileSync(filepath, '<a>foo</a>')
  var html = await render(filepath)
  assert.truthy(html.includes('<a>foo</a>'))
  fs.writeFileSync(filepath, '<a>bar</a>')
  var html = await render(filepath)
  assert.truthy(html.includes('<a>bar</a>'))
  fs.unlinkSync(filepath)
})

test('includes dir of the file path in compiler paths', async assert => {
  const render = createRender({ compile, cacheEnabled: false })
  const filepath = path.join(__dirname, '../fixtures/render/baz.html')
  var html = await render(filepath)
  assert.truthy(html.includes('quux'))
})

test('prints warnings', async assert => {
  let called = false
  let message = ''
  const spy = (msg) => {
    called = true
    if (!message) message = msg
  }
  const render = createRender({
    compile,
    compilerOptions: {
      paths: [path.join(__dirname, '../fixtures')]
    },
    log: spy
  })
  await render(path.join(__dirname, '../fixtures/render/bar.html'))
  assert.deepEqual(called, true)
  assert.truthy(message.includes('fixtures/render/bar.html'))
})
