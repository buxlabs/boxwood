import test from 'ava'
import { Suite } from 'benchmark'
import compile from './helpers/compile'
import underscore from 'underscore'
import template from 'lodash.template'
import handlebars from 'handlebars'
import mustache from 'mustache'
import escape from 'escape-html'
import path from 'path'
import util from 'util'
import fs from 'fs'

const readFile = util.promisify(fs.readFile)

async function benchmark (dir, assert) {
  const source1 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/pure-engine.html`), 'utf8')
  const source2 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/underscore.ejs`), 'utf8')
  const source3 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/lodash.ejs`), 'utf8')
  const source4 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/handlebars.hbs`), 'utf8')
  const source5 = await readFile(path.join(__dirname, `fixtures/benchmark/${dir}/mustache.mst`), 'utf8')

  const suite = new Suite()
  const { template: fn1 } = await compile(source1)
  const fn2 = underscore.template(source2)
  const fn3 = template(source3)
  const fn4 = handlebars.compile(source4)
  mustache.parse(source5)

  const data = require(path.join(__dirname, `fixtures/benchmark/${dir}/data.json`))

  function normalize (string) {
    return string.replace(/\s/g, '')
  }
  const result = normalize(fn1(data, escape))

  assert.deepEqual(result, normalize(fn2(data)))
  assert.deepEqual(result, normalize(fn3(data)))
  assert.deepEqual(result, normalize(fn4(data)))
  assert.deepEqual(result, normalize(mustache.render(source5, data)))

  await new Promise(resolve => {
    suite.add('pure-engine', function () {
      fn1(data, escape)
    })
      .add('underscore', function () {
        fn2(data)
      })
      .add('lodash', function () {
        fn3(data)
      })
      .add('handlebars', function () {
        fn4(source4, data)
      })
      .add('mustache', function () {
        mustache.render(source5, data)
      })
      .on('cycle', function (event) {
        console.log(`${dir}: ${String(event.target)}`)
      })
      .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
        resolve()
      })
      .run({ 'async': true })
  })
}

test.serial('benchmark: todos', async assert => {
  await benchmark('todos', assert)
})

test.serial('benchmark: friends', async assert => {
  await benchmark('friends', assert)
})

test.serial('benchmark: if-expression', async assert => {
  await benchmark('if-expression', assert)
})
