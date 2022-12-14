const test = require('ava')
const { compile } = require('../..')
const { join } = require('path')

test('compile: it returns a template', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/literal.js'))

  assert.deepEqual(template(), 'foo')
})

test('compile: it returns a template which can have parameters', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/parameters.js'))

  assert.deepEqual(template({ foo: 'bar' }), 'bar')
})

test('compile: it returns a template which can require dependencies', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/dependencies.js'))

  assert.deepEqual(template(), 'foo/bar')
})

test('compile: it works with attribute aliases', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/attributes.js'))

  assert.deepEqual(template({ className: 'foo', htmlFor: 'bar' }, 'baz'), '<label class="foo" for="bar">baz</label>')
})


test('compile: it works with div tags', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/tag/div.js'))

  assert.deepEqual(template(), '<div>foo</div>')
})

test('compile: it works with input tags', async assert => {
  const { template } = await compile(join(__dirname, './fixtures/tag/input.js'))

  assert.deepEqual(template(), '<input checked>')
})
