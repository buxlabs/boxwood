const { Suite } = require('benchmark')
const { compile } = require('..')
const underscore = require('underscore')
const lodash = require('lodash')
const escape = require('escape-html')
const { readFileSync } = require('fs')
const path = require('path')

const source1 = readFileSync(path.join(__dirname, 'fixtures/benchmark/html-engine.html'), 'utf8')
const source2 = readFileSync(path.join(__dirname, 'fixtures/benchmark/underscore.ejs'), 'utf8')
const source3 = readFileSync(path.join(__dirname, 'fixtures/benchmark/lodash.ejs'), 'utf8')

const suite = new Suite()
const fn1 = compile(source1)
const fn2 = underscore.template(source2)
const fn3 = lodash.template(source3)
const data = {
  title: 'foo',
  subtitle: 'baz',
  todos: [
    { description: 'lorem ipsum' },
    { description: 'lorem ipsum' },
    { description: 'lorem ipsum' }
  ]
}

suite.add('html-engine', function () {
  fn1(data, escape)
})
  .add('underscore', function () {
    fn2(data)
  })
  .add('lodash', function () {
    fn3(data)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ 'async': true })
