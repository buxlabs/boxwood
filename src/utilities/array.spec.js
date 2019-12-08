import test from 'ava'
import { normalize } from './array'

test('normalize: sets proper type for action and identifiers', assert => {
  assert.deepEqual(normalize([
    { key: 'not', value: null }, { key: 'foo', value: null }
  ]), [{ key: 'not', value: null, type: 'Action' }, { key: 'foo', value: null, type: 'Identifier' }])

  assert.deepEqual(normalize([
    { key: 'foo', value: null },
    { key: 'is', value: null },
    { key: 'positive', value: null }
  ]), [
    { key: 'foo', value: null, type: 'Identifier' },
    { key: 'is_positive', value: null, type: 'Action' }
  ])

  assert.deepEqual(normalize([
    { key: 'foo', value: null },
    { key: 'is', value: null },
    { key: 'less', value: null },
    { key: 'than', value: null },
    { key: 'or', value: null },
    { key: 'equals', value: null },
    { key: 'bar', value: null }
  ]), [
    { key: 'foo', value: null, type: 'Identifier' },
    { key: 'is_less_than_or_equals', value: null, type: 'Action' },
    { key: 'bar', value: null, type: 'Identifier' }
  ])
})
