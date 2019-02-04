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

assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: '{foo}' }]), '{foo}')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: '{foo}' }]), '{foo || ""}')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: '{foo}' }]), '{foo || "bar"}')

assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: '{foo.bar}' }]), '{foo.bar}')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: '{foo.bar}' }]), '{foo.bar || ""}')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: '{foo.bar}' }]), '{foo.bar || "bar"}')

assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: '{foo[bar]}' }]), '{foo[bar]}')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: '{foo[bar]}' }]), '{foo[bar] || ""}')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: '{foo[bar]}' }]), '{foo[bar] || "bar"}')

// TODO: Ensure that is needed
assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: '{true}' }]), '{true}')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: '{true}' }]), '{true}')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: '{true}' }]), '{true}')

assert.deepEqual(curlyTagReduction('{foo}', [{ key: 'foo', value: '{false}' }]), '{false}')
assert.deepEqual(curlyTagReduction('{foo || ""}', [{ key: 'foo', value: '{false}' }]), '')
assert.deepEqual(curlyTagReduction('{foo || "bar"}', [{ key: 'foo', value: '{false}' }]), 'bar')

assert.deepEqual(curlyTagReduction('{foo}{bar}', []), '')
assert.deepEqual(curlyTagReduction('{foo} {bar}', []), ' ')

// TODO: Optimize and remove empty class attribute.
assert.deepEqual(curlyTagReduction('<div class="{foo}"></div>', []), `<div class=''></div>`)

assert.deepEqual(curlyTagReduction('<style>.foo { color: red }</style>', []), `<style>.foo { color: red }</style>`)
