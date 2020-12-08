'use strict'

const test = require('ava')
const styles = require('./styles')

test.skip('styles: should transform border with numeric value', assert => {
  assert.deepEqual(styles({ border: 20 }), 'border-width: 20px')
})

test.skip('styles: should transform nested border', assert => {
    assert.deepEqual(styles({
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

test.skip('styles: should transform nested padding', assert => {
    assert.deepEqual(styles({
      padding: {
        top: 3,
        bottom: 2
      }
    }), [
      'padding-top: ', '3px; ',
      'padding-bottom: ', '2px'
    ].join(''))
})

test.skip('styles: should transform objects with multiple keys', assert => {
    assert.deepEqual(styles({
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

test.skip('styles: should transform objects with multiple keys - var 2', assert => {
    assert.deepEqual(styles({
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
