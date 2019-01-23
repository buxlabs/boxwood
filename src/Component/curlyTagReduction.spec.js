const assert = require('assert')
const curlyTagReduction = require('./curlyTagReduction')

assert.deepEqual(curlyTagReduction('{foo}', []), '')
assert.deepEqual(curlyTagReduction('{foo || ""}', []), '')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', []), 'bar')

assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: 'bar' }]), 'bar')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: 'bar' }]), 'bar')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: 'bar' }]), 'bar')

assert.deepEqual(curlyTagReduction('{foo || bar}', []), '')
assert.deepEqual(curlyTagReduction('{foo || bar}', [{ key: 'foo', value: 'foo' }]), 'foo')
assert.deepEqual(curlyTagReduction('{foo || bar}', [{ key: 'bar', value: 'bar' }]), 'bar')
assert.deepEqual(curlyTagReduction('{foo || bar}', [{ key: 'foo', value: 'foo' }, { key: 'bar', value: 'bar' }]), 'foo')
