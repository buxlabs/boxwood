import test from 'ava'
import { Suite } from 'benchmark'
import compile from './helpers/compile'
import { readFile } from './helpers/fs'
import underscore from 'underscore'
import template from 'lodash.template'
import handlebars from 'handlebars'
import mustache from 'mustache'
import escape from 'escape-html'
import path from 'path'

test('benchmark', async assert => {
  const source1 = await readFile(path.join(__dirname, 'fixtures/benchmark/html-engine.html'))
  const source2 = await readFile(path.join(__dirname, 'fixtures/benchmark/underscore.ejs'))
  const source3 = await readFile(path.join(__dirname, 'fixtures/benchmark/lodash.ejs'))
  const source4 = await readFile(path.join(__dirname, 'fixtures/benchmark/handlebars.hbs'))
  const source5 = await readFile(path.join(__dirname, 'fixtures/benchmark/mustache.mst'))

  const suite = new Suite()
  const fn1 = await compile(source1)
  const fn2 = underscore.template(source2)
  const fn3 = template(source3)
  const fn4 = handlebars.compile(source4)
  mustache.parse(source5)

  const data = {
    title: 'foo',
    subtitle: 'baz',
    todos: [
      { description: 'lorem ipsum' },
      { description: 'dolor sit' },
      { description: 'amet' }
    ]
  }

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
        console.log(String(event.target))
      })
      .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
        resolve()
      })
      .run({ 'async': true })
  })
})
