import test from 'ava'
import { convertAttributeToInlineStyle, convertSizeToWidthAndHeight, setAutoDimension } from './css'

test('it converts attribute to a new style attribute', assert => {
  const attribute = ['responsive']
  const styles = 'max-width: 100%; height: auto;'
  const attributes = [{
    key: 'responsive',
    value: null
  }]
  const attrs = convertAttributeToInlineStyle(attributes, attribute, styles)
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
  const attrs = convertAttributeToInlineStyle(attributes, attribute, styles)
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
  const attrs = convertAttributeToInlineStyle(attributes, attribute, styles)
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
  const attrs = convertAttributeToInlineStyle(attributes, attribute, styles)
  assert.deepEqual(attrs.length, 1)
  assert.deepEqual(attrs[0].key, 'style')
  assert.deepEqual(attrs[0].value, 'max-width: 100%; height: auto; margin-top: 10px;')
})

test('it converts size to width and height', assert => {
  const attributes = [{
    key: 'size',
    value: '300x200'
  }]
  const attrs = convertSizeToWidthAndHeight(attributes)
  assert.deepEqual(attrs.length, 2)
  assert.deepEqual(attrs[0].key, 'width')
  assert.deepEqual(attrs[0].value, '300')
  assert.deepEqual(attrs[1].key, 'height')
  assert.deepEqual(attrs[1].value, '200')
})

test('it converts size to width and height for a custom separator', assert => {
  const attributes = [{
    key: 'size',
    value: '300X200'
  }]
  const attrs = convertSizeToWidthAndHeight(attributes)
  assert.deepEqual(attrs.length, 2)
  assert.deepEqual(attrs[0].key, 'width')
  assert.deepEqual(attrs[0].value, '300')
  assert.deepEqual(attrs[1].key, 'height')
  assert.deepEqual(attrs[1].value, '200')
})

test('it converts size to width and height and overrides existing tags', assert => {
  const attributes = [{
    key: 'size',
    value: '300x200'
  }, {
    key: 'width',
    value: 150
  }]
  const attrs = convertSizeToWidthAndHeight(attributes)
  assert.deepEqual(attrs.length, 2)
  assert.deepEqual(attrs[0].key, 'width')
  assert.deepEqual(attrs[0].value, '300')
  assert.deepEqual(attrs[1].key, 'height')
  assert.deepEqual(attrs[1].value, '200')
})
