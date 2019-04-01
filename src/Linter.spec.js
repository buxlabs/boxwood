import test from 'ava'
import parse from './html/parse'
import Linter from './Linter'

test('Linter: unused components', async t => {
  const linter = new Linter()
  let source = '<div></div>'
  let template = parse(source)
  let tree = { template }
  t.deepEqual(await await linter.lint(tree, source), { warnings: [] })

  source = '<import button from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<import button from="./foo.html"><import input from="./input.html"><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

  source = '<import button from="./foo.html"><import input from="./input.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(
    await linter.lint(tree, source),
    {
      warnings:
      [
        { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
        { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
      ]
    }
  )

  source = '<import { button } from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<import {button} from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<import { button } from="./foo.html"><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<import { button, input } from="./components.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(
    await linter.lint(tree, source),
    {
      warnings:
      [
        { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
        { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
      ]
    }
  )

  source = '<import { button, input } from="./components.html"><input/>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  source = '<import { button, input } from="./components.html"><input/><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<import button, input from="./components.html"><input/>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  source = '<import button , input from="./components.html"><input/><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<require button from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<require button from="./foo.html"><require input from="./input.html"><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

  source = '<require button from="./foo.html"><require input from="./input.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(
    await linter.lint(tree, source),
    {
      warnings:
      [
        { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
        { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
      ]
    }
  )

  source = '<require { button } from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<require {button} from="./foo.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  source = '<require { button } from="./foo.html"><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<require { button, input } from="./components.html">'
  template = parse(source)
  tree = { template }
  t.deepEqual(
    await linter.lint(tree, source),
    {
      warnings:
      [
        { type: 'UNUSED_COMPONENT', message: 'button component is unused' },
        { type: 'UNUSED_COMPONENT', message: 'input component is unused' }
      ]
    }
  )

  source = '<require { button, input } from="./components.html"><input/>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  source = '<require { button, input } from="./components.html"><input/><button></button>'
  template = parse(source)
  tree = { template }
  t.deepEqual(await linter.lint(tree, source), { warnings: [] })
})

test('Linter: unclosed tags', async assert => {
  const linter = new Linter()
  let source = '<div></div>'
  let template = parse(source)
  let tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<h1>foobar<br></h1>'
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<import button from="./button.html"><button></button>'
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<div>'
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNCLOSED_TAG', message: 'Unclosed tag in line 1' }] })

  source = '<div><p></div>'
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNCLOSED_TAG', message: 'Unclosed tag in line 1' }] })

  source = `
    <ul>
      <li>foo</li>
      <li>bar</li>
      <li>baz
      <li>ban</li>
    </ul>
  `
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [{ type: 'UNCLOSED_TAG', message: 'Unclosed tag in line 5' }] })
})
