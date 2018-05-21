const assert = require('assert')
const { normalize } = require('./array')

assert.deepEqual(normalize(['foo', 'is', 'positive']), ['foo', 'is_positive'])
// assert.deepEqual(normalize(['foo', 'is', 'negative']), ['foo', 'is_negative'])
