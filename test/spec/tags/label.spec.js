const test = require('ava')
const compile = require('../../helpers/compile')
const { join } = require('path')
const { escape } = require('../../..')

test('label: can be used with a for attribute', async assert => {
  var { template } = await compile('<label for="foo">bar</label>')
  assert.deepEqual(template({}, escape), '<label for="foo">bar</label>')
})

test('label: can use dynamic for attribute', async assert => {
  var { template } = await compile('<label for="{foo}">bar</label>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label for="foo">bar</label>')
})

test('label: can use bind syntax to bind a for attribute', async assert => {
  var { template } = await compile('<label for|bind="foo">bar</label>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label for="foo">bar</label>')
})

test('label: accepts a for attribute as a param', async assert => {
  var { template } = await compile('<import label from="./tags/label/label1.html" /><label for="foo">bar</label>', {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label for="foo">bar</label>')
})

test('label: can have a default for the for attribute', async assert => {
  var { template } = await compile('<import label from="./tags/label/label2.html" /><label for="foo">bar</label>', {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label for="foo">bar</label>')
})

test('label: accepts a class attribute as a param', async assert => {
  var { template } = await compile('<import label from="./tags/label/label3.html" /><label class="foo">bar</label>', {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label class="foo">bar</label>')
})

test('label: can have a default for the class attribute', async assert => {
  var { template } = await compile('<import label from="./tags/label/label4.html" /><label class="foo">bar</label>', {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(template({ foo: 'foo' }, escape), '<label class="foo">bar</label>')
})
