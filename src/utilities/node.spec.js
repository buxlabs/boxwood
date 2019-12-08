import test from 'ava'
import { normalizeAttributes } from './node'

test('normalizeAttributes: empty attribute value considered as a boolean true', assert => {
  assert.deepEqual(normalizeAttributes([{ key: 'open', value: null }]), [{ key: 'open', value: '{true}' }])
})

test('normalizeAttributes: shorthand syntax for passing values', assert => {
  assert.deepEqual(normalizeAttributes([{ key: '{foo}', value: null }]), [{ key: 'foo', value: '{foo}' }])
})
