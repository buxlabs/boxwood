'use strict'

const test = require('ava')
const State = require('./State')

test('#State: get', assert => {
  const state = new State({ show: true })
  assert.deepEqual(state.get('show'), true)
})

test('#State: set', assert => {
  const state = new State()
  state.set('show', false)
  assert.deepEqual(state.get('show'), false)
})

test('#State: toggle', assert => {
  const state = new State()
  state.set('show', false)
  state.toggle('show')
  assert.deepEqual(state.get('show'), true)
})
