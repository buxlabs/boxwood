const test = require('ava')
const { convertObjectToStyleString } = require('./style')

test('convertObjectToStyleString: it converts flat objects', assert => {
  assert.deepEqual(convertObjectToStyleString({ color: 'red' }), 'color:red;')
})

test('convertObjectToStyleString: it converts deep objects', assert => {
  assert.deepEqual(convertObjectToStyleString({ margin: { top: '10px' } }), 'margin-top:10px;')
})
