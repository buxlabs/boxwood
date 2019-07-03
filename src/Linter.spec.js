import test from 'ava'
import parse from './html/parse'
import Linter from './Linter'

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
  assert.deepEqual(await linter.lint(tree, source), [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ])

  source = '<import { button, input } from="./components.html"><input/><button></button>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [])

  source = '<import button, input from="./components.html"><input/>'
  tree = parse(source)
  assert.deepEqual(await linter.lint(tree, source), [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ])

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
  assert.deepEqual(await linter.lint(tree, source), [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ])

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
