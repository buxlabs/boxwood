const test = require('ava')
const Cache = require('./Cache')

test('it caches data', assert => {
  const key = 'foo'
  const value = 'bar'
  const cache = new Cache()
  cache.set(key, value)
  assert.deepEqual(cache.get(key), value)
})

test('it can remove data', assert => {
  const key = 'foo'
  const value = 'bar'
  const cache = new Cache()
  cache.set(key, value)
  cache.remove(key)
  assert.deepEqual(cache.get(key), undefined)
})

test('it can check if data exists', assert => {
  const key = 'foo'
  const value = 'bar'
  const cache = new Cache()
  cache.set(key, value)
  assert.deepEqual(cache.has(key), true)
  cache.remove(key)
  assert.deepEqual(cache.has(key), false)
})
