const test = require('ava')
const compile = require('../../../helpers/deprecated-compile')
const { escape } = require('../../../..')

test('script: src', async assert => {
  var { template } = await compile(`<script src="{foo}"></script>`)
  assert.deepEqual(template({ foo: "bar.js" }, escape), '<script src="bar.js"></script>')
})

test('script: src with shorthand syntax', async assert => {
  var { template } = await compile(`<script {src}></script>`)
  assert.deepEqual(template({ src: "foo.js" }, escape), '<script src="foo.js"></script>')
})

test('script: src with other characters syntax', async assert => {
  var { template } = await compile(`<script src="/{foo}"></script>`)
  assert.deepEqual(template({ foo: "bar.js" }, escape), '<script src="/bar.js"></script>')
})
