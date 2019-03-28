const parse = require('./html/parse')
const Linter = require('./Linter')
const assert = require('assert')

let linter = new Linter()
let template = parse('<div></div>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })

linter = new Linter()
template = parse('<import button from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<import button from="./foo.html"><import input from="./input.html"><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

linter = new Linter()
template = parse('<import button from="./foo.html"><import input from="./input.html">')
assert.deepStrictEqual(
  linter.lint({ template }),
  {
    warnings:
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  }
)

linter = new Linter()
template = parse('<import { button } from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<import {button} from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<import { button } from="./foo.html"><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })

linter = new Linter()
template = parse('<import { button, input } from="./components.html">')
assert.deepStrictEqual(
  linter.lint({ template }),
  {
    warnings:
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  }
)

linter = new Linter()
template = parse('<import { button, input } from="./components.html"><input/>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

linter = new Linter()
template = parse('<import { button, input } from="./components.html"><input/><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })

linter = new Linter()
template = parse('<import button, input from="./components.html"><input/>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

linter = new Linter()
template = parse('<import button , input from="./components.html"><input/><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })

linter = new Linter()
template = parse('<require button from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<require button from="./foo.html"><require input from="./input.html"><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

linter = new Linter()
template = parse('<require button from="./foo.html"><require input from="./input.html">')
assert.deepStrictEqual(
  linter.lint({ template }),
  {
    warnings:
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  }
)

linter = new Linter()
template = parse('<require { button } from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<require {button} from="./foo.html">')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

linter = new Linter()
template = parse('<require { button } from="./foo.html"><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })

linter = new Linter()
template = parse('<require { button, input } from="./components.html">')
assert.deepStrictEqual(
  linter.lint({ template }),
  {
    warnings:
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  }
)

linter = new Linter()
template = parse('<require { button, input } from="./components.html"><input/>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

linter = new Linter()
template = parse('<require { button, input } from="./components.html"><input/><button></button>')
assert.deepStrictEqual(linter.lint({ template }), { warnings: [] })
