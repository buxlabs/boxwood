import test from 'ava'
import Importer from './Importer'
import parse from './html/parse'
import { join } from 'path'
const fixtures = join(__dirname, '../test/fixtures/Importer')
test('Importer: template has no components', async assert => {
  const tree = parse('<div></div>')
  const importer = new Importer(tree)
  const components = await importer.import()
  assert.deepEqual(components, [])
})

test('Importer: template has one component', async assert => {
  const tree = parse(`<import foo from="./foo.html"><foo/>`)
  const importer = new Importer(tree, {
    paths: [fixtures]
  })
  const components = await importer.import()
  assert.deepEqual(components, [
    {
      name: 'foo',
      source: '<div>foo</div>',
      path: join(fixtures, 'foo.html'),
      files: ['.'],
      warnings: []
    }
  ])
})

test.skip('Importer: template has multiple components', async assert => {
  const tree = parse(`<import foo from="./foo.html"><import bar from="./bar.html"><foo/><bar/>`)
})

test.skip('Importer: template has multiple components with shorthand syntax', async assert => {
  const tree = parse(`<import foo,bar from="."><foo/><bar/>`)
})

test.skip('Importer: template has multiple components with shorthand syntax and spacing', async assert => {
  const tree = parse(`<import {  foo, bar  } from="."><foo/><bar/>`)
})

test.skip('Importer: template has nested components', async assert => {
  const tree = parse(`<import baz from="./baz.html"><baz/>`)
})

test.skip('Importer: template has unknown component', async assert => {
  const tree = parse(`<import unknown from="./unknown.html"><unknown/>`)
})

test.skip('Importer: template has nested components with the same name', async assert => {
  const tree = parse(`<import pages from="./pages.html"><pages/>`)
})
