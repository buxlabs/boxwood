const { Suite } = require('benchmark')
const compile = require('./helpers/compile')
const underscore = require('underscore')
const template = require('lodash.template')
const handlebars = require('handlebars')
const mustache = require('mustache')
const escape = require('escape-html')
const { readFileSync } = require('fs')
const path = require('path')
const assert = require('assert')

const source1 = readFileSync(path.join(__dirname, 'fixtures/benchmark/html-engine.html'), 'utf8')
const source2 = readFileSync(path.join(__dirname, 'fixtures/benchmark/underscore.ejs'), 'utf8')
const source3 = readFileSync(path.join(__dirname, 'fixtures/benchmark/lodash.ejs'), 'utf8')
const source4 = readFileSync(path.join(__dirname, 'fixtures/benchmark/handlebars.hbs'), 'utf8')
const source5 = readFileSync(path.join(__dirname, 'fixtures/benchmark/mustache.mst'), 'utf8')

const suite = new Suite()
const fn1 = compile(source1)
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
  })
  .run({ 'async': true })
