'use strict'

const test = require('ava')
const { parse } = require('./utilities/html')
const Linter = require('./Linter')

test('Linter: unused components', async assert => {
  const linter = new Linter()
  let source = '<div></div>'
  let tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<import button from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<import button from="./foo.html"><import input from="./input.html"><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }])

  source = '<import button from="./foo.html"><import input from="./input.html">'
  tree = parse(source)
  assert.deepEqual(
    await linter.lint(tree, source),
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  )

  source = '<import { button } from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<import {button} from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<import { button } from="./foo.html"><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<import { button, input } from="./components.html">'
  tree = parse(source)
  assert.deepEqual(
    await linter.lint(tree, source),
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  )

  source = '<import { button, input } from="./components.html"><input/>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<import { button, input } from="./components.html"><input/><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<import button, input from="./components.html"><input/>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<import button , input from="./components.html"><input/><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<require button from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<require button from="./foo.html"><require input from="./input.html"><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }])

  source = '<require button from="./foo.html"><require input from="./input.html">'
  tree = parse(source)
  assert.deepEqual(
    await linter.lint(tree, source),
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  )

  source = '<require { button } from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<require {button} from="./foo.html">'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<require { button } from="./foo.html"><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<require { button, input } from="./components.html">'
  tree = parse(source)
  assert.deepEqual(
    await linter.lint(tree, source),
    [
      { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
      { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
    ]
  )

  source = '<require { button, input } from="./components.html"><input/>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }])

  source = '<require { button, input } from="./components.html"><input/><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])
})

test('Linter: unclosed tags', async assert => {
  const linter = new Linter()
  let source = '<div></div>'
  let tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<h1>foobar<br></h1>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<import button from="./button.html"><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])
})

test('Linter: duplicate components', async assert => {
  const linter = new Linter()
  const source = `
    <link rel="stylesheet" type="text/css" href="/foo.css" inline>
    <link rel="stylesheet" type="text/css" href="/bar.css" inline>
  `
  const tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source, [
    { tagName: 'link', attributes: [{ key: 'href', value: './foo.css' }] },
    { tagName: 'link', attributes: [{ key: 'href', value: './bar.css' }] }
  ]), [])

  assert.deepEqual(await linter.lint(tree, source, [
    { tagName: 'link', attributes: [{ key: 'href', value: './foo.css' }] },
    { tagName: 'link', attributes: [{ key: 'href', value: './foo.css' }] }
  ]), [{ message: 'Component path duplicate: ./foo.css', type: 'COMPONENT_PATH_DUPLICATE' }])
})

test('Linter: returns a warning if rel attribute is not present for an external link', async assert => {
  const linter = new Linter()
  const source = `<a href="https://foo.bar">bar</a>`
  const tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source, []), [
    { message: 'a tag with external href should have a rel attribute (e.g. rel="noopener")', type: 'REL_ATTRIBUTE_MISSING' }
  ])
})

test('Linter: does not return a warning for a component that uses the a tag name', async assert => {
  const linter = new Linter()
  const source = `
    <import a from="components/a.html"/>
    <a href="https://foo.bar">bar</a>
  `
  const tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source, []), [])
})

test('Linter: returns a warning if alt attribute is not present for an image', async assert => {
  const linter = new Linter()
  const source = `<img src="https://foo.bar/baz.png"/>`
  const tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source, []), [
    { message: 'img tag should have an alt attribute', type: 'ALT_ATTRIBUTE_MISSING' }
  ])
})
