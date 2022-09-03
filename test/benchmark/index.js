const test = require('ava')
const path = require('path')
const { promises: { readFile } } = require('fs')
const { Suite } = require('benchmark')
const underscore = require('underscore')
const template = require('lodash.template')
const handlebars = require('handlebars')
const mustache = require('mustache')
const { compile } = require('../..')

async function benchmark (dir, assert) {
  const source2 = await readFile(path.join(__dirname, `./fixtures/${dir}/underscore.ejs`), 'utf8')
  const source3 = await readFile(path.join(__dirname, `./fixtures/${dir}/lodash.ejs`), 'utf8')
  const source4 = await readFile(path.join(__dirname, `./fixtures/${dir}/handlebars.hbs`), 'utf8')
  const source5 = await readFile(path.join(__dirname, `./fixtures/${dir}/mustache.mst`), 'utf8')

  const suite = new Suite()
  const { template: fn1 } = await compile(path.join(__dirname, `./fixtures/${dir}/boxwood.js`))
  const fn2 = underscore.template(source2)
  const fn3 = template(source3)
  const fn4 = handlebars.compile(source4)
  const fn5 = (data) => mustache.render(source5, data)
  const fn6 = require(path.join(__dirname, `./fixtures/${dir}/vanilla.js`))
  mustache.parse(source5)

  const data = require(path.join(__dirname, `./fixtures/${dir}/data.json`))

  function normalize (string) {
    return string.replace(/\s/g, '')
  }
  const result = normalize(fn1(data))

  assert.deepEqual(result, normalize(fn1(data)))
  assert.deepEqual(result, normalize(fn2(data)))
  assert.deepEqual(result, normalize(fn3(data)))
  assert.deepEqual(result, normalize(fn4(data)))
  assert.deepEqual(result, normalize(fn5(data)))
  assert.deepEqual(result, normalize(fn6(data)))

  await new Promise(resolve => {
    suite
      .add('vanilla[js]', function () {
        fn6(data)
      })
      .add('boxwood[js]', function () {
        fn1(data)
      })
      .add('underscore[ejs]', function () {
        fn2(data)
      })
      .add('lodash[ejs]', function () {
        fn3(data)
      })
      .add('handlebars[hbs]', function () {
        fn4(data)
      })
      .add('mustache[mst]', function () {
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

test.serial('benchmark: basic', async assert => {
  await benchmark('basic', assert)
})

test.serial('benchmark: escape', async assert => {
  await benchmark('escape', assert)
})

test.serial('benchmark: div', async assert => {
  await benchmark('div', assert)
})

test.serial('benchmark: if', async assert => {
  await benchmark('if', assert)
})

test.serial('benchmark: todos', async assert => {
  await benchmark('todos', assert)
})

test.serial('benchmark: friends', async assert => {
  await benchmark('friends', assert)
})

test.serial('benchmark: search', async assert => {
  await benchmark('search', assert)
})

test.serial.skip('benchmark: projects', async assert => {
  await benchmark('projects', assert)
})
