'use strict'

const test = require('ava')
const css = require('./css')

test('css: returns a string if a string was passed', assert => {
  assert.deepEqual(css('color: red'), 'color: red')
})

test('css: works for simple objects', assert => {
  assert.deepEqual(css({ color: 'red' }), 'color: red')
})

test.skip('css: works for numbers', assert => {
  assert.deepEqual(css({ border: 20 }), 'border-width: 20px')
})

test.skip('css: works for nested keys', assert => {
    assert.deepEqual(css({
      border: {
        color: 'red',
        width: 2,
        style: 'solid'
      }
    }), [
      'border-color: ', 'red; ',
      'border-width: ', '2px; ',
      'border-style: ', 'solid',
    ].join(''))
})

test.skip('css: works for nested padding', assert => {
    assert.deepEqual(css({
      padding: {
        top: 3,
        bottom: 2
      }
    }), [
      'padding-top: ', '3px; ',
      'padding-bottom: ', '2px'
    ].join(''))
})

test.skip('css: works for multiple keys', assert => {
    assert.deepEqual(css({
      padding: {
        top: 3,
        bottom: 2
      },
      border: '1px solid red',
      margin: 4
    }), [
      'padding-top: ', '3px; ',
      'padding-bottom: ', '2px; ',
      'border: ', '1px solid red; ',
      'margin: ', '4px'
    ].join(''))
})

test.skip('css: works for multiple keys (v2)', assert => {
    assert.deepEqual(css({
      border: {
        width: 1,
        color: 'red'
      },
      padding: 4,
      margin: {
        top: 5
      }
    }), [
      'border-width: 1px; ',
      'border-color: red; ',
      'padding: 4px; ',
      'margin-top: 5px',
    ].join(''))
})
