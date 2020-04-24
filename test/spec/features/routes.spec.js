const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('it returns an error when routes are not set and script[routes] is used', async assert => {
  const { errors } = await compile('<script routes>routes.get("foo.bar")</script>')
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].type, 'EMPTY_ROUTES')
})
