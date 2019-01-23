const assert = require('assert')
const curlyTagReduction = require('./curlyTagReduction')

assert.deepEqual(curlyTagReduction('{foo}', []), '')
assert.deepEqual(curlyTagReduction('{foo || ""}', []), '')
