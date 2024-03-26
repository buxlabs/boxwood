const test = require("node:test")
const assert = require("node:assert")
const path = require("path")
const {
  promises: { readFile },
} = require("fs")
const { Suite } = require("benchmark")
const underscore = require("underscore")
const template = require("lodash.template")
const handlebars = require("handlebars")
const mustache = require("mustache")
const { compile } = require("..")

async function benchmark(dir) {
  const source2 = await readFile(
    path.join(__dirname, `./fixtures/${dir}/underscore.ejs`),
    "utf8"
  )
  const source3 = await readFile(
    path.join(__dirname, `./fixtures/${dir}/lodash.ejs`),
    "utf8"
  )
  const source4 = await readFile(
    path.join(__dirname, `./fixtures/${dir}/handlebars.hbs`),
    "utf8"
  )
  const source5 = await readFile(
    path.join(__dirname, `./fixtures/${dir}/mustache.mst`),
    "utf8"
  )

  const suite = new Suite()
  const { template: fn1 } = await compile(
    path.join(__dirname, `./fixtures/${dir}/boxwood.js`)
  )
  const fn2 = underscore.template(source2)
  const fn3 = template(source3)
  const fn4 = handlebars.compile(source4)
  const fn5 = (data) => mustache.render(source5, data)
  const fn6 = require(path.join(__dirname, `./fixtures/${dir}/vanilla.js`))
  mustache.parse(source5)

  const data = require(path.join(__dirname, `./fixtures/${dir}/data.json`))

  function normalize(string) {
    return string.replace(/\s/g, "")
  }
  const result = normalize(fn1(data))

  assert.deepEqual(result, normalize(fn1(data)))
  assert.deepEqual(result, normalize(fn2(data)))
  assert.deepEqual(result, normalize(fn3(data)))
  assert.deepEqual(result, normalize(fn4(data)))
  assert.deepEqual(result, normalize(fn5(data)))
  assert.deepEqual(result, normalize(fn6(data)))

  await new Promise((resolve) => {
    suite
      .add("vanilla[js]", function () {
        fn6(data)
      })
      .add("boxwood[js]", function () {
        fn1(data)
      })
      .add("underscore[ejs]", function () {
        fn2(data)
      })
      .add("lodash[ejs]", function () {
        fn3(data)
      })
      .add("handlebars[hbs]", function () {
        fn4(data)
      })
      .add("mustache[mst]", function () {
        fn5(data)
      })
      .on("cycle", function (event) {
        console.log(`${dir}: ${String(event.target)}`)
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"))
        resolve()
      })
      .run({ async: true })
  })
}

test("benchmark: basic", async () => {
  await benchmark("basic")
})

test("benchmark: escape", async () => {
  await benchmark("escape")
})

test("benchmark: div", async () => {
  await benchmark("div")
})

test("benchmark: if", async () => {
  await benchmark("if")
})

test("benchmark: todos", async () => {
  await benchmark("todos")
})

test("benchmark: friends", async () => {
  await benchmark("friends")
})

test("benchmark: search", async () => {
  await benchmark("search")
})

test("benchmark: projects", async () => {
  await benchmark("projects")
})
