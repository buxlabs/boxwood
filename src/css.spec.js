import test from 'ava'
import { attributeToStyle } from './css'

test('it converts attribute to a new style attribute', assert => {
  const attribute = ['responsive']
  const styles = 'max-width: 100%; height: auto;'
  const attributes = [{
    key: 'responsive',
    value: null
  }]
  const attrs = attributeToStyle(attributes, attribute, styles)
  assert.deepEqual(attrs.length, 1)
  assert.deepEqual(attrs[0].key, 'style')
  assert.deepEqual(attrs[0].value, 'max-width: 100%; height: auto;')
})

test('it converts attribute and appends to existing style attribute', assert => {
  const attribute = ['responsive']
  const styles = 'max-width: 100%; height: auto;'
  const attributes = [{
    key: 'responsive',
    value: null
  }, {
    key: 'style',
    value: 'margin-top: 10px;'
  }]
  const attrs = attributeToStyle(attributes, attribute, styles)
  assert.deepEqual(attrs.length, 1)
  assert.deepEqual(attrs[0].key, 'style')
  assert.deepEqual(attrs[0].value, 'max-width: 100%; height: auto; margin-top: 10px;')
})

test('it removes existing attribute', assert => {
  const attribute = ['responsive']
  const styles = 'max-width: 100%; height: auto;'
  const attributes = [{
    key: 'responsive',
    value: null
  }]
  const attrs = attributeToStyle(attributes, attribute, styles)
  assert.falsy(attrs.find(attr => attr.key === 'responsive'))
})

test.skip('it removes existing attributes even if it is specified multiple times', assert => {
  const attribute = ['responsive']
  const styles = 'max-width: 100%; height: auto;'
  const attributes = [{
    key: 'responsive',
    value: null
  }, {
    key: 'style',
    value: 'margin-top: 10px;'
  }, {
    key: 'responsive',
    value: null
  }]
  const attrs = attributeToStyle(attributes, attribute, styles)
  assert.deepEqual(attrs.length, 1)
  assert.deepEqual(attrs[0].key, 'style')
  assert.deepEqual(attrs[0].value, 'max-width: 100%; height: auto; margin-top: 10px;')
})
