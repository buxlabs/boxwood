'use strict'

const test = require('ava')
const { mergeAssets } = require('./assets')

test('mergeAssets', assert => {
  const result = mergeAssets([
    {
      path: 'foo.html',
      files: ['bar.html'],
      id: 1
    },
    {
      path: 'foo.html',
      files: ['baz.html'],
      id: 2
    },
    {
      path: 'foo.html',
      files: ['qux.html'],
      id: 3
    }
  ])
  assert.deepEqual(result, [
    {
      path: 'foo.html',
      files: ['bar.html', 'baz.html', 'qux.html'],
      id: 3
    }
  ])
})
