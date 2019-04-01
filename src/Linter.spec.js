import test from 'ava'
import parse from './html/parse'
import Linter from './Linter'

test('Linter: unused components', async t => {
  let linter = new Linter()
  let template = parse('<div></div>')
  t.deepEqual(await await linter.lint({ template }), { warnings: [] })

  linter = new Linter()
  template = parse('<import button from="./foo.html">')
  t.deepEqual(await await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<import button from="./foo.html"><import input from="./input.html"><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

  linter = new Linter()
  template = parse('<import button from="./foo.html"><import input from="./input.html">')
  t.deepEqual(
    await linter.lint({ template }),
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
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<import {button} from="./foo.html">')
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<import { button } from="./foo.html"><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [] })

  linter = new Linter()
  template = parse('<import { button, input } from="./components.html">')
  t.deepEqual(
    await linter.lint({ template }),
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
  t.deepEqual(await linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  linter = new Linter()
  template = parse('<import { button, input } from="./components.html"><input/><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [] })

  linter = new Linter()
  template = parse('<import button, input from="./components.html"><input/>')
  t.deepEqual(await linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  linter = new Linter()
  template = parse('<import button , input from="./components.html"><input/><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [] })

  linter = new Linter()
  template = parse('<require button from="./foo.html">')
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<require button from="./foo.html"><require input from="./input.html"><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'input component is unused' }] })

  linter = new Linter()
  template = parse('<require button from="./foo.html"><require input from="./input.html">')
  t.deepEqual(
    await linter.lint({ template }),
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
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<require {button} from="./foo.html">')
  t.deepEqual(await linter.lint({ template }), { warnings: [{ type: 'UNUSED_COMPONENT', message: 'button component is unused' }] })

  linter = new Linter()
  template = parse('<require { button } from="./foo.html"><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [] })

  linter = new Linter()
  template = parse('<require { button, input } from="./components.html">')
  t.deepEqual(
    await linter.lint({ template }),
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
  t.deepEqual(await linter.lint({ template }), { warnings: [ { type: 'UNUSED_COMPONENT', message: 'button component is unused' } ] })

  linter = new Linter()
  template = parse('<require { button, input } from="./components.html"><input/><button></button>')
  t.deepEqual(await linter.lint({ template }), { warnings: [] })
})

test('Linter: unclosed tags', async assert => {
  let linter = new Linter()
  let source = '<div></div>'
  let template = parse(source)
  let tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

  source = '<h1>foobar<br></h1>'
  template = parse(source)
  tree = { template }
  assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

  // source = '<import button from="./button.html"><button></button>'
  // template = parse(source)
  // tree = { template }
  // assert.deepEqual(await linter.lint(tree, source), { warnings: [] })

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
