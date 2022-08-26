'use strict'

const test = require('ava')
const { Suite } = require('benchmark')
const compile = require('./helpers/compile')
const underscore = require('underscore')
const template = require('lodash.template')
const handlebars = require('handlebars')
const mustache = require('mustache')
const path = require('path')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

async function benchmark (dir, assert) {
  const source1 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/boxwood.js`), 'utf8')
  const source2 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/underscore.ejs`), 'utf8')
  const source3 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/lodash.ejs`), 'utf8')
  const source4 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/handlebars.hbs`), 'utf8')
  const source5 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/mustache.mst`), 'utf8')

  const suite = new Suite()
  const { template: fn1 } = await compile(source1, { format: 'js' })
  const fn2 = underscore.template(source2)
  const fn3 = template(source3)
  const fn4 = handlebars.compile(source4)
  const fn5 = (data) => mustache.render(source5, data)
  mustache.parse(source5)

  const data = require(path.join(__dirname, `fixtures/benchmark/${dir}/data.json`))

  function normalize (string) {
    return string.replace(/\s/g, '')
  }
  const result = normalize(fn1(data))

  assert.deepEqual(result, normalize(fn1(data)))
  assert.deepEqual(result, normalize(fn2(data)))
  assert.deepEqual(result, normalize(fn3(data)))
  assert.deepEqual(result, normalize(fn4(data)))
  assert.deepEqual(result, normalize(fn5(data)))

  await new Promise(resolve => {
    suite
      .add('boxwood[js]', function () {
        fn1(data)
      })
      .add('underscore', function () {
        fn2(data)
      })
      .add('lodash', function () {
        fn3(data)
      })
      .add('handlebars', function () {
        fn4(data)
      })
      .add('mustache', function () {
        fn5(data)
      })
      .on('cycle', function (event) {
        console.log(`${dir}: ${String(event.target)}`)
      })
      .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
        resolve()
      })
      .run({ async: true })
  })
}

test('benchmark: todos', async assert => {
  await benchmark('todos', assert)
})

test.skip('benchmark: friends', async assert => {
  await benchmark('friends', assert)
})

test.skip('benchmark: if', async assert => {
  await benchmark('if', assert)
})

test.skip('benchmark: projects', async assert => {
  await benchmark('projects', assert)
})

test.skip('benchmark: search', async assert => {
  await benchmark('search', assert)
})
