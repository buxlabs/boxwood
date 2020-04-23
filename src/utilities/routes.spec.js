'use strict'

const test = require('ava')
const { transform } = require('./routes')

test('it replaces routes.get with url', assert => {
  const input = 'routes.get("User.browse")'
  const routes = { User: { browse: '/user' } }
  const errors = []
  const output = transform(input, routes, errors)
  assert.deepEqual(output.trim(), '"/user";')
})

test('it adds an error if given url does not exist', assert => {
  const input = 'routes.get("User.browse")'
  const routes = {}
  const errors = []
  transform(input, routes, errors)
  assert.deepEqual(errors[0], { type: 'ROUTE_MISSING', message: 'routes.get could not find the \'User.browse\' route.' })
})

test('it adds an error if routes.get has no params', assert => {
  const input = 'routes.get()'
  const routes = {}
  const errors = []
  transform(input, routes, errors)
  assert.deepEqual(errors[0], { type: 'ROUTE_INVALID', message: 'routes.get requires a string literal as the first parameter.' })
})

test('it adds an error if routes.get does not receive a string', assert => {
  const input = 'routes.get(5)'
  const routes = {}
  const errors = []
  transform(input, routes, errors)
  assert.deepEqual(errors[0], { type: 'ROUTE_INVALID', message: 'routes.get requires a string literal as the first parameter.' })
})
