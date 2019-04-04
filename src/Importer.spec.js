import test from 'ava'
import Importer from './Importer'
import parse from './html/parse'
import { join } from 'path'
const fixtures = join(__dirname, '../test/fixtures/Importer')
test('Importer: template has no components', async assert => {
  const source = '<div></div>'
  const tree = parse(source)
  const importer = new Importer(tree, source)
  const components = await importer.import()
  assert.deepEqual(components, [])
})

test('Importer: template has one component', async assert => {
  const source = `<import foo from="./foo.html"><foo/>`
  const tree = parse(source)
  const importer = new Importer(tree, source, {
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
  const source = `<import foo from="./foo.html"><import bar from="./bar.html"><foo/><bar/>`
  const tree = parse(source)
})

test.skip('Importer: template has multiple components with shorthand syntax', async assert => {
  const source = `<import foo,bar from="."><foo/><bar/>`
  const tree = parse(source)
})

test.skip('Importer: template has multiple components with shorthand syntax and spacing', async assert => {
  const source = `<import {  foo, bar  } from="."><foo/><bar/>`
  const tree = parse(source)
})

test.skip('Importer: template has nested components', async assert => {
  const source = `<import baz from="./baz.html"><baz/>`
  const tree = parse(source)
})

test.skip('Importer: template has unknown component', async assert => {
  const source = `<import unknown from="./unknown.html"><unknown/>`
  const tree = parse(source)
})

test.skip('Importer: template has nested components with the same name', async assert => {
  const source = `<import pages from="./pages.html"><pages/>`
  const tree = parse(source)
})
